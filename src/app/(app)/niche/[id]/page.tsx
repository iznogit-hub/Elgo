"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, updateDoc, arrayUnion, increment, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { NICHE_DATA } from "@/lib/niche-data";
import { 
  ArrowLeft, ListTodo, Copy, Image as ImageIcon, 
  Music, Play, CheckCircle2, Circle, Coins, Sparkles, FileText,
  Instagram, Users, Download, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { Background } from "@/components/ui/background";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { TransitionLink } from "@/components/ui/transition-link";

const TASK_REWARD = 50; 

export default function NichePage() {
  const params = useParams();
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const { play } = useSfx();
  
  const id = params.id as string;
  // Initialize with local data (fallback/static assets)
  const [nicheData, setNicheData] = useState<any>(NICHE_DATA[id]);
  
  const [selectedDay, setSelectedDay] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [followedCreators, setFollowedCreators] = useState<string[]>([]);
  const [claiming, setClaiming] = useState<string | null>(null);

  // 1. LIVE DATA SYNC
  useEffect(() => {
    // Listen to Firestore for text updates (Scripts/Tasks)
    const unsub = onSnapshot(doc(db, "sectors", id), (docSnap) => {
        if (docSnap.exists()) {
            // Merge: Keep local icons/videos, overwrite text from DB
            setNicheData((prev: any) => ({
                ...prev,
                ...docSnap.data() 
            }));
        }
    });
    return () => unsub();
  }, [id]);

  // 2. SECURITY & USER SYNC
  useEffect(() => {
    if (!loading && userData) {
        const unlocked = userData.unlockedNiches || [];
        if (!unlocked.includes(id)) {
            toast.error("ACCESS_DENIED");
            router.push("/dashboard");
        }
        if ((userData as any).completedTasks) setCompletedTasks((userData as any).completedTasks);
        if ((userData as any).followedCreators) setFollowedCreators((userData as any).followedCreators);
    }
  }, [loading, userData, id, router]);

  if (loading || !userData || !nicheData) return <div className="bg-black min-h-screen" />;

  const currentDayData = nicheData.weekly_schedule[selectedDay];

  // LOGIC
  const handleFollowCreator = async (handle: string, reward: number) => {
      if (!user || followedCreators.includes(handle)) return;
      window.open(`https://instagram.com/${handle.replace('@', '')}`, '_blank');
      play("click");
      setTimeout(async () => {
          if (confirm(`Did you follow ${handle}? Verify to claim ${reward} PC.`)) {
             try {
                 const userRef = doc(db, "users", user.uid);
                 await updateDoc(userRef, {
                     "wallet.popCoins": increment(reward),
                     "followedCreators": arrayUnion(handle)
                 });
                 setFollowedCreators(prev => [...prev, handle]);
                 toast.success(`VERIFIED: +${reward} PC`);
                 play("success");
             } catch (e) {
                 toast.error("FAILED");
             }
          }
      }, 2000);
  };

  const handleCompleteTask = async (taskIndex: number) => {
      if (!user) return;
      const taskId = `${id}_d${selectedDay}_t${taskIndex}`;
      if (completedTasks.includes(taskId)) return;
      setClaiming(taskId);
      play("click");
      try {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
              "wallet.popCoins": increment(TASK_REWARD),
              "completedTasks": arrayUnion(taskId),
              "dailyTracker.bountiesClaimed": increment(1)
          });
          setCompletedTasks(prev => [...prev, taskId]);
          play("success");
          toast.success(`+${TASK_REWARD} PC`);
      } catch (e) {
          toast.error("ERROR");
      } finally {
          setClaiming(null);
      }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      play("click");
      toast.success("COPIED");
  };

  return (
    <main className="relative h-screen w-full bg-black text-white font-sans overflow-hidden flex flex-col">
      <div className="absolute inset-0 pointer-events-none">
        <VideoStage src={nicheData.videoSrc || "/video/main.mp4"} overlayOpacity={0.7} />
        <Background /> 
      </div>

      <header className={cn("flex-none h-16 px-6 flex items-center justify-between border-b bg-black/40 backdrop-blur-xl z-50", `border-${nicheData.color}-500/30`)}>
          <div className="flex items-center gap-4">
              <TransitionLink href="/dashboard" className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-all text-white"><ArrowLeft size={18} /></TransitionLink>
              <div className="flex flex-col">
                  <h1 className="text-lg font-black font-orbitron uppercase italic text-white leading-none">{nicheData.label}</h1>
                  <span className={cn("text-[9px] font-mono tracking-widest uppercase", `text-${nicheData.color}-400`)}>Sector_Online</span>
              </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-black/60 border border-white/10 rounded-sm">
             <Coins size={12} className="text-yellow-500" />
             <span className="text-[10px] font-mono font-bold text-yellow-500">{(userData.wallet?.popCoins || 0).toLocaleString()} PC</span>
          </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 z-40">
          
          {/* 1. CREATORS */}
          {nicheData.featured_creators && nicheData.featured_creators.length > 0 && (
             <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 text-white/60">
                    <Users size={14} className={cn(`text-${nicheData.color}-400`)} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Connect_Nodes</span>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {nicheData.featured_creators.map((creator: any, i: number) => {
                        const isFollowed = followedCreators.includes(creator.handle);
                        return (
                            <button key={i} onClick={() => handleFollowCreator(creator.handle, creator.reward)} disabled={isFollowed} className={cn("flex-none flex items-center gap-3 p-3 border rounded-sm transition-all group min-w-[200px]", isFollowed ? "bg-green-900/10 border-green-500/30 opacity-50" : "bg-white/5 border-white/10 hover:bg-white/10")}>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 to-pink-500 p-[2px]">
                                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center"><Instagram size={14} className="text-white" /></div>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-xs font-bold text-white">{creator.handle}</span>
                                    <span className={cn("text-[8px] font-mono", isFollowed ? "text-green-500" : "text-yellow-500")}>{isFollowed ? "CONNECTED" : `+${creator.reward} PC`}</span>
                                </div>
                            </button>
                        )
                    })}
                </div>
             </section>
          )}

          {/* 2. ASSETS */}
          {(nicheData.assets?.audio?.length > 0 || nicheData.assets?.prompts?.length > 0) && (
              <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                 <div className="flex items-center gap-2 text-white/60">
                    <Download size={14} className={cn(`text-${nicheData.color}-400`)} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sector_Assets</span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     <div className="p-4 bg-white/5 border border-white/10 rounded-sm space-y-3">
                        <span className="text-[9px] font-mono text-gray-400 uppercase block">Audio_Library</span>
                        {nicheData.assets?.audio?.map((track: any, i: number) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-2"><Play size={10} className="text-white" /><span className="text-[10px] text-white">{track.title}</span></div>
                                <span className="text-[8px] font-mono text-gray-500">{track.type}</span>
                            </div>
                        ))}
                     </div>
                     <div className="p-4 bg-white/5 border border-white/10 rounded-sm space-y-3">
                        <span className="text-[9px] font-mono text-gray-400 uppercase block">Midjourney_Prompts</span>
                        {nicheData.assets?.prompts?.map((prompt: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 group cursor-pointer" onClick={() => copyToClipboard(prompt)}>
                                <Copy size={10} className="text-gray-500 mt-0.5 group-hover:text-white" />
                                <span className="text-[9px] text-gray-400 group-hover:text-white transition-colors line-clamp-1">{prompt}</span>
                            </div>
                        ))}
                     </div>
                 </div>
              </section>
          )}

          {/* 3. CAMPAIGN */}
          <section className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <ListTodo size={14} className={cn(`text-${nicheData.color}-400`)} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Active_Campaign</span>
                 </div>
                 <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[150px]">
                    {[0,1,2,3,4,5,6].map(day => (
                        <button key={day} onClick={() => setSelectedDay(day)} className={cn("w-6 h-6 rounded-sm text-[8px] font-bold flex-none flex items-center justify-center transition-all", selectedDay === day ? `bg-${nicheData.color}-600 text-white` : "bg-white/5 text-gray-500 hover:bg-white/10")}>{day + 1}</button>
                    ))}
                 </div>
              </div>

              {/* TASKS */}
              <div className="space-y-2">
                  {currentDayData?.tasks?.map((task: string, i: number) => {
                      const taskId = `${id}_d${selectedDay}_t${i}`;
                      const isComplete = completedTasks.includes(taskId);
                      return (
                          <button key={i} onClick={() => !isComplete && handleCompleteTask(i)} disabled={isComplete || claiming === taskId} className={cn("w-full flex items-center justify-between p-3 border rounded-sm transition-all group text-left", isComplete ? `bg-${nicheData.color}-900/20 border-${nicheData.color}-500/50 opacity-80` : "bg-white/5 border-white/10 hover:border-white/30")}>
                              <div className="flex items-center gap-3">
                                  {isComplete ? <CheckCircle2 size={16} className={cn(`text-${nicheData.color}-500`)} /> : <Circle size={16} className="text-white/20" />}
                                  <span className={cn("text-xs font-mono", isComplete ? "text-gray-500 line-through" : "text-gray-300")}>{task}</span>
                              </div>
                              {!isComplete && <div className="text-[8px] font-bold text-yellow-500 opacity-0 group-hover:opacity-100">+{TASK_REWARD} PC</div>}
                          </button>
                      );
                  })}
              </div>

              {/* SCRIPT */}
              <div className="p-4 bg-black/40 border border-white/10 rounded-sm font-mono text-[10px] text-gray-300 relative group whitespace-pre-wrap leading-relaxed">
                  {currentDayData?.script || "NO INTEL FOR THIS DAY"}
                  <button onClick={() => copyToClipboard(currentDayData?.script || "")} className="absolute top-2 right-2 p-2 bg-white/10 rounded-sm opacity-50 group-hover:opacity-100"><Copy size={12} /></button>
              </div>
          </section>

          <div className="pt-8 pb-4 flex justify-center">
              <div className="flex items-center gap-2 text-white/20">
                  <Sparkles size={12} />
                  <span className="text-[8px] font-mono uppercase">LIVE_UPLINK_ESTABLISHED</span>
              </div>
          </div>

      </div>
    </main>
  );
}