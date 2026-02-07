"use client";

import { useState } from "react";
import { doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NICHE_DATA } from "@/lib/niche-data"; // Your local data file
import { Button } from "@/components/ui/button";
import { Database, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DatabaseSeeder() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSeed = async () => {
    if (!confirm("WARNING: This will overwrite all Niche Data in Firestore. Continue?")) return;
    
    setLoading(true);
    try {
      const batch = writeBatch(db);

      // 1. Loop through your local NICHE_DATA
      Object.entries(NICHE_DATA).forEach(([id, data]) => {
        // 2. Create a reference to the 'sectors' collection
        const ref = doc(db, "sectors", id); 
        
        // 3. Prepare the payload 
        // We strip the 'icon' field because React Components can't go to DB.
        const { icon, ...cleanData } = data; 
        
        batch.set(ref, {
            ...cleanData,
            lastUpdated: new Date().toISOString(),
            version: "4.0"
        });
      });

      // 4. Commit the Batch (All or Nothing)
      await batch.commit();
      
      setStatus("success");
      toast.success("DATABASE SYNCED: All Sectors Uploaded.");
    } catch (e) {
      console.error(e);
      setStatus("error");
      toast.error("UPLOAD FAILED: Check Console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border border-white/10 bg-white/5 rounded-sm space-y-4">
      <div className="flex items-center gap-3">
        <Database className="text-cyan-500" size={20} />
        <div>
            <h3 className="text-sm font-black font-sans text-white uppercase">Database_Seeder_V1</h3>
            <p className="text-[10px] font-mono text-gray-400">Push local `NICHE_DATA` to Firestore.</p>
        </div>
      </div>

      <div className="p-4 bg-black/50 border border-white/10 font-mono text-[9px] text-gray-400 rounded-sm">
          TARGET: collection('sectors') <br/>
          PAYLOAD: {Object.keys(NICHE_DATA).length} Documents <br/>
          STATUS: {loading ? "UPLOADING..." : "READY"}
      </div>

      <Button 
        onClick={handleSeed} 
        disabled={loading || status === "success"}
        className="w-full bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black font-black uppercase text-xs h-10 rounded-sm"
      >
        {loading ? <Loader2 className="animate-spin" /> : status === "success" ? <CheckCircle2 /> : <AlertTriangle size={14} className="mr-2" />}
        {loading ? "TRANSMITTING..." : status === "success" ? "SYNC COMPLETE" : "EXECUTE UPLOAD"}
      </Button>
    </div>
  );
}