import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Defensive Configuration:
// If keys are missing (like in a build step or misconfigured CI),
// we initialize with dummy values to prevent the app from crashing on boot.
// Actual database calls will still fail, but the app will stay alive.
export const redis = new Redis({
  url: redisUrl || "https://failed-to-load-redis-config.com",
  token: redisToken || "missing-token",
});
