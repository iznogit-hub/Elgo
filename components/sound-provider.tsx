"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

type SoundType = "hover" | "click" | "success";

interface SoundContextType {
  play: (type: SoundType) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

// STRICT TYPING: Extend the Window interface to include the Webkit prefix
interface WindowWithWebkit extends Window {
  webkitAudioContext: typeof AudioContext;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("sound-muted");
    if (stored) {
      const val = JSON.parse(stored);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMuted(val);
      isMutedRef.current = val;
    }

    // Type-safe fallback for Safari
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as WindowWithWebkit).webkitAudioContext;

    if (AudioContextClass) {
      audioContextRef.current = new AudioContextClass();
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      localStorage.setItem("sound-muted", JSON.stringify(next));
      return next;
    });
  }, []);

  const play = useCallback((type: SoundType) => {
    if (isMutedRef.current || !audioContextRef.current) return;

    const ctx = audioContextRef.current;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "hover") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, now);
      oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      oscillator.start(now);
      oscillator.stop(now + 0.05);
    } else if (type === "click") {
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(150, now);
      oscillator.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    } else if (type === "success") {
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
