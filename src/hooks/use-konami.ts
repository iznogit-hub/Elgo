"use client";

import { useEffect, useRef } from "react";

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
  // Use Ref instead of State to prevent re-renders on every key press
  // and to ensure the event listener is stable.
  const inputRef = useRef<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentInput = inputRef.current;
      const newInput = [...currentInput, e.key];

      // Keep buffer strictly 10 keys long
      if (newInput.length > KONAMI_CODE.length) {
        newInput.shift();
      }

      // Update ref
      inputRef.current = newInput;

      // Check for match
      if (newInput.join("") === KONAMI_CODE.join("")) {
        action();
        inputRef.current = []; // Reset after success
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [action]);
}
