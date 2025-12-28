"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

export type SoundType =
  | "hover"
  | "click"
  | "success"
  | "error"
  | "on"
  | "off"
  | "type";

interface SoundContextType {
  play: (type: SoundType) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

interface WindowWithWebkit extends Window {
  webkitAudioContext: typeof AudioContext;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 1. Safe LocalStorage Loading
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sound-muted");
      if (stored) {
        const val = JSON.parse(stored);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMuted(val);
        isMutedRef.current = val;
      }
    } catch (e) {
      console.warn("LocalStorage access denied", e);
    }
  }, []);

  // 2. Hardened Audio Initialization (Mobile Support + Cleanup)
  useEffect(() => {
    const initAudio = () => {
      if (audioContextRef.current) return;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as WindowWithWebkit).webkitAudioContext;

      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Resume if suspended (browser autoplay policy)
        if (ctx.state === "suspended") {
          ctx
            .resume()
            .catch((err) => console.warn("AudioContext resume failed", err));
        }
      }

      // Cleanup listeners immediately after init
      removeListeners();
    };

    const removeListeners = () => {
      window.removeEventListener("click", initAudio);
      window.removeEventListener("keydown", initAudio);
      window.removeEventListener("touchstart", initAudio);
    };

    window.addEventListener("click", initAudio);
    window.addEventListener("keydown", initAudio);
    window.addEventListener("touchstart", initAudio); // Add touch for mobile

    return () => {
      removeListeners();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      try {
        localStorage.setItem("sound-muted", JSON.stringify(next));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const play = useCallback((type: SoundType) => {
    if (isMutedRef.current || !audioContextRef.current) return;

    const ctx = audioContextRef.current;

    // Ensure context is running
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    switch (type) {
      case "type": {
        // ⚡ DISTINCT "TICK" (Crisper & Faster than Click) ⚡
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "triangle";

        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.02);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        osc.start(now);
        osc.stop(now + 0.02);
        break;
      }

      case "hover": {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        oscillator.start(now);
        oscillator.stop(now + 0.05);
        break;
      }

      case "click": {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.03);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        oscillator.start(now);
        oscillator.stop(now + 0.03);
        break;
      }

      case "success": {
        const notes = [440, 554, 659];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gn = ctx.createGain();
          osc.connect(gn);
          gn.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.value = freq;
          const st = now + i * 0.05;
          gn.gain.setValueAtTime(0.05, st);
          gn.gain.exponentialRampToValueAtTime(0.001, st + 0.1);
          osc.start(st);
          osc.stop(st + 0.1);
        });
        break;
      }

      case "error": {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;
      }

      case "on": {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;
      }

      case "off": {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(1200, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;
      }
    }
  }, []);

  return (
    <SoundContext.Provider value={{ play, isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
