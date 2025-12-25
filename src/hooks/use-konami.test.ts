import { renderHook, act } from "@testing-library/react";
import { useKonami } from "./use-konami";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// --- MOCK DEPENDENCIES ---
// This mocks the hook so it doesn't try to play sounds or check the provider
vi.mock("@/hooks/use-achievements", () => ({
  useAchievements: () => ({
    unlock: vi.fn(), // A fake function that does nothing
  }),
}));

describe("useKonami", () => {
  beforeEach(() => {
    // Spy on window events to simulate typing
    vi.spyOn(window, "addEventListener");
    vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("triggers action only when complete sequence is typed", () => {
    const action = vi.fn();
    renderHook(() => useKonami(action));

    const konamiCode = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];

    act(() => {
      konamiCode.forEach((key) => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key }));
      });
    });

    expect(action).toHaveBeenCalledTimes(1);
  });

  it("does not trigger on incomplete sequence", () => {
    const action = vi.fn();
    renderHook(() => useKonami(action));

    const incompleteCode = ["ArrowUp", "ArrowUp", "ArrowDown"];

    act(() => {
      incompleteCode.forEach((key) => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key }));
      });
    });

    expect(action).not.toHaveBeenCalled();
  });

  it("resets buffer correctly (allows re-triggering)", () => {
    const action = vi.fn();
    renderHook(() => useKonami(action));

    const konamiCode = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];

    // First trigger
    act(() => {
      konamiCode.forEach((key) => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key }));
      });
    });
    expect(action).toHaveBeenCalledTimes(1);

    // Second trigger
    act(() => {
      konamiCode.forEach((key) => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key }));
      });
    });
    expect(action).toHaveBeenCalledTimes(2);
  });
});
