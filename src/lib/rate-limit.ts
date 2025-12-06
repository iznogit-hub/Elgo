import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import { RateLimiterMemory } from "rate-limiter-flexible";

// 1. Fallback Limiter (Memory)
// Used during CI tests or local dev without credentials
const memoryLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 60, // Per 60 seconds
});

// 2. Production Limiter (Redis)
// Uses a sliding window algorithm for better accuracy
const redisLimiter = new Ratelimit({
  redis: redis, // Uses the client we configured (or the mock)
  limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 requests per 60s
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export async function checkRateLimit(identifier: string) {
  // DETECT MODE: Check if we are running with real credentials
  const isProductionRedis =
    !!process.env.UPSTASH_REDIS_REST_URL &&
    !!process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    if (isProductionRedis) {
      // --- REDIS MODE ---
      const { success } = await redisLimiter.limit(identifier);
      if (!success) {
        throw new Error("Too many requests. Please try again later.");
      }
    } else {
      // --- MEMORY MODE ---
      // Note: This relies on the memory limiter's Promise rejection for failure
      await memoryLimiter.consume(identifier);
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Standardize the error message for the frontend
    throw new Error("Too many requests. Please try again later.");
  }
}
