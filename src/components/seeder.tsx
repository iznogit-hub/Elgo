"use client";

import { useState } from "react";
import { doc, writeBatch, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NICHE_DATA } from "@/lib/niche-data"; 
import { Button } from "@/components/ui/button";
import { Database, CheckCircle2, AlertTriangle, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

// Fake Bot Names for the Hit List
const FAKE_BOTS = ["NEON_VIPER", "GRID_GHOST", "CYBER_WOLF", "DATA_RONIN", "NULL_POINTER", "SYNTH_QUEEN", "VOID_WALKER", "ECHO_SIX", "IRON_TITAN", "VELVET_ASSASSIN"];

export default function DatabaseSeeder() {
  const [loading, setLoading] = useState(false);

  // --- ACTION 1: UPLOAD SECTORS ---
  const handleSeedSectors = async () => {
    if (!confirm("Overwrite all Sectors?")) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      Object.entries(NICHE_DATA).forEach(([id, data]) => {
        const ref = doc(db, "sectors", id); 
        // Destructure to remove the React Icon component before saving
        // @ts-ignore
        const { icon, ...cleanData } = data; 
        batch.set(ref, { ...cleanData, lastUpdated: new Date().toISOString() });
      });
      await batch.commit();
      toast.success("SECTORS SYNCED");
    } catch (e) {
      console.error(e);
      toast.error("SECTOR SYNC FAILED");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTION 2: INJECT BOTS ---
  const handleSeedBots = async () => {
    if (!confirm("Inject 10 Bots into User Database?")) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      FAKE_BOTS.forEach((name) => {
        const fakeId = `BOT_${Math.floor(Math.random() * 999999)}`;
        const userRef = doc(db, "users", fakeId);
        
        batch.set(userRef, {
          uid: fakeId,
          username: name,
          email: `${name.toLowerCase()}@sim.net`,
          avatar: `/avatars/${Math.floor(Math.random() * 6) + 1}.jpg`,
          wallet: { popCoins: Math.floor(Math.random() * 5000) + 500, bubblePoints: 0 },
          energy: 100,
          membership: { tier: Math.random() > 0.8 ? "elite" : "recruit" },
          status: "active",
          unlockedNiches: ["general", "tech"],
          guildId: fakeId,
          createdAt: new Date().toISOString(),
          isBot: true // Flag to identify them
        });
      });
      await batch.commit();
      toast.success(`${FAKE_BOTS.length} BOTS DEPLOYED`);
    } catch (e) {
      console.error(e);
      toast.error("BOT INJECTION FAILED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border border-white/10 bg-white/5 rounded-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <Database className="text-cyan-500" size={20} />
        <div>
            <h3 className="text-sm font-black font-sans text-white uppercase">God_Mode_Tools</h3>
            <p className="text-[10px] font-mono text-gray-400">Client-Side Database Management</p>
        </div>
      </div>

      {/* Button 1: Sectors */}
      <div className="space-y-2">
        <p className="text-[9px] font-mono text-gray-500 uppercase">01. Game World Structure</p>
        <Button 
            onClick={handleSeedSectors} 
            disabled={loading}
            className="w-full bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black font-black uppercase text-xs h-10 rounded-sm"
        >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Database className="mr-2" size={14} />}
            Sync Niche Sectors
        </Button>
      </div>

      {/* Button 2: Bots */}
      <div className="space-y-2">
        <p className="text-[9px] font-mono text-gray-500 uppercase">02. Population Control</p>
        <Button 
            onClick={handleSeedBots} 
            disabled={loading}
            className="w-full bg-red-900/20 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-black font-black uppercase text-xs h-10 rounded-sm"
        >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Users className="mr-2" size={14} />}
            Inject 10 Targets
        </Button>
      </div>

    </div>
  );
}