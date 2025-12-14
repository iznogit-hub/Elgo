import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import { RateLimiterMemory } from "rate-limiter-flexible";

export type RateLimitType = "core" | "guestbook" | "contact";

// --- Configuration ---
const LIMITERS: Record<
  RateLimitType,
  { points: number; duration: Duration; blockDuration: number }
> = {
  core: { points: 20, duration: "60 s", blockDuration: 60 }, // 20 req / 1 min
  guestbook: { points: 5, duration: "60 s", blockDuration: 60 }, // 5 req / 1 min
  contact: { points: 3, duration: "1 h", blockDuration: 60 * 60 }, // 3 req / 1 hour
};

// --- Cache Containers ---
const redisLimiters = new Map<RateLimitType, Ratelimit>();
const memoryLimiters = new Map<RateLimitType, RateLimiterMemory>();

function getRedisLimiter(type: RateLimitType): Ratelimit {
  if (!redisLimiters.has(type)) {
    const config = LIMITERS[type];
    redisLimiters.set(
      type,
      new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(config.points, config.duration),
        analytics: true,
        prefix: `@upstash/ratelimit/${type}`,
      }),
    );
  }
  return redisLimiters.get(type)!;
}

function getMemoryLimiter(type: RateLimitType): RateLimiterMemory {
  if (!memoryLimiters.has(type)) {
    const config = LIMITERS[type];
    memoryLimiters.set(
      type,
      new RateLimiterMemory({
        points: config.points,
        duration: config.blockDuration,
      }),
    );
  }
  return memoryLimiters.get(type)!;
}

export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = "core",
) {
  // 1. BYPASS: Check for CI/Test environment
  // BUT: intentionally allow "6.6.6.6" (used in security tests) to hit the limiter
  if (process.env.SKIP_RATE_LIMIT === "true" && identifier !== "6.6.6.6") {
    return;
  }

  const isProductionRedis =
    !!process.env.UPSTASH_REDIS_REST_URL &&
    !!process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    if (isProductionRedis) {
      // --- REDIS MODE ---
      const limiter = getRedisLimiter(type);
      const { success, reset } = await limiter.limit(identifier);

      if (!success) {
        const now = Date.now();
        const retryAfter = Math.ceil((reset - now) / 1000);
        throw new Error(`Rate limit exceeded. Try again in ${retryAfter}s.`);
      }
    } else {
      // --- MEMORY MODE ---
      const limiter = getMemoryLimiter(type);
      await limiter.consume(identifier);
    }
  } catch (error) {
    // Redis mode throws specific errors we want to keep.
    if (
      error instanceof Error &&
      error.message.startsWith("Rate limit exceeded")
    ) {
      throw error;
    }

    // Memory mode (or other errors) usually throw generic errors.
    // We normalize this message so the UI (and Tests) see "Rate limit exceeded"
    throw new Error("Rate limit exceeded. Please try again later.");
  }
}
