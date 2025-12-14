/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { Filter } from "bad-words";
import { redis } from "@/lib/redis";
import { checkRateLimit } from "@/lib/rate-limit";
import logger from "@/lib/logger";
import { headers } from "next/headers";
import { auth } from "@/auth";

const filter = new Filter();

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

// 1. Standardized State Interface
export interface GuestbookState {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
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

// --- Validation Schemas ---
const messageSchema = z
  .string()
  .min(2, "Message is too short")
  .max(140, "Message is too long")
  .regex(
    /^[\x20-\x7E]+$/,
    "Only English letters, numbers, and symbols are allowed.",
  );

const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(32, "Name is too long")
  .regex(
    /^[\x20-\x7E]+$/,
    "Only English letters, numbers, and symbols are allowed.",
  );

// --- CACHED DATA FETCHING ---
const getCachedEntries = unstable_cache(
  async (start: number, end: number) => {
    try {
      return await redis.lrange<GuestbookEntry>("guestbook", start, end);
    } catch (error) {
      return [];
    }
  },
  ["guestbook-entries"],
  {
    revalidate: 3600,
    tags: ["guestbook"],
  },
);

// --- 2. Sign Guestbook Action ---
export async function signGuestbook(
  prevState: GuestbookState,
  formData: FormData,
): Promise<GuestbookState> {
  const session = await auth();
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") || "unknown";

  // Rate Limiting (Targeted)
  try {
    // FIX: Applied "guestbook" limit (5 req/min)
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
  const rawName = formData.get("name");

  // Determine Identity
  let name: string;
  let avatar: string | undefined;
  let verified = false;
  let provider: "github" | "discord" | "google" | undefined;

  if (session?.user) {
    name = session.user.name || "Verified User";
    avatar = session.user.image || undefined;
    verified = true;

    if (avatar?.includes("github")) provider = "github";
    else if (avatar?.includes("discord")) provider = "discord";
    else if (avatar?.includes("google")) provider = "google";
  } else {
    const nameValidation = nameSchema.safeParse(rawName);
    if (!nameValidation.success) {
      return {
        success: false,
        errors: { name: [nameValidation.error.issues[0].message] },
        timestamp: Date.now(),
      };
    }
    name = nameValidation.data;
  }

  // Validate Message
  const messageValidation = messageSchema.safeParse(rawMessage);
  if (!messageValidation.success) {
    return {
      success: false,
      errors: { message: [messageValidation.error.issues[0].message] },
      timestamp: Date.now(),
    };
  }
  const message = messageValidation.data;

  // Moderation
  try {
    if (filter.isProfane(message) || (!verified && filter.isProfane(name))) {
      return {
        success: false,
        message: "Profanity detected. Please keep it clean.",
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    logger.error({ error }, "Moderation error");
  }

  // AI Safety Check
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
        const toxicScore = scores.find((s: HuggingFaceScore) => s.score > 0.85);

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
    revalidatePath("/guestbook", "page");

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

export async function fetchGuestbookEntries(
  offset: number,
  limit: number = 20,
): Promise<GuestbookEntry[]> {
  const start = offset;
  const end = offset + limit - 1;
  const entries = await getCachedEntries(start, end);
  return entries ?? [];
}

export async function deleteGuestbookEntry(entry: GuestbookEntry) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Access Denied" };

  try {
    const cleanEntry = sanitizeEntry(entry);
    await redis.lrem("guestbook", 1, JSON.stringify(cleanEntry));

    revalidateTag("guestbook", { expire: 0 });
    revalidatePath("/guestbook", "page");

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
    revalidatePath("/guestbook", "page");

    return { success: true };
  } catch (error) {
    return { error: "Purge failed" };
  }
}
