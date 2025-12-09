"use server";

import { revalidatePath } from "next/cache";
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
  // New Fields for Verified Identity
  avatar?: string;
  verified?: boolean;
  provider?: "github" | "discord" | "google";
};

// --- Validation Schemas ---

// Message is validated for everyone
const messageSchema = z
  .string()
  .min(2, "Message is too short")
  .max(140, "Message is too long")
  .regex(
    /^[\x20-\x7E]+$/,
    "Only English letters, numbers, and symbols are allowed."
  );

// Name is only validated for Anonymous users
const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(32, "Name is too long")
  .regex(
    /^[\x20-\x7E]+$/,
    "Only English letters, numbers, and symbols are allowed."
  );

// --- 1. Sign Guestbook Action ---
export async function signGuestbook(formData: FormData) {
  const session = await auth(); // Check active session
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") || "unknown";

  // 1. Rate Limiting
  try {
    await checkRateLimit(ip);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    logger.warn({ ip }, "Guestbook rate limit exceeded");
    return { error: "You are doing that too much. Please try again later." };
  }

  const rawMessage = formData.get("message");
  const rawName = formData.get("name");

  // 2. Determine Identity (Verified vs Anonymous)
  let name: string;
  let avatar: string | undefined;
  let verified = false;
  let provider: "github" | "discord" | "google" | undefined;

  if (session?.user) {
    // --- VERIFIED PATH ---
    // Trust the session data provided by OAuth
    name = session.user.name || "Verified User";
    avatar = session.user.image || undefined;
    verified = true;

    // Heuristic to detect provider from avatar URL
    if (avatar?.includes("github")) provider = "github";
    else if (avatar?.includes("discord")) provider = "discord";
    else if (avatar?.includes("google")) provider = "google";
  } else {
    // --- ANONYMOUS PATH ---
    // Strict validation for user-input names
    const nameValidation = nameSchema.safeParse(rawName);
    if (!nameValidation.success) {
      return {
        error: "Invalid name. " + nameValidation.error.issues[0].message,
      };
    }
    name = nameValidation.data;
  }

  // 3. Validate Message
  const messageValidation = messageSchema.safeParse(rawMessage);
  if (!messageValidation.success) {
    return { error: messageValidation.error.issues[0].message };
  }
  const message = messageValidation.data;

  // 4. Moderation (Profanity)
  try {
    // We check the message for everyone.
    // We only check the NAME if it's anonymous (Verified names are trusted/handled by providers).
    if (filter.isProfane(message) || (!verified && filter.isProfane(name))) {
      logger.warn({ name, ip }, "Profanity detected (local filter)");
      return { error: "Profanity detected. Please keep it clean." };
    }
  } catch (error) {
    logger.error({ error }, "Moderation error");
  }

  // 5. AI Safety Check (Hugging Face)
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
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Result: [[{label: 'toxic', score: 0.9}, ...]]
        const scores = result[0];

        // Check for any toxic label with high confidence (>85%)
        // unitary/toxic-bert labels: toxic, severe_toxic, obscene, threat, insult, identity_hate
        const toxicScore = scores.find((s: HuggingFaceScore) => s.score > 0.85);

        if (toxicScore) {
          logger.warn(
            { name, ip, score: toxicScore },
            "AI Moderation flagged content"
          );
          return { error: "Message blocked by AI safety filters." };
        }
      } else {
        // FAIL CLOSED: If API fails, block the user to maintain security.
        logger.error({ status: response.status }, "Hugging Face API error");
        return {
          error: "Security check failed. Please try again later.",
        };
      }
    } catch (error) {
      // FAIL CLOSED: Network error blocks user.
      logger.error({ error }, "AI Moderation network error");
      return {
        error: "Unable to verify message safety. Please try again later.",
      };
    }
  } else {
    // If no token, we rely ONLY on the local filter (or you can choose to fail here too)
    logger.warn({}, "HUGGING_FACE_TOKEN missing, relying on local filter only");
  }

  // 6. Persist to Redis
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
    revalidatePath("/guestbook");
    return { success: true };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: "sign_guestbook" },
      user: { ip_address: ip },
      extra: { name, message_length: message.length },
    });
    logger.error({ error }, "Redis error signing guestbook");
    return { error: "Failed to sign guestbook. System error." };
  }
}

// --- 2. Fetch Entries Action ---
export async function fetchGuestbookEntries(
  offset: number,
  limit: number = 20
): Promise<GuestbookEntry[]> {
  try {
    const start = offset;
    const end = offset + limit - 1;
    const entries = await redis.lrange<GuestbookEntry>("guestbook", start, end);
    return entries ?? [];
  } catch (error) {
    logger.error({ error }, "Failed to fetch guestbook entries");
    return [];
  }
}

// --- 3. Delete Entry Action (Admin) ---
export async function deleteGuestbookEntry(entry: GuestbookEntry) {
  const session = await auth();

  // SECURITY CHECK: Must be logged in AND be an admin
  if (!session?.user?.isAdmin) {
    logger.warn({ user: session?.user?.name }, "Unauthorized delete attempt");
    return { error: "ACCESS_DENIED: Insufficient clearance level." };
  }

  try {
    const entryString = JSON.stringify(entry);
    const removedCount = await redis.lrem("guestbook", 1, entryString);

    if (removedCount === 0) {
      return { error: "Entry not found (already deleted?)" };
    }

    logger.info(
      { admin: session.user.email, target: entry.name },
      "Guestbook entry deleted by admin"
    );
    revalidatePath("/guestbook");
    return { success: true };
  } catch (error) {
    logger.error({ error }, "Failed to delete guestbook entry");
    return { error: "System error during deletion." };
  }
}

// --- 4. Purge All Action (RBAC Protected) ---
export async function purgeGuestbook() {
  const session = await auth();

  // SECURITY CHECK
  if (!session?.user?.isAdmin) {
    return { error: "ACCESS_DENIED: Insufficient clearance level." };
  }

  try {
    await redis.del("guestbook");
    logger.warn({ admin: session.user.email }, "Guestbook PURGED by admin");
    revalidatePath("/guestbook");
    return { success: true };
  } catch (error) {
    logger.error({ error }, "Failed to purge guestbook");
    return { error: "System error during purge." };
  }
}
