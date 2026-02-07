"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NICHE_DATA } from "@/lib/niche-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save, Loader2, RefreshCw, Layers, 
  FileText, ListTodo, Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CampaignManager() {
  const [loading, setLoading] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState<string>("general");
  const [selectedDay, setSelectedDay] = useState<number>(0); // 0-6
  
  // The Live Data we are editing
  const [campaignData, setCampaignData] = useState<any>(null);

  // 1. FETCH LIVE DATA
  const fetchSectorData = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "sectors", selectedNiche);
      const snap = await getDoc(docRef);
      
      // Get base data from local file
      const baseData = NICHE_DATA[selectedNiche] || NICHE_DATA["general"];

      if (snap.exists()) {
        // Merge DB data with local structure to ensure safety
        // Priority: DB Data > Local Data
        setCampaignData({ ...baseData, ...snap.data() });
      } else {
        // Fallback to local default if DB is empty
        setCampaignData(baseData);
      }
      toast.success(`LOADED: ${selectedNiche.toUpperCase()}`);
    } catch (e) {
      toast.error("FETCH FAILED");
    } finally {
      setLoading(false);
    }
  };

  // Initial Load & On Change
  useEffect(() => {
    fetchSectorData();
  }, [selectedNiche]);

  // 2. SAVE UPDATES
  const handleSave = async () => {
    if (!campaignData) return;
    setLoading(true);
    try {
      const docRef = doc(db, "sectors", selectedNiche);
      
      // We overwrite the sector data with our new state
      // We strip the 'icon' because Firestore cannot store React Components
      const { icon, ...cleanData } = campaignData;

      await setDoc(docRef, cleanData, { merge: true });
      
      toast.success("CAMPAIGN UPDATED LIVE");
    } catch (e) {
      console.error(e);
      toast.error("SAVE FAILED");
    } finally {
      setLoading(false);
    }
  };

  // Helper to update specific fields in the nested array
  const updateDayField = (field: string, value: any) => {
    if (!campaignData) return;
    // NOTE: We use 'protocol' here because that's what we defined in niche-data.tsx
    const newSchedule = [...(campaignData.protocol || [])];
    
    if (!newSchedule[selectedDay]) return; // Safety check

    newSchedule[selectedDay] = {
        ...newSchedule[selectedDay],
        [field]: value
    };
    setCampaignData({ ...campaignData, protocol: newSchedule });
  };

  const updateTask = (taskIndex: number, value: string) => {
    if (!campaignData) return;
    const newSchedule = [...(campaignData.protocol || [])];
    
    if (!newSchedule[selectedDay]) return;

    const newTasks = [...newSchedule[selectedDay].tasks];
    newTasks[taskIndex] = value;
    newSchedule[selectedDay] = { ...newSchedule[selectedDay], tasks: newTasks };
    setCampaignData({ ...campaignData, protocol: newSchedule });
  };

  if (!campaignData) return <div className="p-4 text-xs font-mono text-gray-500 animate-pulse">INITIALIZING UPLINK...</div>;

  // Safety check for day data
  const currentDayData = campaignData.protocol?.[selectedDay] || { script: "", prompt: "", tasks: ["", "", ""] };

  return (
    <div className="p-6 border border-white/10 bg-black/40 rounded-sm space-y-6">
      
      {/* HEADER & SELECTION */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
            <Layers className="text-yellow-500" size={20} />
            <div>
                <h3 className="text-sm font-black font-sans text-white uppercase">Campaign_Manager</h3>
                <p className="text-[10px] font-mono text-gray-400">Manual Override Protocol</p>
            </div>
        </div>

        <div className="flex gap-2">
            <select 
                value={selectedNiche} 
                onChange={(e) => setSelectedNiche(e.target.value)}
                className="bg-black border border-white/20 text-xs font-mono p-2 rounded-sm text-white uppercase outline-none focus:border-yellow-500"
            >
                {Object.keys(NICHE_DATA).map(key => (
                    <option key={key} value={key}>{NICHE_DATA[key].label}</option>
                ))}
            </select>
            <Button onClick={fetchSectorData} size="icon" variant="outline" className="h-9 w-9 border-white/20 bg-black text-white hover:bg-white/10 rounded-sm">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </Button>
        </div>
      </div>

      {/* DAY SELECTOR */}
      <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
        {[0,1,2,3,4,5,6].map(i => (
            <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={cn(
                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all rounded-sm whitespace-nowrap",
                    selectedDay === i 
                        ? "bg-yellow-500 text-black border-yellow-500" 
                        : "bg-white/5 text-gray-500 border-white/10 hover:text-white"
                )}
            >
                Day {i + 1}
            </button>
        ))}
      </div>

      {/* EDITOR FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300" key={`${selectedNiche}-${selectedDay}`}>
          
          {/* LEFT: SCRIPT & PROMPTS */}
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-mono text-cyan-500 flex items-center gap-2 font-bold">
                    <FileText size={12} /> VIRAL SCRIPT
                </label>
                <Textarea 
                    value={currentDayData.script}
                    onChange={(e) => updateDayField("script", e.target.value)}
                    className="h-40 bg-black/50 border-white/10 font-mono text-[10px] leading-relaxed focus:border-cyan-500 text-gray-300 rounded-sm"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-mono text-pink-500 flex items-center gap-2 font-bold">
                    <ImageIcon size={12} /> MIDJOURNEY PROMPT
                </label>
                <Textarea 
                    value={currentDayData.prompt}
                    onChange={(e) => updateDayField("prompt", e.target.value)}
                    className="h-20 bg-black/50 border-white/10 font-mono text-[10px] focus:border-pink-500 text-gray-300 rounded-sm"
                />
             </div>
          </div>

          {/* RIGHT: TASKS */}
          <div className="space-y-4">
              <label className="text-[10px] font-mono text-green-500 flex items-center gap-2 font-bold">
                 <ListTodo size={12} /> DAILY TASKS (3)
              </label>
              {[0, 1, 2].map(i => (
                  <div key={i} className="flex gap-2">
                      <span className="text-[10px] font-mono text-gray-500 pt-3">0{i+1}</span>
                      <Input 
                        value={currentDayData.tasks?.[i] || ""}
                        onChange={(e) => updateTask(i, e.target.value)}
                        className="bg-black/50 border-white/10 font-mono text-[10px] h-10 focus:border-green-500 text-gray-300 rounded-sm"
                      />
                  </div>
              ))}
              
              <div className="pt-8">
                  <Button 
                    onClick={handleSave} 
                    disabled={loading} 
                    className="w-full h-12 bg-yellow-500 text-black font-black uppercase text-xs tracking-widest hover:bg-yellow-400 rounded-sm"
                  >
                     {loading ? <Loader2 className="animate-spin" /> : <Save size={16} className="mr-2" />}
                     PUBLISH UPDATES TO APP
                  </Button>
              </div>
          </div>
      </div>

    </div>
  );
}