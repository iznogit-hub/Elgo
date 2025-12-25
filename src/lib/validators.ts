import { z } from "zod";

export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address." })
    .max(255, { message: "Email is too long." }),
});

export type NewsletterFormValues = z.infer<typeof newsletterSchema>;

// ADD THIS: Contact Form Schema
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(100, { message: "Name is too long." }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address." })
    .max(255, { message: "Email is too long." }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters." })
    .max(5000, { message: "Message cannot exceed 5000 characters." }),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
