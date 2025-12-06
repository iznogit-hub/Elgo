import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// --- MOCK REDIS FOR CI/TESTING ---
// This allows the app to build and pass E2E tests in GitHub Actions
// without needing real credentials or external connections.
class MockRedis {
  private store: Record<string, unknown[]> = {};

  async lpush(key: string, ...values: unknown[]) {
    console.log(`[MockRedis] lpush to ${key}:`, values);
    if (!this.store[key]) this.store[key] = [];
    // Simulate adding to the front of the list
    this.store[key].unshift(...values);
    return this.store[key].length;
  }

  async lrange(key: string, start: number, end: number) {
    const list = this.store[key] || [];
    // Redis LRANGE is inclusive for end, JS slice is exclusive
    // Handle -1 (all) logic roughly if needed, but for our app:
    const effectiveEnd = end === -1 ? undefined : end + 1;
    return list.slice(start, effectiveEnd);
  }
}

// Singleton instance for the mock so data persists across requests in the same process
const mockInstance = new MockRedis();

// --- EXPORT ---
// If credentials exist, use real Upstash. Otherwise, use the Mock.
export const redis =
  redisUrl && redisToken
    ? new Redis({ url: redisUrl, token: redisToken })
    : (mockInstance as unknown as Redis);
// Casting to Redis type to satisfy TypeScript, though we only implemented used methods.
