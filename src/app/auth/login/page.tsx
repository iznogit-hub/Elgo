"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase"; // Added db
import { doc, getDoc, setDoc } from "firebase/firestore"; // Added Firestore methods
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HackerText } from "@/components/ui/hacker-text";
import { Fingerprint, ScanEye, Instagram, Lock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { play } = useSfx();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "granted" | "denied">("idle");

  // 1. GOOGLE BIOMETRIC AUTH (Fixed: Auto-creates Profile)
  const handleGoogleLogin = async () => {
    play("click");
    setScanStatus("scanning");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // ⚡ CRITICAL FIX: Check if profile exists, if not, create it
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          username: user.displayName?.toUpperCase() || "OPERATIVE",
          tier: "recruit",
          niche: "general", // Default niche
          bubblePoints: 0,
          popCoins: 100, // Signup Bonus
          velocity: 0,
          avatarId: "default",
          createdAt: new Date().toISOString(),
          instagramConnected: false
        });
        toast.success("NEW OPERATIVE REGISTERED");
      }

      play("success");
      setScanStatus("granted");
      toast.success("BIOMETRIC_MATCH_CONFIRMED");
      setTimeout(() => router.push("/dashboard"), 1000); 
    } catch (error: any) {
      play("error");
      setScanStatus("denied");
      toast.error(`ACCESS_DENIED: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. INSTAGRAM OAUTH
  const handleInstagramLogin = () => {
    play("click");
    toast.loading("ESTABLISHING_SECURE_LINK...");
    // Placeholder until you set up "Sign In with Instagram" specifically
    // Note: This is different from the "Connect Instagram" on the profile page
    toast.error("INSTAGRAM_UPLINK_OFFLINE (Coming Soon)");
  };

  // 3. MANUAL OVERRIDE
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    play("click");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      play("success");
      toast.success("IDENTITY_VERIFIED");
      router.push("/dashboard");
    } catch (error: any) {
      play("error");
      toast.error("INVALID_CREDENTIALS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* BACKGROUND SCANNERS */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-500 animate-scanline" />
        <div className="absolute top-0 left-1/2 h-full w-[1px] bg-cyan-500/30" />
      </div>

      <div className="z-10 w-full max-w-md border-2 border-cyan-900 bg-black/80 backdrop-blur-xl p-8 rounded-lg shadow-[0_0_50px_rgba(6,182,212,0.1)] relative">
        
        {/* Decorative Corner Markers */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500" />

        {/* HEADER */}
        <div className="text-center mb-10 space-y-2">
          <div className="relative inline-block">
             <ScanEye className={cn(
               "w-12 h-12 mx-auto mb-4 transition-colors duration-500",
               scanStatus === "scanning" ? "text-yellow-400 animate-pulse" : 
               scanStatus === "granted" ? "text-green-500" : 
               scanStatus === "denied" ? "text-red-500" : "text-cyan-500"
             )} />
             {scanStatus === "scanning" && (
                <span className="absolute inset-0 border-2 border-yellow-400 rounded-full animate-ping opacity-50" />
             )}
          </div>
          <h1 className="text-2xl font-bold font-orbitron text-white">
            <HackerText text="IDENTIFY YOURSELF" speed={40} />
          </h1>
          <p className="text-xs text-cyan-700 tracking-[0.3em] font-mono">SECURE_GATEWAY_V1</p>
        </div>

        {/* FAST PASS BUTTONS */}
        <div className="space-y-4 mb-8">
            <Button 
              onClick={handleGoogleLogin}
              onMouseEnter={() => play("hover")}
              className="w-full h-14 bg-cyan-950/30 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-center gap-3 relative z-10">
                <Fingerprint className="h-5 w-5" />
                <span className="tracking-widest font-bold text-xs md:text-sm font-orbitron">BIOMETRIC SCAN (GOOGLE)</span>
              </div>
            </Button>

            <Button 
              onClick={handleInstagramLogin}
              onMouseEnter={() => play("hover")}
              className="w-full h-14 bg-pink-950/20 border border-pink-500/50 hover:bg-pink-600 hover:text-white transition-all group"
            >
              <div className="flex items-center justify-center gap-3">
                <Instagram className="h-5 w-5" />
                <span className="tracking-widest font-bold text-xs md:text-sm font-orbitron">INFILTRATE VIA INSTAGRAM</span>
              </div>
            </Button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black px-2 text-gray-600 font-mono">Manual Override</span>
          </div>
        </div>

        {/* MANUAL FORM */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] text-cyan-600 uppercase font-mono tracking-wider flex items-center gap-2">
               Operative ID
            </label>
            <Input 
              type="email" 
              placeholder="operative@guild.com" 
              className="bg-black/50 border-cyan-900 focus:border-cyan-500 text-cyan-100 font-mono h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => play("hover")}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-[10px] text-cyan-600 uppercase font-mono tracking-wider">Passcode</label>
                <Link href="/auth/reset-password">
                    <span className="text-[10px] text-gray-500 hover:text-cyan-400 cursor-pointer font-mono transition-colors">FORGOT CODE?</span>
                </Link>
            </div>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="bg-black/50 border-cyan-900 focus:border-cyan-500 text-cyan-100 font-mono h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => play("hover")}
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            onMouseEnter={() => play("hover")}
            className="w-full bg-cyan-700 hover:bg-cyan-500 text-white font-bold h-14 mt-6 tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all font-orbitron"
          >
            {loading ? (
                <span className="animate-pulse">AUTHENTICATING...</span>
            ) : (
                <span className="flex items-center gap-2">
                   ENTER GATEWAY <Lock className="w-4 h-4" />
                </span>
            )}
          </Button>
        </form>

        {/* FOOTER LINKS */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center flex justify-between text-[10px] text-gray-500 font-mono">
          <Link 
            href="/auth/signup" 
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            onMouseEnter={() => play("hover")}
          >
            <span className="text-cyan-700"></span> NEW OPERATIVE?
          </Link>
          <span className="flex items-center gap-1 opacity-50">
            <AlertTriangle className="w-3 h-3" /> ENCRYPTED
          </span>
        </div>

      </div>
    </main>
  );
}