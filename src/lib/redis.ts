import { Redis } from "@upstash/redis";

// 1. Safe Configuration
// We provide dummy values so the build passes even if you haven't set up .env.local yet.
// The rate-limit.ts file checks for valid keys before actually trying to use this.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || "https://example.com";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || "example_token";

// 2. Export the Client
export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});