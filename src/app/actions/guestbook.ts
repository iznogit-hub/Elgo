"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redis } from "@/lib/redis";
import { checkRateLimit } from "@/lib/rate-limit"; // Reusing your existing rate limiter
import logger from "@/lib/logger";
import { headers } from "next/headers";

// Validation Schema
const entrySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(32, "Name is too long"),
  message: z
    .string()
    .min(2, "Message is too short")
    .max(140, "Message is too long"),
});

export async function signGuestbook(formData: FormData) {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") || "unknown";

  // 1. Rate Limiting (In-memory for now, can be upgraded to Redis later)
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
    return { error: validation.error.flatten().fieldErrors };
  }

  const { name, message } = validation.data;

  // 3. Persist to Redis
  // We store entries as a JSON string in a Redis List called "guestbook"
  const entry = {
    name,
    message,
    timestamp: Date.now(),
  };

  try {
    // LPUSH adds to the head of the list (newest first)
    await redis.lpush("guestbook", entry);

    // Optional: Trim list to keep only the last 100 entries to manage storage
    // await redis.ltrim("guestbook", 0, 99);

    logger.info({ name }, "Guestbook signed successfully");

    // 4. Revalidate cache
    revalidatePath("/guestbook");

    return { success: true };
  } catch (error) {
    logger.error({ error }, "Redis error signing guestbook");
    return { error: "Failed to sign guestbook. System error." };
  }
}
