"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image"; 
import { ShieldAlert, ArrowLeft, LockKeyhole, Radio } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HackerText } from "@/components/ui/hacker-text";
import { Background } from "@/components/ui/background"; // Remove if unused in new theme, or keep for subtle effect
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

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
        return toast.error("MISSING DATA // EMAIL REQUIRED");
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      play("success");
      setSent(true);
      toast.success("RECOVERY SIGNAL TRANSMITTED");
    } catch (error: any) {
      play("error");
      toast.error("TRANSMISSION FAILED // TRY AGAIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center justify-center selection:bg-red-900 selection:text-white">
      
      {/* --- ATMOSPHERE --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/images/auth-bg.jpg" 
          alt="Recovery Background"
          fill
          priority
          className="object-cover opacity-30 grayscale contrast-125"
        />
        {/* Noise & Vignette */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]" />
      </div>

      <SoundPrompter />

      {/* --- NAV --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <Link href="/auth/login" onClick={() => play("hover")} className="w-10 h-10 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-red-500 transition-all rounded-sm">
              <ArrowLeft size={18} className="text-neutral-500 group-hover:text-red-500" />
            </Link>
        </div>
        <div className="px-3 py-1 bg-red-950/30 border border-red-900/50 backdrop-blur-md flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_red]" />
            <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-red-500 uppercase">Emergency_Channel</span>
        </div>
      </nav>

      {/* --- MAIN INTERFACE --- */}
      <div className="relative z-50 w-full max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center h-full">
        
        {/* LEFT: STATUS DISPLAY */}
        <div className="text-center md:text-left space-y-6">
            <div className="inline-block relative">
                <div className={cn(
                    "w-20 h-20 border-2 flex items-center justify-center transition-all duration-500 mb-4 rounded-sm",
                    sent ? "border-green-500 bg-green-950/20" : "border-red-500 bg-red-950/20"
                )}>
                    <LockKeyhole size={32} className={cn(
                        "transition-colors duration-500",
                        sent ? "text-green-500" : "text-red-500"
                    )} />
                </div>
            </div>

            <div>
                <h1 className="text-4xl md:text-6xl font-black font-sans italic uppercase leading-[0.9] tracking-tighter">
                    <HackerText text={sent ? "SIGNAL_LOCKED" : "RECOVER_ACCESS"} speed={40} />
                </h1>
                <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase mt-2">
                   Protocol: Lost_Credentials_V1
                </p>
            </div>

            {sent && (
                <div className="p-4 bg-green-950/30 border-l-2 border-green-500 backdrop-blur-sm animate-in slide-in-from-left-4 duration-500 max-w-xs">
                    <p className="text-[9px] font-bold text-green-400 uppercase leading-relaxed tracking-widest flex items-start gap-2">
                        <Radio size={12} className="mt-0.5 shrink-0" />
                        <span>Transmission Successful.<br/>Check Secure Inbox.</span>
                    </p>
                    <Link href="/auth/login" className="block mt-4 text-[9px] text-neutral-400 hover:text-white uppercase tracking-widest underline decoration-neutral-700 hover:decoration-white transition-all">
                       Return_To_Gateway &gt;&gt;
                    </Link>
                </div>
            )}
        </div>

        {/* RIGHT: INPUT TERMINAL */}
        <div className="w-full max-w-sm flex justify-center md:justify-end">
            {!sent ? (
                <div className="w-full animate-in slide-in-from-right-10 fade-in duration-500">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="text-[10px] font-black font-mono tracking-widest text-white uppercase flex items-center gap-2">
                         <ShieldAlert size={12} className="text-red-500"/> Identify_Target
                      </h3>
                      <div className="w-16 h-[1px] bg-white/20" />
                    </div>

                    <form onSubmit={handleReset} className="p-6 bg-black/80 border border-white/10 backdrop-blur-xl space-y-6 shadow-2xl relative">
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white" />

                        <div className="space-y-1">
                            <label className="text-[7px] font-mono text-neutral-500 uppercase tracking-widest">Comms_Address</label>
                            <Input 
                                type="email" 
                                placeholder="OPERATIVE@GUILD.COM" 
                                className="bg-neutral-900/50 border-neutral-800 text-[10px] h-12 font-mono text-white focus:border-red-500 uppercase placeholder:text-neutral-700 transition-colors"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-12 bg-white hover:bg-neutral-200 text-black font-black italic tracking-widest text-[9px] uppercase border border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            {loading ? "Transmitting..." : "Transmit_Reset_Signal"}
                        </Button>
                    </form>
                </div>
            ) : null}
        </div>

      </div>
    </main>
  );
}