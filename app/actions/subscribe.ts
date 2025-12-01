"use server";

import { Resend } from "resend";
import { newsletterSchema } from "@/lib/validators";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function subscribe(formData: FormData) {
  const email = formData.get("email");
  const result = newsletterSchema.safeParse({ email });

  if (!result.success) {
    return { error: "Invalid email address." };
  }

  try {
    const data = await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      // FIXED: Must match your Resend account email while in testing mode
      to: "a.hitelare2@gmail.com",
      subject: "New Portfolio Subscriber 🚀",
      text: `New subscriber: ${result.data.email}`,
    });

    if (data.error) {
      return { error: data.error.message };
    }

    return { success: true };
  } catch (error) {
    return { error: "Something went wrong. Please try again." };
  }
}
