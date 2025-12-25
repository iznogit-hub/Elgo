"use server";

import { redis } from "@/lib/redis";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function getVisitorAchievements(visitorId: string) {
  try {
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
    // 1. SECURITY: Rate Limit by IP
    const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
    await checkRateLimit(ip, "achievements");

    // 2. LOGIC: Unlock
    const key = `visitor:${visitorId}:achievements`;
    const added = await redis.sadd(key, achievementId);

    if (added) {
      // Set expiry to 1 year (cleaner DB)
      await redis.expire(key, 31536000);
    }

    return { success: !!added };
  } catch (error) {
    // If it's a rate limit error, return specific failure so UI can handle it if needed
    if (error instanceof Error && error.message.includes("Rate limit")) {
      console.warn(`Rate limit hit for achievements by IP: ${visitorId}`); // Log warning
      return { success: false, error: "Rate limit exceeded" };
    }

    console.error("Redis Error (unlock):", error);
    return { success: false };
  }
}
