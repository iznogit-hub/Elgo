"use client";

import { useEffect, useState } from "react";

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
  const [input, setInput] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Add new key to the buffer
      const newInput = [...input, e.key];

      // 2. Keep buffer strictly 10 keys long (length of Konami Code)
      if (newInput.length > KONAMI_CODE.length) {
        newInput.shift();
      }

      setInput(newInput);

      // 3. Check for match
      if (newInput.join("") === KONAMI_CODE.join("")) {
        action();
        setInput([]); // Reset after success to allow re-triggering
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [input, action]);
}
