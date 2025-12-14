import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKonami } from "./use-konami";

describe("useKonami", () => {
  it("triggers action only when complete sequence is typed", () => {
    const actionMock = vi.fn();
    renderHook(() => useKonami(actionMock));

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

    // Simulate typing the code
    konamiCode.forEach((key) => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key }));
    });

    // Should fire exactly once
    expect(actionMock).toHaveBeenCalledTimes(1);
  });

  it("does not trigger on incomplete sequence", () => {
    const actionMock = vi.fn();
    renderHook(() => useKonami(actionMock));

    const incomplete = ["ArrowUp", "ArrowUp", "ArrowDown"];

    incomplete.forEach((key) => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key }));
    });

    expect(actionMock).not.toHaveBeenCalled();
  });

  it("resets buffer correctly (allows re-triggering)", () => {
    const actionMock = vi.fn();
    renderHook(() => useKonami(actionMock));

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

    // Type it once
    konamiCode.forEach((key) =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key }))
    );
    expect(actionMock).toHaveBeenCalledTimes(1);

    // Type it again immediately
    konamiCode.forEach((key) =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key }))
    );
    expect(actionMock).toHaveBeenCalledTimes(2);
  });
});
