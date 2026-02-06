import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { checkRateLimit } from "./rate-limit";

// 1. Mock 'rate-limiter-flexible'
vi.mock("rate-limiter-flexible", () => {
  return {
    RateLimiterMemory: class {
      consume() {
        return Promise.resolve();
      }
    },
  };
});

// 2. Mock '@upstash/ratelimit' as a Class
vi.mock("@upstash/ratelimit", () => {
  return {
    Ratelimit: class {
      // Mock the limit method to return success by default
      limit = vi.fn().mockResolvedValue({ success: true });
      // Static method mocking
      static slidingWindow = vi.fn();
    },
  };
});

// 3. Mock the Redis client
vi.mock("@/lib/redis", () => ({
  redis: {},
}));

describe("rate-limit", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("uses Memory Limiter when Redis creds are missing (Dev/CI Mode)", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    await expect(checkRateLimit("test-ip")).resolves.not.toThrow();
  });

  it("throws error when limit is exceeded", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;

    // Override the consume method to simulate failure
    vi.mocked(
      await import("rate-limiter-flexible"),
    ).RateLimiterMemory.prototype.consume = vi
      .fn()
      .mockRejectedValue(new Error("No points"));

    await expect(checkRateLimit("spammer-ip")).rejects.toThrow(
      "Rate limit exceeded. Please try again later.",
    );
  });
});
