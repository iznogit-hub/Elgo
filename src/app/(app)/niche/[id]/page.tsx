"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  doc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { MARKETING_PACKAGES } from "@/lib/niche-data";
import {
  ArrowLeft, Zap, ExternalLink,
  CheckCircle2, Server, Terminal,
  Users, Activity, Lock, Target, Workflow, Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { Background } from "@/components/ui/background";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";

// --- OPERATIONAL CONSTANTS ---
const MAX_BANDWIDTH = 100; // Replaced Energy
const BANDWIDTH_REGEN_RATE = 1;
const BANDWIDTH_REGEN_INTERVAL = 6000;

// Mocking the specific fulfillment tasks for the packages. 
// In production, this would be fetched from a 'client_orders' Firebase collection.
const FULFILLMENT_STAGES = [
  {
    id: "stage_1_intake",
    title: "Client Asset Intake & Audit",
    desc: "Extract raw assets, branding guidelines, and account access from the client dossier.",
    bandwidth: 10,
    reward: 0, // No payout until milestone completion
    icon: Users,
    status: "pending"
  },
  {
    id: "stage_2_strategy",
    title: "Strategy Architecture",
    desc: "Draft the campaign hooks, SEO keywords, and PR distribution matrix for client approval.",
    bandwidth: 25,
    reward: 5000, // Milestone 1 Cleared
    icon: Workflow,
    status: "locked"
  },
  {
    id: "stage_3_execution",
    title: "Asset Production & Editing",
    desc: "Compile short-form videos, draft press releases, and spin up programmatic landing pages.",
    bandwidth: 40,
    reward: 0,
    icon: Terminal,
    status: "locked"
  },
  {
    id: "stage_4_deployment",
    title: "Live Deployment & Handover",
    desc: "Push assets to live servers, schedule Meta ads, and finalize the PR wire distribution.",
    bandwidth: 25,
    reward: 14999, // Final Payout Cleared
    icon: Zap,
    status: "locked"
  }
];

export default function FulfillmentPage() {
  const params = useParams();
  const { user, userData, loading } = useAuth();
  const { play } = useSfx();

  const id = params.id as string;
  // Fallback to a default package if the ID doesn't match perfectly during testing
  const packageData = MARKETING_PACKAGES[id] || MARKETING_PACKAGES["reels_engine"];
  const PackageIcon = packageData.icon || Target;

  // STATE
  const [activeTab, setActiveTab] = useState<"TASKS" | "CLIENT_COMMS" | "LEDGER">("TASKS");
  const [bandwidth, setBandwidth] = useState(MAX_BANDWIDTH);
  const [assignedOperatives, setAssignedOperatives] = useState<any[]>([]);
  
  const [executingTask, setExecutingTask] = useState<string | null>(null);
  const [executionStart, setExecutionStart] = useState<Record<string, number>>({});
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // BANDWIDTH REGEN (formerly stamina/energy)
  useEffect(() => {
    if (bandwidth >= MAX_BANDWIDTH) return;
    const interval = setInterval(() => {
      setBandwidth((prev) => Math.min(MAX_BANDWIDTH, prev + BANDWIDTH_REGEN_RATE));
    }, BANDWIDTH_REGEN_INTERVAL);
    return () => clearInterval(interval);
  }, [bandwidth]);

  // DATA FETCH (Simulating pulling operative data)
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const qOps = query(collection(db, "users"), limit(4));
        const snapOps = await getDocs(qOps);
        setAssignedOperatives(snapOps.docs.map((d) => ({ ...d.data(), uid: d.id })));
      } catch (e) { console.error("Operative intel failed", e); }
    };
    fetchData();
  }, [user]);

  // HANDLERS
  const handleStartTask = (task: any) => {
    if (bandwidth < task.bandwidth) return toast.error("BANDWIDTH DEPLETED // WAIT FOR REGEN");

    play("click");
    
    // Simulating opening the relevant tool (e.g., Notion, CapCut, Meta Ads Manager)
    // window.open("https://notion.so", "_blank");
    
    setExecutingTask(task.id);
    setExecutionStart((prev) => ({ ...prev, [task.id]: Date.now() }));
    toast.info("PROTOCOL INITIATED // COMPLETE OFF-SITE THEN VERIFY");
  };

  const handleVerifyTask = async (task: any) => {
    const startTime = executionStart[task.id] || 0;
    const minTime = 3000; // Minimum time to pretend they did the work
    if (Date.now() - startTime < minTime) return toast.error("VERIFICATION REJECTED // WORK IN PROGRESS");

    play("kaching");
    setExecutingTask(null);
    setBandwidth((prev) => Math.max(0, prev - task.bandwidth));
    setCompletedTasks((prev) => [...prev, task.id]);

    if (task.reward > 0) {
      try {
        const userRef = doc(db, "users", user!.uid);
        await updateDoc(userRef, {
          "wallet.clearedFunds": increment(task.reward), // Using clearedFunds instead of popCoins
          "dailyTracker.tasksCompleted": increment(1),
        });
        toast.success(`MILESTONE CLEARED! ₹${task.reward} TRANSFERRED TO LEDGER`);
      } catch (e) { toast.error("LEDGER SYNC FAILED"); }
    } else {
        toast.success("STAGE FINALIZED // AWAITING NEXT PROTOCOL");
    }
  };

  if (loading || !userData) return <div className="bg-[#050505] min-h-screen" />;

  const TABS = [
    { id: "TASKS", label: "DEPLOYMENT PHASES", icon: Activity },
    { id: "CLIENT_COMMS", label: "CLIENT DOSSIER", icon: Users },
    { id: "LEDGER", label: "REVENUE LEDGER", icon: Briefcase }
  ];

  return (
    <main className="relative h-screen w-full bg-[#050505] text-[#f0f0f0] font-sans overflow-hidden flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* HUD BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/95 via-[#050505]/80 to-[#050505]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>
      
      <SoundPrompter />
      <Background />

      {/* HEADER - AGENCY HUD STYLE */}
      <header className="flex-none px-6 md:px-10 py-6 border-b border-white/10 bg-[#050505]/90 backdrop-blur-md z-50">
        <div className="flex items-center justify-between mb-8">
          <TransitionLink href="/dashboard" className="flex items-center gap-4 group">
            <div className="w-10 h-10 border border-cyan-500/30 bg-black/60 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-all">
              <ArrowLeft size={18} />
            </div>
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest group-hover:text-cyan-400">ABORT TO HQ</span>
          </TransitionLink>
          
          {/* BANDWIDTH BAR */}
          <div className="flex items-center gap-4 px-5 py-2 border border-cyan-500/30 bg-black/60 backdrop-blur-md rounded-full">
            <Server size={16} className="text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">BANDWIDTH</span>
            <div className="w-28 h-1.5 bg-white/10 rounded overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300 transition-all duration-500" style={{ width: `${(bandwidth / MAX_BANDWIDTH) * 100}%` }} />
            </div>
            <span className="font-mono font-bold text-cyan-400">{bandwidth}/100</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <PackageIcon size={22} className={packageData.textColor} />
              <span className={`px-3 py-1 text-[10px] font-mono border ${packageData.borderColor} bg-black/50 rounded-full uppercase tracking-widest`}>
                {packageData.category}
              </span>
              <span className="px-3 py-1 text-[10px] font-mono border border-emerald-500/40 text-emerald-400 bg-black/50 rounded-full uppercase tracking-widest">
                ACTIVE CONTRACT
              </span>
            </div>
            <h1 className="text-[6vw] md:text-5xl font-black uppercase leading-none tracking-[-0.03em] text-white">
              {packageData.label}
            </h1>
            <p className="text-sm font-mono text-neutral-400 mt-2">CLIENT ID: #XJ-8922 • STATUS: DEPLOYMENT IN PROGRESS</p>
          </div>
          
          <div className="text-right border-l-2 border-white/10 pl-6 hidden md:block">
            <div className="text-[10px] font-mono text-neutral-400 uppercase">CONTRACT VALUE</div>
            <div className="text-white font-mono text-2xl font-black mt-1">
              ₹{packageData.basePrice.toLocaleString()}
            </div>
          </div>
        </div>
      </header>

      {/* TABS */}
      <div className="flex border-b border-white/10 bg-[#050505]/95 z-40">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={cn(
                  "flex-1 py-4 flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-widest transition-all border-r border-white/10 last:border-r-0",
                  activeTab === tab.id 
                    ? "bg-white text-black font-bold" 
                    : "text-neutral-500 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto bg-[#050505] z-40 no-scrollbar">
        
        {/* DEPLOYMENT TASKS */}
        {activeTab === "TASKS" && (
          <div className="p-6 md:p-10 pb-32 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <Terminal className="text-cyan-500" size={28} />
                <div>
                  <h2 className="text-3xl font-black tracking-tight">FULFILLMENT PROTOCOL</h2>
                  <p className="text-sm font-mono text-neutral-400">Complete stages to release client funds from escrow.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {FULFILLMENT_STAGES.map((task, index) => {
                const TaskIcon = task.icon;
                const isExecuting = executingTask === task.id;
                const isCompleted = completedTasks.includes(task.id);
                // Logic to lock tasks if the previous one isn't finished
                const isLocked = index > 0 && !completedTasks.includes(FULFILLMENT_STAGES[index - 1].id);
                const canVerify = (Date.now() - (executionStart[task.id] || 0)) >= 3000;

                return (
                  <div 
                    key={task.id} 
                    className={cn(
                        "relative bg-[#050505] border transition-all p-6 flex flex-col md:flex-row gap-6 items-start md:items-center",
                        isCompleted ? "border-emerald-500/30 opacity-60" : 
                        isLocked ? "border-white/5 opacity-40 grayscale" : 
                        "border-cyan-500/50 hover:bg-cyan-900/10"
                    )}
                  >
                    {/* Status Indicator */}
                    <div className="flex-none flex items-center justify-center w-12 h-12 rounded-full bg-black border border-white/10">
                        {isCompleted ? <CheckCircle2 className="text-emerald-500" /> :
                         isLocked ? <Lock className="text-neutral-600" /> :
                         <TaskIcon className="text-cyan-400" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="text-[10px] font-mono text-neutral-500 uppercase">STAGE 0{index + 1}</div>
                        {isCompleted && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-sm font-mono">CLEARED</span>}
                      </div>
                      <h3 className="text-xl font-bold tracking-tight">{task.title}</h3>
                      <p className="text-sm text-neutral-400 mt-1 font-mono leading-relaxed">{task.desc}</p>
                    </div>

                    <div className="flex-none w-full md:w-auto flex flex-col items-end gap-4 mt-4 md:mt-0 md:pl-8 md:border-l border-white/10">
                        
                        <div className="w-full flex justify-between md:justify-end gap-6 items-center">
                            <div className="text-left md:text-right">
                                <div className="text-[10px] uppercase text-neutral-500 font-mono">BANDWIDTH</div>
                                <div className="text-sm font-bold flex items-center gap-1 md:justify-end">
                                    <Server size={12} className="text-cyan-500"/> -{task.bandwidth}
                                </div>
                            </div>
                            {task.reward > 0 && (
                                <div className="text-left md:text-right">
                                    <div className="text-[10px] uppercase text-emerald-500 font-mono">ESCROW RELEASE</div>
                                    <div className="text-sm font-bold text-emerald-400">+₹{task.reward.toLocaleString()}</div>
                                </div>
                            )}
                        </div>

                      {/* Action Buttons */}
                      <div className="w-full">
                        {isCompleted ? (
                            <button disabled className="w-full py-2 bg-emerald-500/10 text-emerald-500 font-mono text-xs uppercase tracking-widest border border-emerald-500/20">
                                COMPLETED
                            </button>
                        ) : isLocked ? (
                            <button disabled className="w-full py-2 bg-black text-neutral-600 font-mono text-xs uppercase tracking-widest border border-white/5">
                                LOCKED
                            </button>
                        ) : isExecuting ? (
                            <button 
                              onClick={() => handleVerifyTask(task)}
                              disabled={!canVerify}
                              className="w-full py-2 px-6 bg-cyan-500 text-black font-bold text-xs uppercase tracking-widest disabled:bg-neutral-800 disabled:text-neutral-500 transition-all"
                            >
                              {canVerify ? "VERIFY FINALIZATION" : "EXECUTING..."}
                            </button>
                        ) : (
                            <button 
                              onClick={() => handleStartTask(task)}
                              className="w-full py-2 px-6 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono text-xs uppercase tracking-widest transition-all"
                            >
                              INITIATE STAGE
                            </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CLIENT INTEL / DOSSIER PLACEHOLDER */}
        {activeTab === "CLIENT_COMMS" && (
            <div className="p-10 text-center text-neutral-500 font-mono">
                [CLIENT DOSSIER ENCRYPTED // AWAITING CLEARANCE]
            </div>
        )}

        {/* LEDGER PLACEHOLDER */}
        {activeTab === "LEDGER" && (
            <div className="p-10 text-center text-neutral-500 font-mono">
                [REVENUE LEDGER SYNCING...]
            </div>
        )}

      </div>
    </main>
  );
}