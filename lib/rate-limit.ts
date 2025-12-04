import { RateLimiterMemory } from "rate-limiter-flexible";

const opts = {
  points: 5, // 5 requests
  duration: 60, // Per 60 seconds
};

const rateLimiter = new RateLimiterMemory(opts);

export async function checkRateLimit(ip: string) {
  try {
    await rateLimiter.consume(ip);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (rateLimiterRes) {
    throw new Error("Too many requests. Please try again later.");
  }
}
