"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, X, Terminal, Mic, MicOff, Loader2, Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSfx } from "@/hooks/use-sfx";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { HackerText } from "@/components/ui/hacker-text";

// --- TYPES ---
interface Message {
  role: "user" | "system";
  content: string;
}

export function CyberChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "UPLINK ESTABLISHED. AWAITING QUERY..." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { play } = useSfx();

  // 1. Listen for global open event (triggered by Avatar or Command Menu)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-ai-chat", handleOpen);
    return () => window.removeEventListener("open-ai-chat", handleOpen);
  }, []);

  // 2. Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Animation
  useGSAP(() => {
    if (isOpen) {
      gsap.to(containerRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
      });
    } else {
      gsap.to(containerRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.4,
        ease: "power3.in",
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);
    play("click");

    // SIMULATED RESPONSE (Replace with real API endpoint later)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev, 
        { role: "system", content: "COMMAND RECEIVED. THIS MODULE IS CURRENTLY IN 'LITE' MODE. FULL AI CAPABILITY COMING IN V2.0." }
      ]);
      setIsLoading(false);
      play("success");
    }, 1500);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-0 right-0 z-50 h-[100dvh] w-full md:w-[400px] translate-x-full opacity-0 p-4 md:p-6 pointer-events-none"
    >
      <div className="pointer-events-auto h-full w-full bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2 text-cyan-400">
            <Terminal className="w-5 h-5" />
            <span className="font-bold font-orbitron text-sm tracking-widest">CENTRAL_UPLINK</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-gray-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm custom-scrollbar">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={cn(
                "max-w-[85%] p-3 rounded-lg border",
                msg.role === "user" 
                  ? "ml-auto bg-cyan-950/30 border-cyan-500/30 text-cyan-100 rounded-br-none" 
                  : "mr-auto bg-white/5 border-white/10 text-gray-300 rounded-bl-none"
              )}
            >
              <p className="leading-relaxed">{msg.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className="mr-auto bg-white/5 border border-white/10 p-3 rounded-lg rounded-bl-none flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              <HackerText text="PROCESSING..." speed={50} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/50">
          <div className="relative flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter command..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none transition-colors font-mono"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 text-black h-11 w-11 rounded-lg"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}