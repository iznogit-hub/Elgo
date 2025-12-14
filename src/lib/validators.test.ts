import { describe, it, expect } from "vitest";
import { contactSchema, newsletterSchema } from "./validators";

describe("Validators", () => {
  describe("newsletterSchema", () => {
    it("accepts a valid email", () => {
      const result = newsletterSchema.safeParse({ email: "cyber@t7sen.com" });
      expect(result.success).toBe(true);
    });

    it("rejects an invalid email", () => {
      const result = newsletterSchema.safeParse({ email: "not-an-email" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Please enter a valid email address."
        );
      }
    });
  });

  describe("contactSchema", () => {
    it("validates a correct form", () => {
      const validData = {
        name: "T7SEN",
        email: "hello@t7sen.com",
        message: "I would like to hire you for a project.",
      };
      const result = contactSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects short names", () => {
      const result = contactSchema.safeParse({
        name: "A",
        email: "valid@email.com",
        message: "Valid message length here.",
      });
      expect(result.success).toBe(false);
      // @ts-expect-error - we know it failed
      expect(result.error.issues[0].message).toContain("at least 2 characters");
    });

    it("rejects short messages", () => {
      const result = contactSchema.safeParse({
        name: "Valid Name",
        email: "valid@email.com",
        message: "Hi",
      });
      expect(result.success).toBe(false);
      // @ts-expect-error - we know it failed
      expect(result.error.issues[0].message).toContain(
        "at least 10 characters"
      );
    });
  });
});
