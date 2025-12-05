"use server";

import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs"; // Import Sentry
import { contactSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import logger from "@/lib/logger"; // Import your new logger

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMessage(formData: FormData) {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") || "unknown";
  const userAgent = headerStore.get("user-agent") || "unknown";

  // 1. Rate Limit
  try {
    await checkRateLimit(ip);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    logger.warn({ ip, userAgent }, "Rate limit exceeded");
    return { error: "Too many requests. Please try again later." };
  }

  // ... (Validation Logic remains the same) ...
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  const result = contactSchema.safeParse(rawData);
  if (!result.success) return { error: "Validation failed." };

  try {
    // 3. Send Email
    const data = await resend.emails.send({
      // ... existing email config ...
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: "a.hitelare2@gmail.com",
      replyTo: result.data.email,
      subject: `New Transmission from ${result.data.name}`,
      text: `Name: ${result.data.name}\nEmail: ${result.data.email}\n\nMessage:\n${result.data.message}`,
    });

    if (data.error) {
      // Log structured error
      logger.error(
        { error: data.error, email: result.data.email },
        "Resend API Error"
      );
      return { error: data.error.message };
    }

    logger.info({ email: result.data.email }, "Email sent successfully");
    return { success: true };
  } catch (error) {
    // 4. Advanced Sentry Reporting
    Sentry.withScope((scope) => {
      scope.setTag("action", "send-message");
      scope.setUser({ ip_address: ip });
      scope.setContext("headers", { user_agent: userAgent });
      scope.setContext("payload", {
        email: result.data.email,
        name: result.data.name,
      });
      Sentry.captureException(error);
    });

    logger.error({ error }, "Unexpected error in sendMessage");
    return { error: "Transmission failed. Please try again." };
  }
}
