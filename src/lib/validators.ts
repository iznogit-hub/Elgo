import { z } from "zod";

// --- 1. AUTHENTICATION PROTOCOLS ---

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "INVALID_FORMAT: Enter a valid directive address." }),
  password: z
    .string()
    .min(6, { message: "SECURITY_RISK: Passcode too short (min 6 chars)." }),
});

export const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { message: "IDENTITY_ERROR: Codename must be 3+ chars." })
    .max(20, { message: "IDENTITY_ERROR: Codename too long." })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "SYNTAX_ERROR: Alphanumeric & underscores only." }),
  email: z
    .string()
    .trim()
    .email({ message: "INVALID_FORMAT: Enter a valid directive address." }),
  password: z
    .string()
    .min(6, { message: "SECURITY_RISK: Passcode too weak." }),
});

// --- 2. HUNTER PROTOCOL (Instagram Scouting) ---

export const scoutSchema = z.object({
  url: z
    .string()
    .url({ message: "TRANSMISSION_ERROR: Invalid URL format." })
    .refine((val) => val.includes("instagram.com"), {
      message: "TARGET_MISMATCH: Only Instagram signals accepted.",
    }),
});

// --- 3. COMMS UPLINK (Contact) ---

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Identity required." }),
  email: z
    .string()
    .trim()
    .email({ message: "Invalid comms channel." }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Packet too small (min 10 chars)." })
    .max(5000, { message: "Packet overflow (max 5000 chars)." }),
});

// Export Types for React Forms
export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ScoutFormValues = z.infer<typeof scoutSchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;