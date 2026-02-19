"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight, Gamepad2, TrendingUp,
  Code, Users, Award, Target, Zap,
  Database, Hexagon, Crosshair, Trophy, Flame,
  Star, Crown, Sword, Shield, Sparkles,
  Swords
} from "lucide-react";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { useSfx } from "@/hooks/use-sfx";
import { useAuth } from "@/lib/context/auth-context";
import { HackerText } from "@/components/ui/hacker-text";
import { cn } from "@/lib/utils";
import { NICHE_DATA } from "@/lib/niche-data";

// PORTALZ – THE POKÉMON WORLD OF EARNING MONEY (2026)
// Catch niches like Pokémon • Evolve your hustle • Battle for real rupees

const TICKER_TEXT = [
  "LOBBY ONLINE // PORTALZ INDIA",
  "TOP TRAINER LOOT: ₹4.2 LAKHS / MONTH",
  "NEW SERVER UNLOCKED: AI AUTOMATION GRID",
  "FREELANCE QUESTS: 89% WIN RATE",
  "GLOBAL CHAT: STOP SCROLLING, START FARMING",
  "CREATOR PAYOUTS FUNCTIONING AT OPTIMAL",
  "NEW DROP LIVE: INSTA GROWTH ENGINE v2.4",
  "TOTAL SERVER LOOT: ₹1.87 CR THIS WEEK",
  "12,456 TRAINERS ONLINE RIGHT NOW",
  "LEGENDARY NICHE EVOLVED: SAAS LEGEND",
  "WEEKLY BATTLE ARENA RESET IN 11H",
  "RARE DROP: ₹50K BONUS FOR TOP 50"
];

const GAME_MECHANICS = [
  {
    id: "01",
    title: "CATCH YOUR AVATAR",
    desc: "Verify your digital identity. Spawn as a Level-1 Hustler Trainer in the PortalZ world.",
    icon: Users,
    color: "text-[#FFD4B2]"
  },
  {
    id: "02",
    title: "PICK YOUR STARTER NICHE",
    desc: "Choose your first income Pokémon. Every niche is a unique creature you can catch, train, and evolve.",
    icon: Target,
    color: "text-[#FFD4B2]"
  },
  {
    id: "03",
    title: "GRIND DAILY QUESTS",
    desc: "Complete ops, level up, earn XP. Every completed mission = real rupees in your Poké-Wallet.",
    icon: Zap,
    color: "text-[#FFD4B2]"
  },
  {
    id: "04",
    title: "EVOLVE & BATTLE",
    desc: "Level your niches. Challenge other trainers in arena battles. Winner takes the bounty.",
    icon: Swords,
    color: "text-[#FFD4B2]"
  },
  {
    id: "05",
    title: "CLIMB THE GYM LEADERBOARD",
    desc: "Defeat Gym Leaders (top earners). Unlock Legendary tiers and rare drops.",
    icon: Crown,
    color: "text-[#FFD4B2]"
  },
  {
    id: "06",
    title: "TRADE & ALLIANCE",
    desc: "Form trainer alliances. Trade skills. Compound your loot exponentially.",
    icon: Users,
    color: "text-[#FFD4B2]"
  }
];

const TRAINER_STORIES = [
  {
    name: "Rohan Sharma • Bengaluru",
    title: "From Recruit to SAAS Legend",
    quote: "Caught my first SaaS niche at Level 7. Evolved it into a ₹3.8L/month monster in 4 months. PortalZ literally changed my life.",
    badge: "Level 42 Trainer",
    image: "/images/trainers/rohan.jpg"
  },
  {
    name: "Priya Malhotra • Mumbai",
    title: "Creator Arena Champion",
    quote: "Started with Reels Pokémon. Now running 3 evolved channels. ₹2.1L passive every month. This is the real Poké-game.",
    badge: "Gym Leader",
    image: "/images/trainers/priya.jpg"
  }
];

const UPCOMING_DROPS = [
  { name: "Web3 Yield Beast", type: "Legendary", unlock: "March 2026" },
  { name: "AI Content Dragon", type: "Rare", unlock: "Next Week" },
  { name: "Regional Language Empire", type: "Epic", unlock: "April 2026" }
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
    <main className="w-full bg-[#050505] text-[#f0f0f0] min-h-screen font-sans selection:bg-[#FFD4B2] selection:text-black overflow-hidden">
      
      {/* FIXED NAVIGATION */}
      <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-6 md:px-8 py-6 z-50 mix-blend-difference text-white pointer-events-none">
        <div className="text-xl font-bold tracking-widest uppercase flex items-center gap-3">
          <span>PortalZ</span>
          <span className="text-[#FFD4B2] text-xs font-mono tracking-[4px]">POKÉ-HUSTLE</span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="w-2 h-2 bg-[#FFD4B2] rounded-full animate-pulse" />
          <HackerText text={TICKER_TEXT[tickerIndex]} className="text-xs font-mono tracking-[0.2em] uppercase hidden md:block text-[#FFD4B2]" />
        </div>
      </nav>

      {/* HERO - Pokémon Epic Scale */}
      <section className="relative h-screen w-full flex flex-col justify-end px-6 md:px-8 pb-12 border-b border-white/10">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <Image
            src="/images/hero-bg.jpg"
            alt="PortalZ World Map"
            fill
            priority
            className="object-cover opacity-90 grayscale contrast-150 mix-blend-screen scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]/95" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-90 mix-blend-overlay" />
        </div>
        
        <div className="relative w-full z-10 max-w-5xl">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-black/70 border border-[#FFD4B2]/30 rounded-full mb-6">
            <Sparkles className="text-[#FFD4B2]" size={20} />
            <span className="font-mono text-sm tracking-[3px] text-[#FFD4B2]">INDIA'S FIRST EARNING POKÉMON WORLD</span>
          </div>
          
          <h1 className="text-[13vw] leading-[0.78] tracking-[-0.04em] font-medium uppercase mb-8 drop-shadow-2xl">
            CATCH.<br />
            GRIND.<br />
            <span className="text-[#FFD4B2]">EVOLVE.</span>
          </h1>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 max-w-3xl">
            <p className="text-xl md:text-3xl font-mono uppercase tracking-widest leading-tight text-neutral-300">
              The ultimate gamified universe where every skill is a Pokémon.<br />
              Catch niches • Complete quests • Evolve your income into real rupees.
            </p>
            <div className="text-sm font-mono tracking-widest uppercase animate-bounce text-[#FFD4B2] flex items-center gap-2">
              ↓ SCROLL TO ENTER THE WORLD
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: WHY PLAY PORTALZ – Sticky Parallax Style */}
      <section className="relative w-full flex flex-col md:flex-row border-b border-white/10">
        {/* Left Sticky Column */}
        <div className="w-full md:w-[45%] p-8 md:p-16 border-b md:border-b-0 md:border-r border-white/10 bg-[#050505] sticky top-0 md:top-24 self-start h-screen flex flex-col justify-center">
          <div>
            <h2 className="text-[5.5vw] leading-[0.9] tracking-tight uppercase mb-8">
              Why become<br />a PortalZ<br />Trainer?
            </h2>
            <MagneticWrapper>
              <button
                onClick={handleEnterGame}
                className="group relative px-10 py-7 bg-transparent text-[#FFD4B2] border-2 border-[#FFD4B2]/40 hover:bg-[#FFD4B2] hover:text-black transition-all duration-500 flex items-center gap-4 text-xl font-medium"
              >
                <span className="font-mono uppercase tracking-widest">DROP INTO THE WORLD</span>
                <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </MagneticWrapper>
          </div>
        </div>

        {/* Right Scrolling Content – Very Long & Informative */}
        <div className="w-full md:w-[55%] p-8 md:p-16 space-y-32 pb-40 bg-[#050505]/95 backdrop-blur">
          <div className="space-y-12">
            <p className="text-3xl md:text-5xl leading-snug font-light max-w-2xl">
              We turned the entire Indian digital economy into a Pokémon-style MMO.
            </p>
            <p className="text-3xl md:text-5xl leading-snug text-[#FFD4B2]/60 font-light">
              Every freelance gig, creator campaign, SaaS tool, and affiliate link is a living creature you can catch, train, battle, and evolve into passive income.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {GAME_MECHANICS.map((mech, i) => (
              <div key={mech.id} className="space-y-6 group">
                <div className="flex items-start gap-6">
                  <div className={`p-4 rounded-2xl border border-[#FFD4B2]/30 group-hover:border-[#FFD4B2] transition-colors`}>
                    <mech.icon size={48} className={mech.color} />
                  </div>
                  <div>
                    <div className="text-5xl font-black text-white/10 group-hover:text-white/30 transition-colors">{mech.id}</div>
                    <h3 className="text-3xl font-bold tracking-tight text-[#FFD4B2]">{mech.title}</h3>
                  </div>
                </div>
                <p className="text-xl leading-relaxed text-neutral-400 font-mono">
                  {mech.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: THE POKÉDEX – All Active Niches */}
      <section className="w-full border-b border-white/10 bg-[#050505]">
        <div className="p-8 md:p-16 border-b border-white/10">
          <h2 className="text-[5.5vw] leading-none tracking-tight uppercase">THE NATIONAL POKÉDEX</h2>
          <p className="font-mono text-[#FFD4B2] mt-4 tracking-widest text-xl">148+ income creatures • Catch them all • Evolve them daily</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-white/10 border-y border-white/10 gap-px">
          {Object.entries(NICHE_DATA).map(([key, data]) => {
            return (
              <div
                key={key}
                onClick={handleEnterGame}
                className="group p-10 min-h-[460px] bg-[#050505] flex flex-col justify-between transition-all duration-700 relative overflow-hidden cursor-pointer hover:bg-[#FFD4B2] hover:text-black"
              >
                <div className="absolute inset-0 z-0 overflow-hidden">
                  {data.imageSrc && (
                    <Image
                      src={data.imageSrc}
                      alt={data.label}
                      fill
                      className="object-cover opacity-30 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700 grayscale contrast-125 mix-blend-multiply"
                    />
                  )}
                </div>

                <div className="relative z-10 flex justify-between items-start">
                  <span className="text-xs font-mono border border-white/30 group-hover:border-black px-4 py-1.5 rounded-full tracking-widest uppercase">#{key}</span>
                  <div className="px-4 py-1.5 text-xs font-mono bg-black/60 group-hover:bg-white/90 group-hover:text-black border border-white/20 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#FFD4B2] group-hover:bg-black rounded-full animate-pulse" />
                    ONLINE
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <div className="flex items-center gap-3 mb-3">
                    <data.icon size={22} />
                    <span className="font-mono uppercase text-sm tracking-widest opacity-75 group-hover:opacity-100">TYPE: {data.category}</span>
                  </div>
                  <p className="text-4xl font-black tracking-tighter leading-none mb-4">{data.label}</p>
                  <p className="text-sm font-mono leading-relaxed opacity-80 max-w-[85%]">{data.description}</p>
                </div>

                <div className="relative z-10 flex justify-between items-end mt-8 pt-8 border-t border-current/30">
                  <div>
                    <span className="text-xs font-mono opacity-60">BASE LOOT</span>
                    <div className="text-2xl font-bold">₹{data.base_bounty}</div>
                  </div>
                  <ArrowRight className="group-hover:translate-x-4 transition-transform" size={36} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: TRAINER SUCCESS STORIES */}
      <section className="w-full py-24 bg-[#050505] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-8 md:px-16">
          <div className="flex flex-col md:flex-row gap-12 items-end mb-16">
            <div className="flex-1">
              <h2 className="text-6xl md:text-7xl font-medium tracking-tighter">Real Trainers.<br />Real Loot.</h2>
            </div>
            <p className="text-xl max-w-md text-neutral-400 font-mono">Level up with the community that’s already winning the game.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {TRAINER_STORIES.map((story, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-10 group hover:border-[#FFD4B2] transition-all">
                <div className="flex gap-6">
                  {story.image && (
                    <Image src={story.image} alt={story.name} width={120} height={120} className="rounded-xl object-cover" />
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-2xl mb-1">{story.name}</div>
                    <div className="text-[#FFD4B2] text-sm mb-6">{story.title}</div>
                    <p className="text-lg leading-relaxed italic">“{story.quote}”</p>
                    <div className="mt-8 text-xs font-mono border border-[#FFD4B2]/30 px-4 py-2 inline-block">{story.badge}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: UPCOMING EVOLUTIONS */}
      <section className="w-full py-24 border-b border-white/10 bg-[#050505]">
        <div className="max-w-6xl mx-auto px-8 md:px-16">
          <h2 className="text-6xl font-medium tracking-tight mb-4">Upcoming Evolutions</h2>
          <p className="text-xl text-neutral-400 mb-16">New legendary niches dropping soon. Be the first trainer to catch them.</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {UPCOMING_DROPS.map((drop, i) => (
              <div key={i} className="border border-white/10 p-10 hover:border-[#FFD4B2] transition-all group">
                <div className="uppercase text-xs tracking-widest text-neutral-500 mb-6">DROP #{100 + i}</div>
                <div className="text-4xl font-bold mb-3 group-hover:text-[#FFD4B2] transition-colors">{drop.name}</div>
                <div className="text-[#FFD4B2] text-sm mb-8">{drop.type} • {drop.unlock}</div>
                <div className="text-xs font-mono border border-white/20 px-5 py-3 inline-block group-hover:bg-[#FFD4B2] group-hover:text-black transition-all">PRE-REGISTER FOR EARLY ACCESS</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL FOOTER CTA */}
      <footer className="w-full bg-[#FFD4B2] text-black min-h-[90vh] flex flex-col justify-between p-8 md:p-16">
        <div className="flex flex-col md:flex-row justify-between items-start font-mono text-sm uppercase font-bold tracking-widest gap-8">
          <div>PortalZ • Poké-Hustle World • India 2026</div>
          <div className="md:text-right">
            Built for the next generation of Indian trainers<br />
            who refuse to stay broke.
          </div>
        </div>
        
        <div className="w-full flex justify-center pb-12 mt-auto">
          <MagneticWrapper>
            <h2
              onClick={handleEnterGame}
              className="text-[15vw] font-black leading-none tracking-[-0.03em] text-center cursor-pointer hover:scale-105 transition-transform"
            >
              PRESS START
            </h2>
          </MagneticWrapper>
        </div>
      </footer>
    </main>
  );
}