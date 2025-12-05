import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export type NewsletterFormValues = z.infer<typeof newsletterSchema>;

// ADD THIS: Contact Form Schema
export const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." }),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
