"use client";

import { useState, useRef, useEffect } from "react";
import { 
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { 
  Send, X, Terminal, Loader2, ShieldAlert 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSfx } from "@/hooks/use-sfx";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { HackerText } from "@/components/ui/hacker-text";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const { user, userData } = useAuth();
  const { play } = useSfx();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. ANIMATION: GSAP SLIDE-IN
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

  // 2. FIREBASE LISTENER (REAL-TIME)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "support_chats", user.uid, "messages"), 
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Auto-scroll
      setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. SEND MESSAGE LOGIC
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const text = input.trim();
    setInput("");
    setIsLoading(true);
    play("click");

    try {
      await addDoc(collection(db, "support_chats", user.uid, "messages"), {
        text,
        senderId: user.uid,
        senderName: userData?.username || "Operative",
        createdAt: serverTimestamp(),
        isAdmin: false
      });
      play("success");
    } catch (error) {
      console.error(error);
      play("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-0 right-0 z-[200] h-[100dvh] w-full md:w-[400px] translate-x-full opacity-0 p-0 md:p-6 pointer-events-none"
    >
      <div className="pointer-events-auto h-full w-full bg-black/95 backdrop-blur-xl md:border border-white/10 md:rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2 text-cyan-400">
            <Terminal className="w-5 h-5" />
            <span className="font-bold font-orbitron text-sm tracking-widest">HQ_UPLINK</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => { play("click"); onClose(); }}
            className="h-8 w-8 text-gray-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm custom-scrollbar bg-black/50">
          
          {/* WELCOME SYSTEM MSG */}
          <div className="mr-auto bg-white/5 border border-white/10 p-3 rounded-lg rounded-bl-none text-gray-400 text-xs">
             <p className="font-bold text-yellow-500 mb-1">SYSTEM_ADMIN</p>
             Uplink established. State your anomaly or request.
          </div>

          {messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
                <div 
                  key={msg.id} 
                  className={cn(
                    "max-w-[85%] p-3 rounded-lg border text-xs",
                    isMe 
                      ? "ml-auto bg-cyan-950/30 border-cyan-500/30 text-cyan-100 rounded-br-none" 
                      : "mr-auto bg-white/5 border-white/10 text-gray-300 rounded-bl-none"
                  )}
                >
                  <p className={cn("font-bold mb-1 uppercase text-[9px]", isMe ? "text-cyan-500 text-right" : "text-yellow-500")}>
                      {isMe ? "You" : "HQ_Command"}
                  </p>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
            );
          })}
          
          {/* SENDING INDICATOR */}
          {isLoading && (
            <div className="ml-auto flex items-center gap-2 text-[10px] text-cyan-500/50">
              <Loader2 className="w-3 h-3 animate-spin" />
              <HackerText text="ENCRYPTING..." speed={50} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/80">
          <div className="relative flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Transmit message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none transition-colors font-mono placeholder:text-gray-600"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 text-black h-11 w-11 rounded-sm"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}