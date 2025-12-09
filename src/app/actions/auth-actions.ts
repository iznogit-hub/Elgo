"use server";

import { signIn, signOut } from "@/auth";

export async function login(provider: string) {
  await signIn(provider);
}

export async function logout() {
  await signOut();
}

export async function verifyAdminSecret(secret: string) {
  // Simple check against server-side env
  if (secret === process.env.ADMIN_SECRET) {
    return { success: true };
  }
  return { error: "Invalid override code." };
}
