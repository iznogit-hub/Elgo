"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { collection, getDocs, doc, updateDoc, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Background } from "@/components/ui/background";
import { 
  ShieldAlert, Search, CheckCircle2, XCircle, 
  Crown, DollarSign, Instagram, RefreshCw, Terminal, 
  Lock, AlertTriangle, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSfx } from "@/hooks/use-sfx";

// TYPE DEFINITION
interface AdminUserView {
  uid: string;
  username: string;
  email: string;
  instagramHandle?: string;
  tier: string;
  status: string;
  niche: string;
  metaWhitelisted?: boolean; 
  bubblePoints: number;
}

export default function AdminDashboard() {
  const { userData, loading: authLoading } = useAuth(); 
  const router = useRouter();
  const { play } = useSfx();
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ⚡ ADMIN GATEKEEPER
  // Replace "admin" with your actual admin tier or specific email check
  const isAdmin = userData?.email === "iznoatwork@gmail.com"; // Fallback for dev

  // 1. SECURITY CHECK
  useEffect(() => {
    if (!authLoading) {
        if (!userData) {
            router.push("/auth/login");
        } else if (!isAdmin) {
            toast.error("UNAUTHORIZED ACCESS DETECTED. INCIDENT LOGGED.");
            router.push("/dashboard");
        }
    }
  }, [isAdmin, authLoading, router, userData]);

  // 2. FETCH DATA
  const fetchOperatives = async () => {
    play("click");
    setLoading(true);
    try {
      const q = query(collection(db, "users")); 
      const querySnapshot = await getDocs(q);
      const operatives: AdminUserView[] = [];
      
      querySnapshot.forEach((docSnap) => {
        // Ensure UID is captured correctly
        operatives.push({ ...docSnap.data(), uid: docSnap.id } as AdminUserView);
      });
      
      setUsers(operatives);
      play("success");
    } catch (error) {
      play("error");
      toast.error("DATABASE CONNECTION FAILED.");
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    if (isAdmin) fetchOperatives();
  }, [isAdmin]);

  // --- ACTIONS ---

  const handleApprovePayment = async (uid: string, username: string) => {
    if (!confirm(`CONFIRM: Receive ₹49,999 from ${username}?`)) return;
    play("click");
    setProcessing(uid);

    try {
      const ref = doc(db, "users", uid);
      await updateDoc(ref, {
        tier: "inner_circle",
        bubblePoints: 5000, 
        status: "active"
      });
      toast.success(`${username} PROMOTED TO WARLORD.`);
      await fetchOperatives(); 
    } catch (e) {
      play("error");
      toast.error("UPDATE FAILED.");
    } finally {
      setProcessing(null);
    }
  };

  const handleConfirmWhitelist = async (uid: string, username: string) => {
    play("click");
    setProcessing(uid);
    try {
      const ref = doc(db, "users", uid);
      await updateDoc(ref, {
        metaWhitelisted: true,
        status: "active"
      });
      toast.success(`${username} SIGNALED FOR CONNECTION.`);
      await fetchOperatives();
    } catch (e) {
      play("error");
      toast.error("UPDATE FAILED.");
    } finally {
      setProcessing(null);
    }
  };

  const handleBan = async (uid: string) => {
    if (!confirm("WARNING: Execute PURGE protocol on this user?")) return;
    play("error"); 
    setProcessing(uid);
    try {
      await updateDoc(doc(db, "users", uid), { status: "banned" });
      toast.success("USER PURGED.");
      await fetchOperatives();
    } catch (e) {
      toast.error("ERROR.");
    } finally {
      setProcessing(null);
    }
  };

  // FILTER LOGIC
  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render Nothing while checking auth to prevent flicker
  if (authLoading || (!isAdmin && !loading)) return null;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pb-24 font-mono relative overflow-x-hidden selection:bg-red-900 selection:text-white">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Background />
      </div>

      {/* HEADER */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-red-900/30 pb-6 gap-6">
        <div>
          <div className="flex items-center gap-2 text-red-500 mb-2 animate-pulse">
            <ShieldAlert className="w-5 h-5" />
            <span className="font-bold tracking-[0.3em] text-xs">GOD_MODE // ADMIN_ACCESS</span>
          </div>
          <h1 className="text-4xl font-black text-white font-orbitron">
            <HackerText text="OPERATIONS COMMAND" />
          </h1>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <Button 
            onClick={fetchOperatives} 
            variant="outline" 
            className="border-red-900/50 hover:bg-red-950/20 text-red-400 font-bold"
            onMouseEnter={() => play("hover")}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> REFRESH INTEL
          </Button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative z-10 mb-8 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
          <Input 
            placeholder="Search Operative by Name or Email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black/50 border-white/10 pl-12 h-14 text-white focus:border-red-500 font-mono"
            onFocus={() => play("hover")}
          />
        </div>
      </div>

      {/* --- SECTION 1: PENDING WHITELIST (Priority) --- */}
      <section className="relative z-10 mb-16">
        <div className="flex items-center gap-3 mb-6">
            <Instagram className="w-5 h-5 text-yellow-500" /> 
            <h3 className="text-xl font-bold font-orbitron text-yellow-500">PENDING META WHITELIST</h3>
            <span className="text-[10px] bg-yellow-900/20 border border-yellow-600/30 px-2 py-1 rounded text-yellow-500 font-bold animate-pulse">
                ACTION REQUIRED
            </span>
        </div>
        
        <div className="grid gap-4">
          {filteredUsers.filter(u => u.tier === "inner_circle" && !u.metaWhitelisted).map(user => (
            <div key={user.uid} className="bg-yellow-950/10 border border-yellow-500/30 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:bg-yellow-950/20 transition-colors">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-12 h-12 bg-yellow-900/20 rounded-full flex items-center justify-center border border-yellow-600/50">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-lg">{user.username}</h4>
                    <span className="text-[10px] bg-red-900/50 border border-red-500/30 text-red-200 px-1.5 py-0.5 rounded font-mono">VIP</span>
                  </div>
                  <p className="text-sm text-gray-400 font-mono mt-1">
                    <span className="text-yellow-600">ID:</span> {user.email}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <div className="text-right text-[10px] text-gray-500 font-mono hidden md:block">
                  [Step 1] Add to Meta App Dashboard<br/>
                  [Step 2] Confirm Here
                </div>
                <Button 
                  onClick={() => handleConfirmWhitelist(user.uid, user.username)}
                  disabled={processing === user.uid}
                  className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold h-12 px-6 w-full md:w-auto"
                  onMouseEnter={() => play("hover")}
                >
                  {processing === user.uid ? <Loader2 className="animate-spin" /> : "CONFIRM WHITELIST"}
                </Button>
              </div>
            </div>
          ))}
          {filteredUsers.filter(u => u.tier === "inner_circle" && !u.metaWhitelisted).length === 0 && (
            <div className="p-8 border border-white/5 rounded-xl text-center text-gray-600 italic font-mono bg-black/40">
                No operatives waiting for whitelist protocol.
            </div>
          )}
        </div>
      </section>

      {/* --- SECTION 2: ALL OPERATIVES --- */}
      <section className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-5 h-5 text-cyan-500" />
            <h3 className="text-xl font-bold font-orbitron text-cyan-500">FIELD OPERATIVES DATABASE</h3>
        </div>

        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div key={user.uid} className="bg-[#0A0A0A]/80 border border-white/5 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4 hover:border-cyan-500/30 transition-all">
              
              {/* INFO */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${user.tier === 'inner_circle' ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-cyan-500'}`} />
                  <p className="font-bold text-white truncate font-orbitron tracking-wide">{user.username}</p>
                  {user.status === 'banned' && <span className="text-[10px] bg-red-950 text-red-500 px-2 rounded border border-red-900">PURGED</span>}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 font-mono">
                    <span>{user.email}</span>
                    <span className="text-cyan-700">//</span>
                    <span className="uppercase text-gray-400">{user.niche || "GENERAL"}</span>
                    <span className="text-cyan-700">//</span>
                    <span className="uppercase text-yellow-600">{user.tier}</span>
                    <span className="text-cyan-700">//</span>
                    <span className="text-white">{user.bubblePoints} BP</span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 w-full md:w-auto justify-end">
                {/* UPGRADE BUTTON (If Free) */}
                {user.tier !== "inner_circle" && user.status !== "banned" && (
                  <Button 
                    size="sm" 
                    onClick={() => handleApprovePayment(user.uid, user.username)}
                    disabled={processing === user.uid}
                    className="bg-green-900/10 text-green-500 border border-green-900/50 hover:bg-green-500 hover:text-black font-mono text-[10px] h-8"
                    onMouseEnter={() => play("hover")}
                  >
                    {processing === user.uid ? <Loader2 className="w-3 h-3 animate-spin" /> : <><DollarSign className="w-3 h-3 mr-1" /> APPROVE PAY</>}
                  </Button>
                )}

                {/* BAN BUTTON */}
                {user.status !== "banned" && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleBan(user.uid)}
                    className="text-gray-600 hover:text-red-500 hover:bg-red-950/30 h-8 w-8 p-0"
                    title="Purge User"
                    onMouseEnter={() => play("hover")}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
                
                {user.status === "banned" && (
                    <Button size="sm" variant="ghost" disabled className="text-red-900 h-8 w-8 p-0">
                        <Lock className="w-3 h-3" />
                    </Button>
                )}
              </div>

            </div>
          ))}
        </div>
      </section>

    </div>
  );
}