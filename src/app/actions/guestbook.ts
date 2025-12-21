/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { Filter } from "bad-words";
import { redis } from "@/lib/redis";
import { checkRateLimit } from "@/lib/rate-limit";
import logger from "@/lib/logger";
import { headers } from "next/headers";
import { auth } from "@/auth";

// --- 1. ENHANCED LOCAL FILTER ---
const filter = new Filter();

// Common profanity evasions, acronyms & leetspeak
const evasions = [
  // F-Word Variants
  "fk",
  "fck",
  "fuk",
  "fuhk",
  "fugh",
  "f.u.c.k",
  "f u c k",
  "f*ck",
  "f@ck",
  "dafuk",
  "dafuq",
  "mf",
  "mfer",
  "mofo",

  // S-Word Variants
  "sh1t",
  "sh!t",
  "shyt",
  "shiit",
  "sh*t",
  "sh.it",
  "sheet",

  // B-Word Variants
  "b1tch",
  "b!tch",
  "biatch",
  "b*tch",
  "b.i.t.c.h",

  // Anatomy / Sexual
  "dik",
  "d1k",
  "d1ck",
  "c0ck",
  "pp",
  "puss",
  "pussi",
  "pussy",
  "wank",
  "wanker",
  "jerko",
  "bj",
  "succ",

  // Insults / Ableist / Hate
  "smooth brain",
  "regarded",
  "rtd",
  "autist",
  "spaz",
  "mong",
  "simp",
  "incel",
  "virgin",
  "cuck",
  "soyboy",
  "retard",

  // Hostile Acronyms
  "stfu",
  "gtfo",
  "kys",
  "oms",
  "diaf",
  "idgaf",
];

filter.addWords(...evasions);

// Helper to catch "s p a c e d" or "L.3.3.T" evasions
const normalizeText = (text: string) =>
  text.replace(/[\s.]+/g, "").toLowerCase();

// --- Types ---
interface HuggingFaceScore {
  label: string;
  score: number;
}

export type GuestbookEntry = {
  name: string;
  message: string;
  timestamp: number;
  avatar?: string;
  verified?: boolean;
  provider?: "github" | "discord" | "google";
};

export interface GuestbookState {
  success: boolean;
  message?: string;
  errors?: {
    message?: string[];
  };
  timestamp?: number;
  newEntry?: GuestbookEntry;
}

function sanitizeEntry(entry: GuestbookEntry) {
  return Object.fromEntries(
    Object.entries(entry).filter(([_, v]) => v != null),
  );
}

// --- SCHEMAS ---
const englishWithEmojisRegex =
  /^[\x20-\x7E\n\r\p{Extended_Pictographic}\p{Emoji_Component}]+$/u;

const messageSchema = z
  .string()
  .trim()
  .min(3, "Message is too short (min 3 chars)")
  .max(500, "Message is too long (max 500 chars)")
  .regex(
    englishWithEmojisRegex,
    "Only English letters, numbers, symbols, and emojis are allowed.",
  );

// --- CACHED DATA FETCHING ---
export async function fetchGuestbookEntries(
  offset: number,
  limit: number = 20,
): Promise<GuestbookEntry[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("guestbook-entries", "guestbook");

  const start = offset;
  const end = offset + limit - 1;

  try {
    const entries = await redis.lrange<GuestbookEntry>("guestbook", start, end);
    return entries ?? [];
  } catch (error) {
    console.error("Redis Read Error:", error);
    return [];
  }
}

// --- 2. SIGN ACTION ---
export async function signGuestbook(
  prevState: GuestbookState,
  formData: FormData,
): Promise<GuestbookState> {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      message: "You must be logged in to sign the guestbook.",
      timestamp: Date.now(),
    };
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") || "unknown";

  // Rate Limiting
  try {
    await checkRateLimit(ip, "guestbook");
  } catch (error) {
    logger.warn({ ip }, "Guestbook rate limit exceeded");
    return {
      success: false,
      message: error instanceof Error ? error.message : "Rate limit exceeded",
      timestamp: Date.now(),
    };
  }

  const rawMessage = formData.get("message");

  const name = session.user.name || "Verified User";
  const avatar = session.user.image || undefined;
  const verified = true;
  let provider: "github" | "discord" | "google" | undefined;

  if (avatar?.includes("github")) provider = "github";
  else if (avatar?.includes("discord")) provider = "discord";
  else if (avatar?.includes("google")) provider = "google";

  const messageValidation = messageSchema.safeParse(rawMessage);
  if (!messageValidation.success) {
    return {
      success: false,
      errors: { message: [messageValidation.error.issues[0].message] },
      timestamp: Date.now(),
    };
  }
  const message = messageValidation.data;

  // --- 3. LAYER 1: LOCAL FILTER (Instant + Pattern Matching) ---
  try {
    // Standard Check (Exact words)
    if (filter.isProfane(message) || filter.isProfane(name)) {
      return {
        success: false,
        message: "Profanity detected. Please keep it clean.",
        timestamp: Date.now(),
      };
    }

    // Pattern Check (Spaced/Normalized)
    if (filter.isProfane(normalizeText(message))) {
      return {
        success: false,
        message: "Nice try. Please keep it clean.",
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    logger.error({ error }, "Moderation error");
  }

  // --- 4. LAYER 2: AI FILTER (Deep Semantic) ---
  const hfToken = process.env.HUGGING_FACE_TOKEN;
  if (hfToken) {
    try {
      const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/unitary/toxic-bert",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: `${name}: ${message}` }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        const scores = result[0];

        // Threshold tuned to 0.70 to catch subtle toxicity
        const toxicScore = scores.find((s: HuggingFaceScore) => s.score > 0.7);

        if (toxicScore) {
          return {
            success: false,
            message: "Message blocked by AI safety filters.",
            timestamp: Date.now(),
          };
        }
      }
    } catch (error) {
      logger.error({ error }, "AI Moderation network error");
      return {
        success: false,
        message: "Unable to verify message safety.",
        timestamp: Date.now(),
      };
    }
  }

  // Persist
  const entry: GuestbookEntry = {
    name,
    message,
    timestamp: Date.now(),
    avatar,
    verified,
    provider,
  };

  try {
    await redis.lpush("guestbook", entry);
    logger.info({ name, verified }, "Guestbook signed successfully");

    revalidateTag("guestbook", { expire: 0 });

    return {
      success: true,
      message: "Signature encoded successfully.",
      newEntry: entry,
      timestamp: Date.now(),
    };
  } catch (error) {
    Sentry.captureException(error);
    return {
      success: false,
      message: "Database write error.",
      timestamp: Date.now(),
    };
  }
}

export async function deleteGuestbookEntry(entry: GuestbookEntry) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Access Denied" };

  try {
    const cleanEntry = sanitizeEntry(entry);
    await redis.lrem("guestbook", 1, JSON.stringify(cleanEntry));

    revalidateTag("guestbook", { expire: 0 });

    return { success: true };
  } catch (error) {
    return { error: "Delete failed" };
  }
}

export async function purgeGuestbook() {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Access Denied" };

  try {
    await redis.del("guestbook");

    revalidateTag("guestbook", { expire: 0 });

    return { success: true };
  } catch (error) {
    return { error: "Purge failed" };
  }
}
