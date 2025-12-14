import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("utils/cn", () => {
  it("merges class names correctly", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    // p-4 should overwrite p-2 because they target the same property
    const result = cn("p-2", "p-4");
    expect(result).toBe("p-4");
  });

  it("handles conditional classes", () => {
    const result = cn(
      "base-class",
      true && "active",
      false && "inactive",
      null,
      undefined
    );
    expect(result).toBe("base-class active");
  });

  it("merges mixed arrays and strings", () => {
    const result = cn("base", ["child", "nested"]);
    expect(result).toBe("base child nested");
  });
});
