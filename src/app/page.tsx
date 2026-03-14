"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight, TrendingUp, Cpu, Globe,
  Code, Users, Award, Target, Zap,
  Database, Hexagon, Crosshair, Trophy, Flame,
  Shield, Sparkles, Swords, Megaphone, Terminal, Network
} from "lucide-react";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { useSfx } from "@/hooks/use-sfx";
import { useAuth } from "@/lib/context/auth-context";
import { HackerText } from "@/components/ui/hacker-text";
import { cn } from "@/lib/utils";

// FIX: Importing the new B2B Marketing Packages
import { MARKETING_PACKAGES } from "@/lib/niche-data";

// LOYALTIES NETWORK – THE DIGITAL SYNDICATE (2026)
// Secure contracts • Deploy payloads • Scale agency operations

const TICKER_TEXT = [
  "HQ ONLINE // SECURE UPLINK ESTABLISHED",
  "TOP RETAINER SECURED: ₹4.2 LAKHS / MONTH",
  "NEW ARSENAL UNLOCKED: AI AUTOMATION GRID",
  "PR DEPLOYMENTS: 89% CONVERSION RATE",
  "GLOBAL COMMS: STOP SCROLLING, START SCALING",
  "CREATOR PAYOUTS FUNCTIONING AT OPTIMAL",
  "NEW PAYLOAD LIVE: VIRAL REELS ENGINE v2.4",
  "TOTAL ESCROW CLEARED: ₹1.87 CR THIS WEEK",
  "12,456 OPERATIVES ONLINE RIGHT NOW",
  "ENTERPRISE ASSET DEPLOYED: SAAS DOMINATION",
  "WEEKLY NETWORK RESET IN 11H",
  "SYSTEM ALERT: ₹50K BONUS FOR TOP 50 AGENCIES"
];

const AGENCY_PROTOCOLS = [
  {
    id: "01",
    title: "INITIALIZE IDENTITY",
    desc: "Verify your digital footprint. Access the Syndicate HQ as a Level-1 Operations Commander.",
    icon: Shield,
    color: "text-cyan-400"
  },
  {
    id: "02",
    title: "SELECT YOUR ARSENAL",
    desc: "Choose your high-ticket marketing payload. From programmatic SEO to viral content engines.",
    icon: Target,
    color: "text-purple-400"
  },
  {
    id: "03",
    title: "SECURE CONTRACTS",
    desc: "Lock in B2B clients, execute campaigns, and funnel monthly recurring revenue into your escrow.",
    icon: Zap,
    color: "text-cyan-400"
  },
  {
    id: "04",
    title: "DEPLOY & OPTIMIZE",
    desc: "Monitor live data streams. Optimize conversions. Scale operations automatically.",
    icon: TrendingUp,
    color: "text-purple-400"
  },
  {
    id: "05",
    title: "CLIMB THE REGISTRY",
    desc: "Overtake competitor agencies. Unlock Enterprise-tier capabilities and classified assets.",
    icon: Trophy,
    color: "text-cyan-400"
  },
  {
    id: "06",
    title: "EXPAND THE NETWORK",
    desc: "Form strategic alliances. Syndicate your PR. Compound your market authority exponentially.",
    icon: Network,
    color: "text-purple-400"
  }
];

const OPERATIVE_LOGS = [
  {
    name: "Rohan Sharma • Bengaluru",
    title: "Enterprise Hub Director",
    quote: "Deployed the Programmatic SEO payload. Scaled a D2C client to ₹3.8L/month MRR in 4 months. The Syndicate changed everything.",
    badge: "Tier-4 Operative",
    image: "/images/trainers/rohan.jpg" // Keep your existing image paths
  },
  {
    name: "Priya Malhotra • Mumbai",
    title: "Viral Engine Commander",
    quote: "Started with the Reels Engine. Now running 3 full-time retention pods. ₹2.1L cleared weekly. This is the real growth network.",
    badge: "Network Overseer",
    image: "/images/trainers/priya.jpg"
  }
];

const UPCOMING_CAPABILITIES = [
  { name: "Web3 Community Cult", type: "Enterprise", unlock: "March 2026" },
  { name: "AI Outbound SDR", type: "Restricted", unlock: "Next Week" },
  { name: "Holographic DOOH Ads", type: "Experimental", unlock: "April 2026" }
];

export default function Home() {
  const { play } = useSfx();
  const { userData, loading } = useAuth();
  const router = useRouter();
 
  const [tickerIndex, setTickerIndex] = useState(0);

  // REDIRECT IF LOGGED IN
  useEffect(() => {
    if (!loading && userData) {
      router.push("/dashboard");
    }
  }, [userData, loading, router]);

  // TICKER ANIMATION
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TICKER_TEXT.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const handleEnterGame = () => {
    play("success");
    router.push("/auth/login");
  };

  return (
    <main className="w-full bg-[#050505] text-[#f0f0f0] min-h-screen font-sans selection:bg-purple-500 selection:text-white overflow-hidden">
      
      {/* AMBIENT GLOWS (Matching Dashboard) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* FIXED NAVIGATION */}
      <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-6 md:px-8 py-6 z-50 mix-blend-difference text-white pointer-events-none">
        <div className="text-xl font-bold tracking-widest uppercase flex items-center gap-3">
          <span>Loyalties</span>
          <span className="text-cyan-400 text-xs font-mono tracking-[4px]">DIGITAL SYNDICATE</span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          <HackerText text={TICKER_TEXT[tickerIndex]} className="text-xs font-mono tracking-[0.2em] uppercase hidden md:block text-cyan-400" />
        </div>
      </nav>

      {/* HERO - Cyber Syndicate Scale */}
      <section className="relative h-screen w-full flex flex-col justify-end px-6 md:px-8 pb-12 border-b border-white/10">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Reusing your hero bg, just filtering it darker/bluer */}
          <Image
            src="/images/hero-bg.jpg"
            alt="Syndicate World Map"
            fill
            priority
            className="object-cover opacity-60 grayscale contrast-150 mix-blend-screen scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]/95" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-90 mix-blend-overlay" />
        </div>
        
        <div className="relative w-full z-10 max-w-5xl">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-black/70 border border-cyan-500/30 rounded-full mb-6 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Globe className="text-cyan-400" size={20} />
            <span className="font-mono text-sm tracking-[3px] text-cyan-400 uppercase">The Ultimate Agency Operations Network</span>
          </div>
          
          <h1 className="text-[12vw] leading-[0.8] tracking-[-0.04em] font-medium uppercase mb-8 drop-shadow-2xl">
            TARGET.<br />
            DEPLOY.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">SCALE.</span>
          </h1>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 max-w-3xl">
            <p className="text-xl md:text-3xl font-mono uppercase tracking-widest leading-tight text-neutral-300">
              The high-ticket B2B ecosystem built for operatives.<br />
              Secure contracts • Deploy payloads • Compound revenue.
            </p>
            <div className="text-sm font-mono tracking-widest uppercase animate-bounce text-cyan-400 flex items-center gap-2">
              ↓ INITIATE SEQUENCE
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: WHY JOIN THE SYNDICATE – Sticky Parallax Style */}
      <section className="relative w-full flex flex-col md:flex-row border-b border-white/10">
        {/* Left Sticky Column */}
        <div className="w-full md:w-[45%] p-8 md:p-16 border-b md:border-b-0 md:border-r border-white/10 bg-[#050505] sticky top-0 md:top-24 self-start h-screen flex flex-col justify-center">
          <div>
            <h2 className="text-[5.5vw] leading-[0.9] tracking-tight uppercase mb-8">
              Why join<br />the<br />Syndicate?
            </h2>
            <MagneticWrapper>
              <button
                onClick={handleEnterGame}
                className="group relative px-10 py-7 bg-transparent text-cyan-400 border-2 border-cyan-500/40 hover:bg-cyan-500 hover:text-black transition-all duration-500 flex items-center gap-4 text-xl font-medium shadow-[0_0_20px_rgba(6,182,212,0)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
              >
                <span className="font-mono uppercase tracking-widest">ACCESS HEADQUARTERS</span>
                <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </MagneticWrapper>
          </div>
        </div>

        {/* Right Scrolling Content */}
        <div className="w-full md:w-[55%] p-8 md:p-16 space-y-32 pb-40 bg-[#050505]/95 backdrop-blur">
          <div className="space-y-12">
            <p className="text-3xl md:text-5xl leading-snug font-light max-w-2xl">
              We gamified the highest-paying sectors of the Indian B2B economy.
            </p>
            <p className="text-3xl md:text-5xl leading-snug text-purple-400/60 font-light">
              Every SEO sprint, PR distribution, and ad campaign is a tactical payload you can acquire, deploy, and scale for maximum retainer value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {AGENCY_PROTOCOLS.map((mech, i) => (
              <div key={mech.id} className="space-y-6 group">
                <div className="flex items-start gap-6">
                  <div className={`p-4 rounded-2xl border border-white/10 group-hover:border-cyan-500/50 transition-colors bg-white/5`}>
                    <mech.icon size={48} className={mech.color} />
                  </div>
                  <div>
                    <div className="text-5xl font-black text-white/10 group-hover:text-cyan-500/20 transition-colors">{mech.id}</div>
                    <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors uppercase">{mech.title}</h3>
                  </div>
                </div>
                <p className="text-lg leading-relaxed text-neutral-400 font-mono">
                  {mech.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: THE ARSENAL – Pulling from MARKETING_PACKAGES */}
      <section className="w-full border-b border-white/10 bg-[#050505]">
        <div className="p-8 md:p-16 border-b border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
          <h2 className="text-[5vw] leading-none tracking-tight uppercase relative z-10">THE MARKETING ARSENAL</h2>
          <p className="font-mono text-cyan-400 mt-4 tracking-widest text-xl relative z-10">14+ high-ticket payloads • Acquire contracts • Fulfill & Scale</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-white/10 border-y border-white/10 gap-px">
          {Object.entries(MARKETING_PACKAGES).map(([key, data]) => {
            return (
              <div
                key={key}
                onClick={handleEnterGame}
                className="group p-10 min-h-[460px] bg-[#050505] flex flex-col justify-between transition-all duration-700 relative overflow-hidden cursor-pointer hover:bg-cyan-900/20"
              >
                <div className="absolute inset-0 z-0 overflow-hidden">
                  {/* Swapped to video support to match your dashboard */}
                  {data.videoSrc ? (
                    <video 
                      src={data.videoSrc} 
                      autoPlay loop muted playsInline 
                      className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 mix-blend-screen"
                    />
                  ) : data.imageSrc ? (
                    <Image
                      src={data.imageSrc}
                      alt={data.label}
                      fill
                      className="object-cover opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 grayscale contrast-125 mix-blend-screen"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/80" />
                </div>

                <div className="relative z-10 flex justify-between items-start">
                  <span className="text-xs font-mono border border-cyan-500/30 group-hover:border-cyan-400 text-cyan-500 px-4 py-1.5 rounded-full tracking-widest uppercase transition-colors">#{key}</span>
                  <div className="px-4 py-1.5 text-xs font-mono bg-black/60 border border-white/20 rounded-full flex items-center gap-2 group-hover:border-purple-500/50 transition-colors">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                    ACTIVE
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <div className="flex items-center gap-3 mb-3">
                    <data.icon size={22} className={data.textColor || "text-cyan-400"} />
                    <span className="font-mono uppercase text-sm tracking-widest opacity-75 group-hover:text-cyan-400 transition-colors">CLASS: {data.category}</span>
                  </div>
                  <p className="text-4xl font-black tracking-tighter leading-none mb-4 text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all">{data.label}</p>
                  <p className="text-sm font-mono leading-relaxed text-neutral-400 group-hover:text-neutral-300 max-w-[90%] transition-colors">{data.description}</p>
                </div>

                <div className="relative z-10 flex justify-between items-end mt-8 pt-8 border-t border-white/10 group-hover:border-cyan-500/30 transition-colors">
                  <div>
                    <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">CONTRACT VALUE</span>
                    <div className={cn("text-2xl font-bold mt-1", data.textColor || "text-white")}>₹{data.basePrice.toLocaleString()}</div>
                  </div>
                  <ArrowRight className="text-cyan-500 group-hover:translate-x-4 transition-transform" size={36} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: OPERATIVE LOGS (Testimonials) */}
      <section className="w-full py-24 bg-[#050505] border-b border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-900/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto px-8 md:px-16 relative z-10">
          <div className="flex flex-col md:flex-row gap-12 items-end mb-16">
            <div className="flex-1">
              <h2 className="text-6xl md:text-7xl font-medium tracking-tighter">Real Agencies.<br />Real Escrow.</h2>
            </div>
            <p className="text-xl max-w-md text-cyan-400/80 font-mono">Tap into the network that’s already securing the highest-ticket retainers in the industry.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {OPERATIVE_LOGS.map((story, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-10 group hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all rounded-xl backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {story.image && (
                    <Image src={story.image} alt={story.name} width={100} height={100} className="rounded-xl object-cover border border-white/10 shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-2xl mb-1">{story.name}</div>
                    <div className="text-purple-400 text-sm mb-6 font-mono tracking-wider">{story.title}</div>
                    <p className="text-lg leading-relaxed text-neutral-300 italic">“{story.quote}”</p>
                    <div className="mt-8 text-xs font-mono border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded uppercase tracking-widest inline-block bg-cyan-500/5">{story.badge}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: UPCOMING CAPABILITIES */}
      <section className="w-full py-24 border-b border-white/10 bg-[#050505]">
        <div className="max-w-6xl mx-auto px-8 md:px-16">
          <h2 className="text-5xl md:text-6xl font-medium tracking-tight mb-4">Future Arsenal</h2>
          <p className="text-xl text-neutral-400 mb-16 font-mono">Classified payloads currently in development. Prepare your infrastructure.</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {UPCOMING_CAPABILITIES.map((drop, i) => (
              <div key={i} className="border border-white/10 p-10 hover:border-purple-500/50 bg-white/5 transition-all group rounded-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 blur-[50px] group-hover:bg-purple-500/20 transition-colors pointer-events-none" />
                <div className="uppercase text-xs font-mono tracking-widest text-neutral-500 mb-6 relative z-10 flex items-center gap-2">
                  <Terminal size={14} /> ASSET #{100 + i}
                </div>
                <div className="text-3xl font-bold mb-3 text-white group-hover:text-purple-400 transition-colors relative z-10">{drop.name}</div>
                <div className="text-cyan-400 font-mono text-sm mb-8 relative z-10">{drop.type} • {drop.unlock}</div>
                <div className="text-[10px] font-mono border border-white/20 px-5 py-3 rounded-lg inline-block group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500 transition-all relative z-10 cursor-pointer">
                  REQUEST CLEARANCE
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL FOOTER CTA */}
      <footer className="w-full bg-cyan-500 text-black min-h-[90vh] flex flex-col justify-between p-8 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start font-mono text-sm uppercase font-bold tracking-widest gap-8 relative z-10">
          <div>Loyalties • Syndicate Command • India 2026</div>
          <div className="md:text-right opacity-80">
            Built for the next generation of Indian founders<br />
            who refuse to operate in the margins.
          </div>
        </div>
        
        <div className="w-full flex justify-center pb-12 mt-auto relative z-10">
          <MagneticWrapper>
            <h2
              onClick={handleEnterGame}
              className="text-[11vw] md:text-[10vw] font-black leading-none tracking-tight text-center cursor-pointer hover:scale-105 hover:text-white transition-all drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
            >
              INITIALIZE UPLINK
            </h2>
          </MagneticWrapper>
        </div>
      </footer>
    </main>
  );
}