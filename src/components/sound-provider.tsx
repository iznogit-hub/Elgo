"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

// UPDATED: Added 'error', 'on', and 'off' to the type definition
type SoundType = "hover" | "click" | "success" | "error" | "on" | "off";

interface SoundContextType {
  play: (type: SoundType) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

// Helper to support Safari's webkitAudioContext
interface WindowWithWebkit extends Window {
  webkitAudioContext: typeof AudioContext;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 1. Load Mute Preference
  useEffect(() => {
    const stored = localStorage.getItem("sound-muted");
    if (stored) {
      const val = JSON.parse(stored);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMuted(val);
      isMutedRef.current = val;
    }
  }, []);

  // 2. Initialize Audio Context ONLY on user interaction
  useEffect(() => {
    const initAudio = () => {
      // If already initialized, stop listening
      if (audioContextRef.current) return;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as WindowWithWebkit).webkitAudioContext;

      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Immediately resume if suspended (browsers often start them suspended)
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
      }

      // Cleanup listeners once initialized
      window.removeEventListener("click", initAudio);
      window.removeEventListener("keydown", initAudio);
    };

    // Listen for the first interaction
    window.addEventListener("click", initAudio);
    window.addEventListener("keydown", initAudio);

    return () => {
      window.removeEventListener("click", initAudio);
      window.removeEventListener("keydown", initAudio);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
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
    // Return early if muted OR if AudioContext hasn't been initialized yet.
    if (isMutedRef.current || !audioContextRef.current) return;

    const ctx = audioContextRef.current;

    // Double check state to ensure it plays
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    // --- Sound Profiles ---
    if (type === "hover") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, now);
      oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      oscillator.start(now);
      oscillator.stop(now + 0.05);
    } else if (type === "click") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, now);
      oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.03);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      oscillator.start(now);
      oscillator.stop(now + 0.03);
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
      // Cleanup main oscillator/gain since we created new ones above
      return;
    }
    // NEW: Error Sound (Low Sawtooth Buzzer)
    else if (type === "error") {
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(150, now);
      oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.2);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      oscillator.start(now);
      oscillator.stop(now + 0.2);
    }
    // NEW: On Sound (High Ascending Chirp)
    else if (type === "on") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(600, now);
      oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    }
    // NEW: Off Sound (Descending Chirp)
    else if (type === "off") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1200, now);
      oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      oscillator.start(now);
      oscillator.stop(now + 0.1);
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
