"use server";

import { redis } from "@/lib/redis"; // <--- Import shared client

export async function getVisitorAchievements(visitorId: string) {
  try {
    // SMEMBERS returns all items in the set
    const achievements = await redis.smembers<string[]>(
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

    // SADD adds to the set only if it doesn't exist.
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
