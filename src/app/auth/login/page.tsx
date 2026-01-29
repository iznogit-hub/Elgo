"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HackerText } from "@/components/ui/hacker-text";
import { Fingerprint, ScanEye, Instagram, Lock, AlertTriangle, ArrowLeft, Cpu } from "lucide-react";
import { toast } from "sonner";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import VideoStage from "@/components/canvas/video-stage";
import { Background } from "@/components/ui/background";
import { SoundPrompter } from "@/components/ui/sound-prompter";

export default function LoginPage() {
  const router = useRouter();
  const { play } = useSfx();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "granted" | "denied">("idle");

  const handleGoogleLogin = async () => {
    play("click");
    setScanStatus("scanning");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          username: user.displayName?.toUpperCase() || "OPERATIVE",
          tier: "recruit",
          niche: "general", 
          bubblePoints: 0,
          popCoins: 100, 
          velocity: 0,
          createdAt: new Date().toISOString(),
          instagramConnected: false
        });
        toast.success("NEW OPERATIVE REGISTERED");
      }

      play("success");
      setScanStatus("granted");
      toast.success("BIOMETRIC_MATCH_CONFIRMED");
      // Redirect to dashboard where they can trigger the "Intelligence" niche selection
      setTimeout(() => router.push("/dashboard"), 1000); 
    } catch (error: any) {
      play("error");
      setScanStatus("denied");
      toast.error(`ACCESS_DENIED: ${error.message}`);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    play("click");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      play("success");
      setScanStatus("granted");
      toast.success("IDENTITY_VERIFIED");
      router.push("/dashboard");
    } catch (error: any) {
      play("error");
      setScanStatus("denied");
      toast.error("INVALID_CREDENTIALS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center">
      
      {/* 📽️ THE THEATER: MP4 Backdrop for Login */}
      <VideoStage src="/video/intro.mp4" overlayOpacity={0.6} />
      <Background /> 
      <SoundPrompter />

      {/* 📱 TOP HUD NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <Link href="/" className="w-12 h-12 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-cyan-500 transition-all">
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-cyan-400" />
            </Link>
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-1">
            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[8px] font-mono font-black tracking-widest text-cyan-500 uppercase">Gateway_Secure</span>
            </div>
        </div>
      </nav>

      {/* 🔐 AUTH INTERFACE: Floating Side Elements */}
      <div className="relative z-50 w-full h-screen pointer-events-none">
        
        {/* LEFT FLANK: Biometric Controls */}
        <div className="absolute left-6 top-32 w-48 space-y-6 pointer-events-auto">
            <div className="space-y-4">
                <div className="relative inline-block">
                    <ScanEye className={cn(
                        "w-12 h-12 transition-colors duration-500",
                        scanStatus === "scanning" ? "text-yellow-400 animate-pulse" : 
                        scanStatus === "granted" ? "text-green-500" : 
                        scanStatus === "denied" ? "text-red-500" : "text-cyan-500"
                    )} />
                    {scanStatus === "scanning" && (
                        <span className="absolute inset-0 border-2 border-yellow-400 rounded-full animate-ping opacity-50" />
                    )}
                </div>
                <h1 className="text-xl font-black font-orbitron italic uppercase leading-none tracking-tighter text-white">
                    <HackerText text="IDENTIFY_SELF" speed={40} />
                </h1>
                <p className="text-[8px] font-mono text-cyan-700 tracking-[0.3em] uppercase italic">Neural_Link_V1</p>
            </div>

            <div className="space-y-3">
                <Button 
                    onClick={handleGoogleLogin}
                    className="w-full h-14 bg-cyan-950/30 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-start gap-3 px-4"
                >
                    <Fingerprint className="h-5 w-5" />
                    <span className="text-[8px] font-black font-orbitron tracking-widest uppercase">Biometric_Scan</span>
                </Button>

                <Button 
                    onClick={() => toast.info("INSTAGRAM_UPLINK_OFFLINE")}
                    className="w-full h-14 bg-pink-950/20 border border-pink-500/50 hover:bg-pink-600 hover:text-white transition-all flex items-center justify-start gap-3 px-4"
                >
                    <Instagram className="h-5 w-5" />
                    <span className="text-[8px] font-black font-orbitron tracking-widest uppercase">Meta_Infiltrate</span>
                </Button>
            </div>
        </div>

        {/* RIGHT FLANK: Manual Override Feed */}
        <div className="absolute right-6 top-32 w-52 space-y-4 pointer-events-auto">
            <h3 className="text-[9px] font-black font-orbitron tracking-widest text-gray-400 uppercase flex items-center justify-end gap-2 text-right">
                Manual_Override <Lock size={10} className="text-cyan-500" />
            </h3>

            <form onSubmit={handleEmailLogin} className="p-4 bg-black/40 border-r-2 border-cyan-500/50 backdrop-blur-xl space-y-4">
                <div className="space-y-1">
                    <label className="text-[7px] font-mono text-cyan-600 uppercase">Operative_ID</label>
                    <Input 
                        type="email" 
                        placeholder="EMAIL_HERE" 
                        className="bg-black/40 border-white/10 text-[9px] h-10 font-mono text-white focus:border-cyan-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[7px] font-mono text-cyan-600 uppercase">Passcode</label>
                    <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="bg-black/40 border-white/10 text-[9px] h-10 font-mono text-white focus:border-cyan-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-10 bg-cyan-700 hover:bg-cyan-500 text-white font-black italic tracking-widest text-[8px] uppercase"
                >
                    {loading ? "Authenticating..." : "Enter_Gateway"}
                </Button>
            </form>

            <div className="flex justify-between items-center px-1">
                <Link href="/auth/signup" className="text-[8px] font-mono text-white/30 hover:text-cyan-400 uppercase tracking-widest">New_Operative?</Link>
                <Link href="/auth/reset-password" className="text-[8px] font-mono text-white/30 hover:text-cyan-400 uppercase tracking-widest">Forgot_Code?</Link>
            </div>
        </div>
      </div>

      {/* 🧪 SYSTEM FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between border-t border-white/5 bg-black/80 backdrop-blur-2xl">
         <div className="flex items-center gap-4 opacity-50 text-cyan-500">
            <Cpu size={14} className="animate-pulse" />
            <div className="flex flex-col gap-0.5">
                <div className="h-0.5 w-16 bg-white/10 overflow-hidden">
                    <div className="h-full bg-cyan-400 w-1/2 animate-[progress_3s_infinite_linear]" />
                </div>
                <span className="text-[7px] font-mono uppercase tracking-[0.2em] font-bold">Secure_Gateway: v1.0</span>
            </div>
         </div>
         <div className="flex items-center gap-2">
             <AlertTriangle size={12} className="text-white/20" />
             <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">Encrypted_Link</span>
         </div>
      </footer>

      <style jsx global>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </main>
  );
}