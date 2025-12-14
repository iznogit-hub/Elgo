"use server";

import { signIn, signOut } from "@/auth";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

export async function login(provider: string) {
  await signIn(provider);
}

export async function logout() {
  await signOut();
}

export async function verifyAdminSecret(secret: string) {
  // Rate Limit: Brute force protection
  try {
    const headerStore = await headers();
    const ip = headerStore.get("x-forwarded-for") || "unknown";
    await checkRateLimit(ip, "core");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: "Too many attempts. Try again later." };
  }

  // Simple check against server-side env
  if (secret === process.env.ADMIN_SECRET) {
    return { success: true };
  }
  return { error: "Invalid override code." };
}
