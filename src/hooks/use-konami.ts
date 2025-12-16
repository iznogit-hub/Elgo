"use client";

import { useEffect, useRef } from "react";
import { sendGAEvent } from "@next/third-parties/google";

const KONAMI_CODE = [
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

export function useKonami(action: () => void) {
  const inputRef = useRef<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentInput = inputRef.current;
      const newInput = [...currentInput, e.key];

      if (newInput.length > KONAMI_CODE.length) {
        newInput.shift();
      }

      inputRef.current = newInput;

      if (newInput.join("") === KONAMI_CODE.join("")) {
        // --- TRACKING START ---
        sendGAEvent("event", "easter_egg_found", {
          event_category: "Engagement",
          event_label: "Konami Code",
          value: 1,
        });
        // --- TRACKING END ---

        action();
        inputRef.current = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [action]);
}
