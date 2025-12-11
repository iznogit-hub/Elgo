"use server";

import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";
import { contactSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import logger from "@/lib/logger";

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Define the State Interface
export interface ContactState {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
  };
  timestamp?: number;
}

// 2. Update Function Signature
export async function sendMessage(
  prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") || "unknown";
  const userAgent = headerStore.get("user-agent") || "unknown";

  // Rate Limit
  try {
    await checkRateLimit(ip);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    logger.warn({ ip, userAgent }, "Rate limit exceeded");
    return {
      success: false,
      message: "Rate limit exceeded. System cooling down...",
      timestamp: Date.now(),
    };
  }

  // Validation
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  const validatedFields = contactSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Check your inputs.",
      timestamp: Date.now(),
    };
  }

  const { name, email, message } = validatedFields.data;

  // Execution
  try {
    const data = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: "a.hitelare2@gmail.com",
      replyTo: email,
      subject: `New Transmission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    if (data.error) {
      logger.error({ error: data.error, email }, "Resend API Error");
      return {
        success: false,
        message: "Signal jamming detected (API Error).",
        timestamp: Date.now(),
      };
    }

    logger.info({ email }, "Email sent successfully");
    return {
      success: true,
      message: "Transmission sent successfully.",
      timestamp: Date.now(),
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("action", "send-message");
      scope.setUser({ ip_address: ip });
      scope.setContext("headers", { user_agent: userAgent });
      scope.setContext("payload", { email, name });
      Sentry.captureException(error);
    });

    logger.error({ error }, "Unexpected error in sendMessage");
    return {
      success: false,
      message: "Critical transmission error. Please retry.",
      timestamp: Date.now(),
    };
  }
}
