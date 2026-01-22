import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema, scoutSchema } from "./validators";

describe("Zaibatsu Validation Protocols", () => {
  
  // --- 1. AUTH TESTS ---
  describe("signupSchema", () => {
    it("accepts valid operative credentials", () => {
      const result = signupSchema.safeParse({
        username: "CyberWolf",
        email: "operative@zaibatsu.com",
        password: "secure_password_123"
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid codenames (special chars)", () => {
      const result = signupSchema.safeParse({
        username: "Cyber@Wolf!", // Invalid chars
        email: "op@test.com",
        password: "password"
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("SYNTAX_ERROR");
      }
    });
  });

  // --- 2. HUNTER TESTS ---
  describe("scoutSchema", () => {
    it("accepts valid Instagram targets", () => {
      const result = scoutSchema.safeParse({ 
        url: "https://www.instagram.com/reel/C3xk9/" 
      });
      expect(result.success).toBe(true);
    });

    it("rejects non-Instagram signals (e.g. TikTok)", () => {
      const result = scoutSchema.safeParse({ 
        url: "https://tiktok.com/@user/video/123" 
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("TARGET_MISMATCH");
      }
    });

    it("rejects malformed URLs", () => {
      const result = scoutSchema.safeParse({ url: "not_a_url" });
      expect(result.success).toBe(false);
    });
  });

});