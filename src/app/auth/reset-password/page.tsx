"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { 
  ShieldAlert, 
  Terminal, 
  ArrowLeft, 
  CheckCircle2, 
  LockKeyhole
} from "lucide-react";
import { toast } from "sonner";

// --- CUSTOM COMPONENTS ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HackerText } from "@/components/ui/hacker-text";
import { Background } from "@/components/ui/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { useSfx } from "@/hooks/use-sfx";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { play } = useSfx(); 

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    play("click");
    
    if (!email) {
        play("error");
        return toast.error("MISSING_DATA: EMAIL REQUIRED");
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        play("error");
        return toast.error("INVALID_FORMAT: CHECK EMAIL SYNTAX");
    }

    setLoading(true);
    toast.loading("SEARCHING DATABASE...");

    try {
      await sendPasswordResetEmail(auth, email);
      play("success");
      setSent(true);
      toast.dismiss();
      toast.success("RECOVERY SIGNAL TRANSMITTED");
    } catch (error: any) {
      console.error(error);
      play("error");
      toast.dismiss();
      
      if (error.code === 'auth/too-many-requests') {
        toast.error("SYSTEM COOLING DOWN. TRY AGAIN LATER.");
      } else if (error.code === 'auth/user-not-found') {
        // Security: Don't explicitly reveal user existence, or do if strictly internal
        toast.error("USER_NOT_FOUND_OR_SYSTEM_ERROR");
      } else {
        toast.error(`ERROR: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* 1. GLOBAL VISUALS */}
      <Background />

      <div className="z-10 w-full max-w-md relative">
        
        {/* Decorative Borders */}
        <div className="absolute -top-6 -left-6 w-12 h-12 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-xl" />
        <div className="absolute -bottom-6 -right-6 w-12 h-12 border-b-2 border-r-2 border-cyan-500/50 rounded-br-xl" />

        <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-8 rounded-xl shadow-2xl shadow-cyan-900/10">
          
          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-950/30 mb-4 border border-cyan-500/30">
               {sent ? (
                 <CheckCircle2 className="w-8 h-8 text-green-500 animate-pulse" />
               ) : (
                 <ShieldAlert className="w-8 h-8 text-cyan-500" />
               )}
            </div>
            <h1 className="text-2xl font-bold font-orbitron text-white tracking-wider">
              <HackerText text={sent ? "SIGNAL LOCKED" : "ACCESS RECOVERY"} />
            </h1>
            <p className="text-[10px] text-gray-500 font-mono mt-2 tracking-[0.2em] uppercase">
              {sent ? "CHECK_SECURE_COMMS" : "INITIATE_RESET_PROTOCOL"}
            </p>
          </div>
          
          {!sent ? (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-2 font-mono">
                   <Terminal className="w-3 h-3" /> Target ID (Email)
                </label>
                <Input 
                  type="email" 
                  placeholder="operative@guild.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  onFocus={() => play("hover")}
                  className="bg-black/50 border-white/10 focus:border-cyan-500 text-white font-mono h-12 text-lg pl-4"
                />
              </div>

              <MagneticWrapper>
                <Button 
                    type="submit" 
                    disabled={loading}
                    onMouseEnter={() => play("hover")}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold h-14 text-lg tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] transition-all font-orbitron"
                >
                    {loading ? "TRANSMITTING..." : "SEND RECOVERY LINK"}
                </Button>
              </MagneticWrapper>
            </form>
          ) : (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="p-4 bg-green-950/20 border border-green-500/30 rounded text-sm text-green-400 font-mono leading-relaxed">
                [SUCCESS] A secure uplink has been sent to your inbox. Proceed there to override security protocols.
              </div>
              
              <MagneticWrapper>
                <Link href="/auth/login">
                    <Button 
                        variant="outline" 
                        onMouseEnter={() => play("hover")}
                        onClick={() => play("click")}
                        className="w-full border-white/10 hover:bg-white/5 text-gray-400 hover:text-white font-orbitron h-12"
                    >
                        RETURN TO GATEWAY
                    </Button>
                </Link>
              </MagneticWrapper>
            </div>
          )}

          {/* FOOTER NAV */}
          {!sent && (
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <Link 
                    href="/auth/login" 
                    className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-cyan-400 transition-colors"
                    onMouseEnter={() => play("hover")}
                    onClick={() => play("click")}
                >
                    <ArrowLeft className="w-3 h-3" /> ABORT SEQUENCE
                </Link>
            </div>
          )}

        </div>

        {/* SECURITY BADGE */}
        <div className="mt-4 flex justify-center opacity-30">
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                <LockKeyhole className="w-3 h-3" />
                <span>ZAIBATSU_SECURE_CORE // V.2.0.4</span>
            </div>
        </div>

      </div>
    </div>
  );
}