"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  collection, doc, updateDoc, query, increment, onSnapshot, orderBy 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { 
  ArrowLeft, Globe, Banknote, CheckCircle2, Zap, Users, ExternalLink, Cpu, Target, Terminal, Coins
} from "lucide-react";
import { toast } from "sonner";
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Background } from "@/components/ui/background";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// === USE NEW NICHE DATA ===
import { MARKETING_PACKAGES } from "@/lib/niche-data";

export default function OverseerPage() {
  const { userData, loading: authLoading } = useAuth(); 
  const router = useRouter();
  const { play } = useSfx();
  
  const [activeTab, setActiveTab] = useState<"PAYMENTS" | "WEBSITES" | "TASKS" | "CLIENTS">("PAYMENTS");
  
  const [clients, setClients] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  
  const [vercelLinks, setVercelLinks] = useState<Record<string, string>>({});
  const [proofLinks, setProofLinks] = useState<Record<string, string>>({});
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const isOverseer = userData?.email === "iznoatwork@gmail.com"; 

  useEffect(() => {
    if (!authLoading) {
      if (!userData) router.push("/auth/login");
      else if (!isOverseer) {
        play("error");
        toast.error("CLEARANCE DENIED // UNAUTHORIZED");
        router.push("/dashboard");
      }
    }
  }, [isOverseer, authLoading, router, userData, play]);

  useEffect(() => {
    if (!isOverseer) return;

    const unsubClients = onSnapshot(query(collection(db, "users")), (snap) => {
        setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubPayments = onSnapshot(query(collection(db, "payment_attempts"), orderBy("timestamp", "desc")), (snap) => {
        setPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setLoading(false);
    return () => { unsubClients(); unsubPayments(); };
  }, [isOverseer]);

  // DERIVED STATES
  const pendingInitialDeployments = clients.filter(c => c.deployment?.paymentStatus === "pending_verification");
  const pendingWebsites = clients.filter(c => c.deployment?.paymentStatus === "verified" && c.deployment?.status !== "live");
  
  // UNIQUE TASK KEY FIX: Ensure the flatMap generates a truly unique composite key
  const pendingTasks = clients.flatMap(c => 
    (c.deployment?.tasks || [])
      .filter((t: any) => t.status === "pending")
      .map((t: any, index: number) => ({ 
        client: c, 
        task: t, 
        uniqueKey: `${c.id}_${t.id}_${index}` // Composite unique key
      }))
  );

  const unverifiedTopups = payments.filter(p => p.status === "pending" || p.status === "QR_Shown");

  const handleVerifyInitialPayment = async (client: any) => {
      if (!confirm(`Verify deployment payment for ${client.deployment?.brandData?.name || client.username}?`)) return;
      play("success");
      setProcessing(client.id);
      
      try {
          const selectedTemplate = client.deployment?.selectedTemplate;
          const selectedAddons = client.deployment?.selectedAddons || [];
          const newTasks: any[] = [];
          
          if (selectedTemplate && MARKETING_PACKAGES[selectedTemplate]) {
              const niche = MARKETING_PACKAGES[selectedTemplate];
              
              newTasks.push({
                  id: `base_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, 
                  title: `Deploy Architecture: ${niche.label}`,
                  description: `Configure Next.js engine, connect domain (${client.deployment?.brandData?.domain || "Pending"}), and apply color profile (${client.deployment?.brandData?.colors || "Default"}).`,
                  status: "pending",
                  proofUrl: "",
                  pkgName: "BASE_ENGINE"
              });

              selectedAddons.forEach((addonId: string) => {
                  const addon = niche.addons?.find((a: any) => a.id === addonId);
                  if (addon) {
                      newTasks.push({
                          // Ensure ID uniqueness by including timestamp and random string
                          id: `addon_${addon.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, 
                          title: `Integrate Module: ${addon.name}`,
                          description: "Setup and configure this niche-specific payload.",
                          status: "pending",
                          proofUrl: "",
                          pkgName: "ADDON_MODULE"
                      });
                  }
              });
          }

          const existingTasks = client.deployment?.tasks || [];

          await updateDoc(doc(db, "users", client.id), { 
              "deployment.paymentStatus": "verified",
              "websiteStatus": "building",
              "deployment.tasks": [...existingTasks, ...newTasks]
          });
          
          toast.success(`VERIFIED // BUILD TIMER INITIATED`);
      } catch (e) { toast.error("VERIFICATION FAILED"); } 
      finally { setProcessing(null); }
  };

  const handleVerifyTopup = async (payment: any) => {
      if (!confirm(`Verify ₹${payment.amount} and inject credits?`)) return;
      play("kaching");
      setProcessing(payment.id);
      
      try {
          const creditsToAdd = Math.floor(payment.amount / 100); 
          await updateDoc(doc(db, "users", payment.uid), { "wallet.credits": increment(creditsToAdd) });
          await updateDoc(doc(db, "payment_attempts", payment.id), { status: "verified" });
          toast.success(`VERIFIED // ${creditsToAdd} CR INJECTED`);
      } catch (e) { toast.error("VERIFICATION FAILED"); } 
      finally { setProcessing(null); }
  };

  const handleMarkWebsiteLive = async (clientId: string) => {
      const link = vercelLinks[clientId];
      if (!link || !link.includes("vercel.app")) {
        return toast.error("PLEASE ENTER A VALID VERCEL URL");
      }

      play("success");
      setProcessing(clientId);
      try {
          await updateDoc(doc(db, "users", clientId), { 
            websiteStatus: "live",
            "deployment.status": "live",
            "deployment.vercelUrl": link
          });
          toast.success("WEBSITE DEPLOYED // URL PUSHED TO CLIENT");
      } catch (e) { toast.error("DEPLOYMENT UPDATE FAILED"); }
      finally { setProcessing(null); }
  };

  const handleMarkTaskComplete = async (clientId: string, taskId: string) => {
      const link = proofLinks[taskId] || "";
      play("success");
      setProcessing(taskId);
      
      try {
          const client = clients.find(c => c.id === clientId);
          const updatedTasks = client.deployment.tasks.map((t: any) =>
              t.id === taskId ? { ...t, status: "completed", proofUrl: link } : t
          );
          
          await updateDoc(doc(db, "users", clientId), { "deployment.tasks": updatedTasks });
          toast.success("TASK COMPLETED // PROOF PUSHED TO CLIENT DASHBOARD");
      } catch (e) { toast.error("UPDATE FAILED"); }
      finally { setProcessing(null); }
  };

  if (authLoading || (!isOverseer && !loading)) return null;

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col selection:bg-cyan-500 selection:text-black">
      <Background /> 
      <SoundPrompter />

      <header className="relative z-50 flex-none border-b border-cyan-900/50 bg-black/95 backdrop-blur-2xl">
        <div className="px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <TransitionLink href="/dashboard" className="group flex items-center gap-4">
            <div className="w-12 h-12 border border-cyan-600/40 bg-black/70 backdrop-blur-md flex items-center justify-center group-hover:border-cyan-400 transition-all rounded-lg">
              <ArrowLeft size={24} className="text-cyan-500 group-hover:text-cyan-300" />
            </div>
            <div>
              <HackerText text="OVERSEER_TERMINAL" className="text-2xl font-black text-cyan-400 leading-none" />
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.3em] mt-1">Global Command Center</p>
            </div>
          </TransitionLink>

          <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-red-950/40 border border-red-500/30 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Banknote size={14} className="text-red-400" />
                  <span className="text-[10px] font-mono text-red-400 uppercase font-bold">{pendingInitialDeployments.length + unverifiedTopups.length} PAYMENTS</span>
              </div>
              <div className="bg-yellow-950/40 border border-yellow-500/30 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Globe size={14} className="text-yellow-400" />
                  <span className="text-[10px] font-mono text-yellow-400 uppercase font-bold">{pendingWebsites.length} SITES</span>
              </div>
              <div className="bg-purple-950/40 border border-purple-500/30 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Target size={14} className="text-purple-400" />
                  <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">{pendingTasks.length} TASKS</span>
              </div>
          </div>
        </div>

        <div className="flex border-t border-white/5">
          {["PAYMENTS", "WEBSITES", "TASKS", "CLIENTS"].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as any)} 
              className={cn("flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2", 
              activeTab === tab ? "bg-cyan-950/30 text-cyan-400 border-cyan-500" : "text-neutral-500 border-transparent hover:text-white")}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="relative z-40 flex-1 p-4 md:p-8 overflow-hidden">
        <ScrollArea className="h-full pr-4">
            
            {activeTab === "PAYMENTS" && (
                <div className="max-w-5xl mx-auto space-y-12">
                    <div>
                      <h2 className="text-xs font-mono text-cyan-500 mb-4 border-b border-white/10 pb-2 uppercase tracking-widest">Initial Deployments</h2>
                      {pendingInitialDeployments.length === 0 ? <div className="text-neutral-600 font-mono text-xs italic">No pending deployments.</div> : null}
                      <div className="space-y-4">
                        {pendingInitialDeployments.map(c => {
                            const nicheLabel = c.deployment?.selectedTemplate ? MARKETING_PACKAGES[c.deployment.selectedTemplate]?.label : "UNKNOWN";
                            return (
                              <div key={c.id} className="bg-neutral-950 border border-cyan-900/50 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-cyan-500/50 transition-all">
                                  <div>
                                      <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-black uppercase text-white">{c.deployment?.brandData?.name || c.username}</h3>
                                        <div className="text-[9px] bg-cyan-950/50 text-cyan-400 px-2 py-0.5 rounded border border-cyan-900">NEW_BUILD</div>
                                      </div>
                                      <p className="text-[10px] font-mono text-neutral-400 mb-2">{c.email}</p>
                                      <div className="flex flex-wrap gap-2 mt-3">
                                        <span className="text-[9px] font-mono text-emerald-400 border border-emerald-900 bg-emerald-950/30 px-2 py-1 rounded">Architecture: {nicheLabel}</span>
                                        <span className="text-[9px] font-mono text-purple-400 border border-purple-900 bg-purple-950/30 px-2 py-1 rounded">Addons: {c.deployment?.selectedAddons?.length || 0}</span>
                                      </div>
                                  </div>
                                  <Button onClick={() => handleVerifyInitialPayment(c)} disabled={processing === c.id} className="h-14 px-8 bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase tracking-widest text-xs shrink-0">
                                      Verify Deployment <Cpu size={16} className="ml-2"/>
                                  </Button>
                              </div>
                            );
                        })}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-xs font-mono text-green-500 mb-4 border-b border-white/10 pb-2 uppercase tracking-widest">Wallet Top-Ups</h2>
                      {unverifiedTopups.length === 0 ? <div className="text-neutral-600 font-mono text-xs italic">No pending top-ups.</div> : null}
                      <div className="space-y-4">
                        {unverifiedTopups.map(p => (
                            <div key={p.id} className="bg-neutral-950 border border-green-900/50 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-green-500/50 transition-all">
                                <div>
                                    <h3 className="text-lg font-bold uppercase text-white mb-1">{p.brandName || p.username}</h3>
                                    <p className="text-xs font-mono text-green-400">Amount: ₹{p.amount?.toLocaleString()}</p>
                                </div>
                                <Button onClick={() => handleVerifyTopup(p)} disabled={processing === p.id} className="h-12 px-8 bg-green-600 hover:bg-green-500 text-black font-black uppercase tracking-widest text-xs shrink-0">
                                    Inject {Math.floor(p.amount / 100)} CR <Zap size={16} className="ml-2"/>
                                </Button>
                            </div>
                        ))}
                      </div>
                    </div>
                </div>
            )}

            {activeTab === "WEBSITES" && (
                <div className="max-w-5xl mx-auto space-y-6">
                    {pendingWebsites.length === 0 ? <div className="text-neutral-600 font-mono text-xs italic text-center mt-10">No websites pending deployment.</div> : null}
                    {pendingWebsites.map(client => (
                        <div key={client.id} className="bg-neutral-950 border border-yellow-900/50 p-6 rounded-2xl space-y-6 hover:border-yellow-500/50 transition-all">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                      <div className="w-4 h-4 rounded-full border border-white/20" style={{backgroundColor: client.deployment?.brandData?.colors}}/>
                                      <h3 className="text-xl font-black uppercase text-white">{client.deployment?.brandData?.name || "UNNAMED"}</h3>
                                    </div>
                                    <p className="text-[10px] font-mono text-emerald-400 mt-2">Architecture: {client.deployment?.selectedTemplate ? MARKETING_PACKAGES[client.deployment.selectedTemplate]?.label : "N/A"}</p>
                                    <p className="text-[10px] font-mono text-cyan-400 mt-1">Domain: {client.deployment?.brandData?.domain || "N/A"}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="text-[10px] font-mono text-neutral-500 uppercase">Started</div>
                                  <div className="text-xs font-bold text-yellow-500">{new Date(client.deployment?.startTime).toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Input 
                                    placeholder="Paste Live URL..." 
                                    className="flex-1 bg-black border-white/10 text-xs font-mono h-14"
                                    value={vercelLinks[client.id] || ""}
                                    onChange={(e) => setVercelLinks({...vercelLinks, [client.id]: e.target.value})}
                                />
                                <Button onClick={() => handleMarkWebsiteLive(client.id)} disabled={processing === client.id} className="h-14 px-8 bg-yellow-600 hover:bg-yellow-500 text-black font-black uppercase tracking-widest text-xs whitespace-nowrap">
                                    Launch Site <Globe size={16} className="ml-2"/>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* === TASKS TAB: UNIQUE KEY FIX APPLIED HERE === */}
            {activeTab === "TASKS" && (
                <div className="max-w-5xl mx-auto space-y-6">
                    {pendingTasks.length === 0 ? <div className="text-neutral-600 font-mono text-xs italic text-center mt-10">No setup tasks pending.</div> : null}
                    
                    {pendingTasks.map(({ client, task, uniqueKey }) => (
                        <div key={uniqueKey} className="bg-neutral-950 border border-purple-900/50 p-6 rounded-2xl space-y-6 hover:border-purple-500/50 transition-all flex flex-col group">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                      <Terminal size={12}/> {client.deployment?.brandData?.name || client.username} /// {task.pkgName}
                                    </div>
                                    <h3 className="text-lg font-bold text-white tracking-wide">{task.title}</h3>
                                    <p className="text-xs font-mono text-neutral-400 mt-2">{task.description}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                                <Input 
                                  placeholder="Proof Link..." 
                                  className="flex-1 bg-black border-white/10 text-xs font-mono h-12"
                                  value={proofLinks[task.id] || ""}
                                  onChange={(e) => setProofLinks({...proofLinks, [task.id]: e.target.value})}
                                />
                                <Button onClick={() => handleMarkTaskComplete(client.id, task.id)} disabled={processing === task.id} className="h-12 px-8 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-xs shrink-0">
                                    Mark Executed <CheckCircle2 size={16} className="ml-2"/>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "CLIENTS" && (
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map(c => (
                        <div key={c.id} className="bg-neutral-950 border border-white/10 p-6 rounded-2xl hover:border-white/30 transition-colors">
                            <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
                              <div className="overflow-hidden">
                                <h3 className="text-base font-black text-white truncate uppercase">{c.deployment?.brandData?.name || c.username}</h3>
                                <p className="text-[10px] font-mono text-neutral-500 truncate">{c.email}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-black p-3 rounded-lg border border-white/5">
                                    <span className="block text-[9px] text-neutral-500 uppercase mb-1 tracking-widest">Niche</span>
                                    <span className="font-bold text-cyan-400 text-[10px] uppercase truncate block">{c.deployment?.selectedTemplate ? MARKETING_PACKAGES[c.deployment.selectedTemplate]?.label : "N/A"}</span>
                                </div>
                                <div className="bg-black p-3 rounded-lg border border-white/5">
                                    <span className="block text-[9px] text-neutral-500 uppercase mb-1 tracking-widest">Status</span>
                                    <span className={cn("font-bold text-sm", c.websiteStatus === "live" ? "text-green-500" : "text-yellow-500")}>
                                      {c.websiteStatus === "live" ? "LIVE" : "BUILDING"}
                                    </span>
                                </div>
                            </div>

                            {c.deployment?.vercelUrl && (
                                <a href={c.deployment.vercelUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/5 group">
                                  <span className="text-xs font-mono text-neutral-400 group-hover:text-white truncate">Open Live Site</span>
                                  <ExternalLink size={14} className="text-neutral-500 group-hover:text-white shrink-0"/>
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}

        </ScrollArea>
      </div>
    </main>
  );
}