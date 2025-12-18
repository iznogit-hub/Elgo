/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Cpu,
  X,
  Sparkles,
  Zap,
  Mic,
  MicOff,
  Terminal,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSfx } from "@/hooks/use-sfx";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ReactMarkdown from "react-markdown";
import { usePathname } from "next/navigation";
import { HackerText } from "@/components/ui/hacker-text";
import * as Sentry from "@sentry/nextjs";

// ⚡ 1. DEFINE MISSING TYPES (Fixes "Unexpected any")
interface SpeechRecognitionResult {
  [index: number]: { transcript: string };
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
    | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
}

// Helper to handle Window augmentation
interface IWindow extends Window {
  SpeechRecognition?: { new (): SpeechRecognition };
  webkitSpeechRecognition?: { new (): SpeechRecognition };
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_ACTIONS = [
  { label: "Identify", action: "Who are you?" },
  { label: "Tech Stack", action: "What is your stack?" },
  { label: "Projects", action: "Show me projects." },
  { label: "Contact", action: "How do I reach T7SEN?" },
];

export function CyberChat() {
  const pathname = usePathname();
  const { play } = useSfx();
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ⚡ 2. UPDATE STATE TYPES
  const [isListening, setIsListening] = useState(false);
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null); // Typed ref

  const [hackMode, setHackMode] = useState(false);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let bootText = "SYSTEM_ONLINE... WAITING_FOR_INPUT.";
      if (pathname === "/guestbook")
        bootText = "COMMS_STATION_ACTIVE. SIGN_IN_TO_LEAVE_TRACE.";
      else if (pathname === "/about")
        bootText = "BIO_DATABASE_ACCESSED. READY_FOR_QUERIES.";
      else if (pathname === "/uses")
        bootText = "ARMORY_ONLINE. LOADOUT_READY_FOR_INSPECTION.";
      else if (pathname === "/contact")
        bootText = "UPLINK_OPERATOR_ACTIVE. READY_FOR_COMMUNICATION.";

      setMessages([{ id: "boot", role: "assistant", content: bootText }]);
    }
  }, [isOpen, messages.length, pathname]);

  const toggleVoice = async () => {
    if (typeof window === "undefined") return;

    if (isListening) {
      console.log("🎤 [Voice] Stopping service...");
      Sentry.addBreadcrumb({
        category: "voice",
        message: "User stopped voice manually",
        level: "info",
      });

      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
        play("click");
      }
      return;
    }

    setIsVoiceLoading(true);
    console.log("🎤 [Voice] Initialization started...");
    Sentry.addBreadcrumb({
      category: "voice",
      message: "User clicked voice start",
      level: "info",
    });

    try {
      const win = window as unknown as IWindow; // Type-safe cast
      const SpeechRecognitionConstructor =
        win.SpeechRecognition || win.webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) {
        const err = new Error("SpeechRecognition API missing");
        console.error("❌ [Voice] Error:", err.message);
        Sentry.captureException(err, {
          tags: { browser: navigator.userAgent },
        });
        alert(
          "Voice input is not supported in this browser. Please use Chrome or Edge.",
        );
        setIsVoiceLoading(false);
        return;
      }

      console.log("🎤 [Voice] Requesting raw mic permission...");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        console.log("✅ [Voice] Permission GRANTED.");
        Sentry.captureMessage("Mic Permission Granted", "info");

        stream.getTracks().forEach((track) => track.stop());
      } catch (permErr: unknown) {
        // Use unknown for catch block
        console.error("❌ [Voice] Permission DENIED:", permErr);
        Sentry.captureException(permErr, { tags: { context: "getUserMedia" } });

        const error = permErr as Error; // Cast to Error to access .name safely
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          alert(
            "Microphone access blocked. Please click the 'Lock' icon in your address bar to allow access.",
          );
        } else if (error.name === "NotFoundError") {
          alert("No microphone found on this device.");
        } else {
          alert("Could not access microphone. Please check system settings.");
        }
        setIsVoiceLoading(false);
        return;
      }

      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        console.log("🎤 [Voice] Service STARTED");
        setIsListening(true);
        setIsVoiceLoading(false);
        play("hover");
      };

      recognition.onend = () => {
        console.log("🎤 [Voice] Service ENDED");
        setIsListening(false);
        setIsVoiceLoading(false);
      };

      // ⚡ 3. TYPED EVENT HANDLERS
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("❌ [Voice] Recognition Error:", event.error);
        Sentry.captureMessage(
          `Voice Recognition Error: ${event.error}`,
          "error",
        );

        setIsListening(false);
        setIsVoiceLoading(false);

        if (event.error === "not-allowed") {
          console.warn(
            "System policy blocked voice even after permission grant.",
          );
        }
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Convert the ResultList to an array safely
        const resultsArray = Array.from(
          event.results as unknown as SpeechRecognitionResult[],
        );

        const transcript = resultsArray
          .map((result) => result[0].transcript)
          .join("");

        setInput(transcript);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error("❌ [Voice] Critical Failure:", error);
      Sentry.captureException(error);
      setIsVoiceLoading(false);
      alert("Voice system failed to initialize. Please retry.");
    }
  };

  useGSAP(() => {
    if (isOpen && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        {
          scale: 0,
          opacity: 0,
          x: -40,
          y: 100,
          transformOrigin: "bottom left",
        },
        {
          scale: 1,
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.75)",
        },
      );
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOpen = () => {
      if (!isOpen) {
        play("click");
        setIsOpen(true);
      }
    };
    window.addEventListener("open-ai-chat", handleOpen);
    return () => window.removeEventListener("open-ai-chat", handleOpen);
  }, [isOpen, play]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    play("click");
    setInput("");
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);

    if (text.startsWith("/")) {
      const command = text.toLowerCase().trim();
      let response = "";

      setTimeout(() => {
        if (command === "/clear") {
          setMessages([]);
          play("success");
          setIsLoading(false);
          return;
        } else if (command === "/hack") {
          setHackMode(true);
          response =
            "⚠️ **INTRUSION DETECTED**\n\nBYPASSING FIREWALL... [||||||||||] 100%\n\nACCESS GRANTED TO MAINFRAME.";
          play("error");
          setTimeout(() => setHackMode(false), 5000);
        } else if (command === "/help") {
          response =
            "**COMMAND LIST:**\n- `/clear`: Purge Logs\n- `/time`: Local Time\n- `/hack`: ???";
        } else if (command === "/time") {
          response = `**LOCAL_TIME:** ${new Date().toLocaleTimeString()}`;
        } else {
          response = `⚠️ **ERR:** UNKNOWN_COMMAND "${text}".`;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response,
          },
        ]);
        if (command !== "/hack") play("hover");
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: { pathname },
        }),
      });

      if (!response.ok) throw new Error(response.statusText);
      const botId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: botId, role: "assistant", content: "" },
      ]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let botContent = "";
      let buffer = "";

      if (reader) {
        const parseLine = (line: string) => {
          const trimmed = line.trim();
          if (!trimmed) return;
          if (trimmed.startsWith("0:")) {
            try {
              const jsonStr = trimmed.slice(2);
              if (jsonStr.startsWith('"')) botContent += JSON.parse(jsonStr);
              else botContent += jsonStr;
            } catch (e) {
              botContent += trimmed.slice(2);
            }
          } else {
            botContent += trimmed;
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            if (buffer.trim()) {
              parseLine(buffer);
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = botContent;
                return updated;
              });
            }
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) parseLine(line);
          if (Math.random() > 0.7) play("hover");
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].content = botContent;
            return updated;
          });
        }
      }
      play("success");
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      setMessages((prev) => [
        ...prev,
        {
          id: "error",
          role: "assistant",
          content: "ERR: CONNECTION_LOST // TRY_AGAIN",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };
  const handleChipClick = (action: string) => {
    sendMessage(action);
  };
  const closeChat = () => {
    play("click");
    gsap.to(containerRef.current, {
      scale: 0,
      opacity: 0,
      x: -40,
      y: 100,
      duration: 0.3,
      ease: "back.in(1)",
      onComplete: () => setIsOpen(false),
    });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed bottom-24 left-4 md:left-55 z-50 w-[90vw] md:w-95 h-125 flex flex-col overflow-hidden",
        "rounded-2xl border border-primary/20 shadow-2xl",
        "bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60",
        "dark:shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.3)]",
        "transition-colors duration-300",
      )}
    >
      {hackMode && (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center font-mono text-green-500 pointer-events-none">
          <Terminal className="h-16 w-16 mb-4 animate-pulse text-green-500" />
          <div className="text-2xl font-bold tracking-widest animate-bounce">
            ACCESSING MAINFRAME
          </div>
          <div className="text-xs mt-2 opacity-70">
            Decryption in progress...
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-scanline" />
        </div>
      )}

      {/* HEADER */}
      <div className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-primary/10 bg-primary/5 px-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shadow-[0_0_10px_rgba(var(--primary),0.1)]">
            <Cpu className="h-5 w-5 text-primary animate-pulse" />
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background animate-ping" />
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-widest text-foreground font-mono">
              <HackerText text="AI_NET_LINK" />
            </span>
            <span className="text-[10px] text-primary font-mono uppercase tracking-widest opacity-80">
              Neural Link Active
            </span>
          </div>
        </div>
        <button
          onClick={closeChat}
          className="group rounded-full p-2 hover:bg-destructive/10 transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
        </button>
      </div>

      {/* MESSAGES */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto p-4 space-y-6 font-sans text-sm scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center space-y-4 opacity-60">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <div className="relative h-16 w-16 rounded-2xl bg-linear-to-tr from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                System Online
              </p>
              <p className="text-xs text-muted-foreground max-w-55">
                &quot;I have access to T7SEN&apos;s entire database. Ask me
                about his tech stack or experience.&quot;
              </p>
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex flex-col max-w-[85%]",
              m.role === "user" ? "ml-auto items-end" : "items-start",
            )}
          >
            <div
              className={cn(
                "relative px-4 py-3 text-sm shadow-sm backdrop-blur-sm",
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                  : "bg-card border border-border/50 text-card-foreground rounded-2xl rounded-tl-sm shadow-md",
              )}
            >
              {m.role === "user" ? (
                m.content
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none font-mono text-xs">
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => (
                        <p
                          className="mb-2 last:mb-0 leading-relaxed"
                          {...props}
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="list-disc pl-4 mb-2 space-y-1"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="text-primary/90" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong
                          className="text-primary font-bold tracking-wide"
                          {...props}
                        />
                      ),
                      code: ({ node, ...props }) => (
                        <code
                          className="bg-black/50 text-green-400 px-1 py-0.5 rounded border border-green-900/30 text-[10px]"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground/60 mt-1.5 px-1 font-mono uppercase">
              {m.role === "user" ? "YOU" : "T7SEN_AI"}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start ml-2">
            <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce delay-75" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce delay-150" />
            </div>
          </div>
        )}
      </div>

      {/* SUGGESTIONS */}
      <div className="px-3 pb-2 pt-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {SUGGESTED_ACTIONS.map((chip) => (
          <button
            key={chip.label}
            onClick={() => handleChipClick(chip.action)}
            disabled={isLoading}
            className="shrink-0 px-3 py-1 text-[10px] font-mono border border-primary/20 rounded-full bg-primary/5 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all active:scale-95 whitespace-nowrap"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 p-3 bg-background/50 backdrop-blur-md border-t border-primary/10"
      >
        <div className="relative flex items-center gap-2">
          <input
            className="flex-1 bg-muted/40 border border-transparent hover:border-primary/20 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:bg-background transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening ? "Listening..." : "Enter command (Try /hack)"
            }
            autoFocus
          />

          <Button
            type="button"
            size="icon"
            onClick={toggleVoice}
            disabled={isVoiceLoading}
            className={cn(
              "h-10 w-10 rounded-xl transition-all border border-transparent",
              isListening
                ? "bg-red-500/20 text-red-500 border-red-500/50 animate-pulse hover:bg-red-500/30"
                : "bg-muted/40 text-muted-foreground hover:text-primary hover:bg-primary/10",
            )}
          >
            {isVoiceLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className={cn(
              "h-10 w-10 rounded-xl transition-all",
              input.trim()
                ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:scale-105"
                : "bg-muted/40 text-muted-foreground hover:bg-muted",
            )}
          >
            {isLoading ? (
              <Zap className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
