"use server";

import { Redis } from "@upstash/redis";

// Initialize Redis client (Adjust based on your actual connection setup)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
// If using ioredis: const redis = new Redis(process.env.REDIS_URL);

export async function getVisitorAchievements(visitorId: string) {
  try {
    // SMEMBERS returns all items in the set
    const achievements = await redis.smembers(
      `visitor:${visitorId}:achievements`,
    );
    return achievements || [];
  } catch (error) {
    console.error("Redis Error (get):", error);
    return [];
  }
}

export async function unlockServerAchievement(
  visitorId: string,
  achievementId: string,
) {
  try {
    const key = `visitor:${visitorId}:achievements`;

    // SADD adds to the set only if it doesn't exist. Returns 1 if added, 0 if exists.
    const added = await redis.sadd(key, achievementId);

    if (added) {
      // Optional: Set expiry to clean up old visitors (e.g., 1 year)
      await redis.expire(key, 31536000);
    }

    return { success: !!added };
  } catch (error) {
    console.error("Redis Error (unlock):", error);
    return { success: false };
  }
}
