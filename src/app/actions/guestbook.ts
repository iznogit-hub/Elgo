"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { Filter } from "bad-words";
import { redis } from "@/lib/redis";
import { checkRateLimit } from "@/lib/rate-limit";
import logger from "@/lib/logger";
import { headers } from "next/headers";

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
};

// Validation Schema
const entrySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(32, "Name is too long")
    .regex(
      /^[\x20-\x7E]+$/,
      "Only English letters, numbers, and symbols are allowed."
    ),
  message: z
    .string()
    .min(2, "Message is too short")
    .max(140, "Message is too long")
    .regex(
      /^[\x20-\x7E]+$/,
      "Only English letters, numbers, and symbols are allowed."
    ),
});

export async function signGuestbook(formData: FormData) {
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

  // 2. Validation
  const rawData = {
    name: formData.get("name"),
    message: formData.get("message"),
  };

  const validation = entrySchema.safeParse(rawData);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    const firstError =
      errors.name?.[0] || errors.message?.[0] || "Invalid input.";
    return { error: firstError };
  }

  const { name, message } = validation.data;

  // 3. Local Moderation (Fast Fail)
  try {
    if (filter.isProfane(name) || filter.isProfane(message)) {
      logger.warn({ name, ip }, "Profanity detected (local filter)");
      return { error: "Please keep the frequency clean. Profanity detected." };
    }
  } catch (error) {
    logger.error({ error }, "Local filter error");
  }

  // 4. AI Moderation (Hugging Face - New Router)
  const hfToken = process.env.HUGGING_FACE_TOKEN;

  if (hfToken) {
    try {
      // UPDATED: Using the new Router URL structure
      // Format: https://router.huggingface.co/{provider}/models/{model_id}
      // Provider: 'hf-inference' (The free serverless tier)
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

  // 5. Persist to Redis
  const entry = {
    name,
    message,
    timestamp: Date.now(),
  };

  try {
    await redis.lpush("guestbook", entry);
    logger.info({ name }, "Guestbook signed successfully");
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

/**
 * NEW: Fetch entries with pagination
 * @param offset - Number of entries to skip
 * @param limit - Number of entries to take (default 20)
 */
export async function fetchGuestbookEntries(
  offset: number,
  limit: number = 20
): Promise<GuestbookEntry[]> {
  try {
    // Redis LRANGE is inclusive for both start and stop offsets
    // If we want 20 items starting at 0: 0 to 19
    const start = offset;
    const end = offset + limit - 1;

    const entries = await redis.lrange<GuestbookEntry>("guestbook", start, end);

    return entries ?? [];
  } catch (error) {
    logger.error({ error }, "Failed to fetch guestbook entries");
    return [];
  }
}

/**
 * Remove a specific entry from the Guestbook.
 * Requires the ADMIN_SECRET environment variable.
 */
export async function deleteGuestbookEntry(
  entry: GuestbookEntry,
  secret: string
) {
  // 1. Security Check
  if (secret !== process.env.ADMIN_SECRET) {
    return { error: "ACCESS_DENIED: Invalid override code." };
  }

  try {
    // 2. Remove from Redis
    // LREM removes elements matching the value.
    // We serialize the entry to find the exact match in the list.
    const entryString = JSON.stringify(entry);
    const removedCount = await redis.lrem("guestbook", 1, entryString);

    if (removedCount === 0) {
      return { error: "Entry not found (already deleted?)" };
    }

    logger.info({ name: entry.name }, "Guestbook entry deleted by admin");

    revalidatePath("/guestbook");
    return { success: true };
  } catch (error) {
    logger.error({ error }, "Failed to delete guestbook entry");
    return { error: "System error during deletion." };
  }
}

/**
 * ☢️ DANGER: Deletes ALL entries in the guestbook.
 * Requires the ADMIN_SECRET environment variable.
 */
export async function purgeGuestbook(secret: string) {
  // 1. Security Check
  if (secret !== process.env.ADMIN_SECRET) {
    return { error: "ACCESS_DENIED: Invalid override code." };
  }

  try {
    // 2. Nuke the Redis Key
    // DEL removes the key entirely, effectively clearing the list.
    await redis.del("guestbook");

    logger.warn({}, "Guestbook PURGED by admin");

    revalidatePath("/guestbook");
    return { success: true };
  } catch (error) {
    logger.error({ error }, "Failed to purge guestbook");
    return { error: "System error during purge." };
  }
}
