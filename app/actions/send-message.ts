"use server";

import { Resend } from "resend";
import { contactSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMessage(formData: FormData) {
  // 1. Rate Limit Check
  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";

  try {
    await checkRateLimit(ip);
  } catch (error: unknown) {
    // Type Guard: Check if 'error' is actually an Error object
    if (error instanceof Error) {
      return { error: error.message };
    }
    // Fallback for unexpected error types
    return { error: "Too many requests. Please try again later." };
  }

  // 2. Validate Input
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  const result = contactSchema.safeParse(rawData);

  if (!result.success) {
    return { error: "Validation failed. Please check your inputs." };
  }

  try {
    // 3. Send Email
    const data = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: "a.hitelare2@gmail.com",
      replyTo: result.data.email,
      subject: `New Transmission from ${result.data.name}`,
      text: `Name: ${result.data.name}\nEmail: ${result.data.email}\n\nMessage:\n${result.data.message}`,
    });

    if (data.error) {
      return { error: data.error.message };
    }

    return { success: true };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: "Transmission failed. Please try again." };
  }
}
