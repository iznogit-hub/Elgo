"use client";

import { Button } from "@/components/ui/button";
import { Lock, Zap, Shirt } from "lucide-react"; // Added Shirt for fallback
import { Suspense } from "react";
// ⚠️ UNCOMMENT BELOW ONLY IF YOU HAVE THE COMPONENT & MODELS READY
// import OperativeViewer from "@/components/canvas/operative-viewer";

const SKINS = [
  { id: "stealth_ops", name: "STEALTH OPS", cost: 2000, model: "/models/stealth.glb", tier: "common" },
  { id: "neon_demon", name: "NEON DEMON", cost: 5000, model: "/models/neon.glb", tier: "rare" },
  { id: "gold_emperor", name: "GOLD EMPEROR", cost: 10000, model: "/models/gold.glb", tier: "legendary" },
];

interface SkinsTabProps {
  userBalance: number;
  onBuy: (item: any) => void;
}

export function SkinsTab({ userBalance, onBuy }: SkinsTabProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {SKINS.map((skin) => {
        const canAfford = userBalance >= skin.cost;
        
        return (
          <div key={skin.id} className="bg-black/40 border border-white/10 rounded-xl overflow-hidden group hover:border-cyan-500 transition-all relative">
            
            {/* 3D PREVIEW CONTAINER */}
            <div className="h-48 bg-gradient-to-b from-gray-900 to-black relative flex items-center justify-center overflow-hidden">
               {/* ⬇️ REPLACE THIS BLOCK WITH <OperativeViewer ... /> WHEN READY 
               */}
               <div className="opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-700">
                  <Shirt className={`w-24 h-24 ${
                      skin.tier === 'legendary' ? 'text-yellow-500' : 
                      skin.tier === 'rare' ? 'text-purple-500' : 'text-gray-500'
                  }`} />
               </div>
               {/* ⬆️ END PLACEHOLDER 
               */}

              {/* TIER BADGE */}
              <div className={`absolute top-2 right-2 px-2 py-0.5 text-[9px] font-bold uppercase rounded tracking-widest ${
                skin.tier === 'legendary' ? 'bg-yellow-500 text-black shadow-[0_0_10px_#eab308]' : 
                skin.tier === 'rare' ? 'bg-purple-500 text-white shadow-[0_0_10px_#a855f7]' : 'bg-gray-800 text-gray-300'
              }`}>
                {skin.tier}
              </div>
            </div>

            <div className="p-4 relative z-10 bg-black/50 backdrop-blur-sm">
              <h3 className="font-bold text-white font-orbitron tracking-wide text-lg">{skin.name}</h3>
              
              <div className="flex justify-between items-center mt-4 border-t border-white/10 pt-4">
                <span className={`font-mono font-bold flex items-center gap-1 ${canAfford ? "text-yellow-400" : "text-red-500"}`}>
                  <Zap className="w-3 h-3 fill-current" /> {skin.cost.toLocaleString()}
                </span>
                
                <Button 
                  size="sm" 
                  onClick={() => onBuy(skin)}
                  disabled={!canAfford}
                  className={`
                    font-mono text-xs
                    ${canAfford 
                        ? "bg-white/10 hover:bg-cyan-500 hover:text-black text-white" 
                        : "bg-white/5 text-gray-500 cursor-not-allowed"}
                  `}
                >
                  {!canAfford ? <Lock className="w-3 h-3 mr-1" /> : null}
                  {canAfford ? "ACQUIRE" : "LOCKED"}
                </Button>
              </div>
            </div>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 border border-cyan-500/0 group-hover:border-cyan-500/50 rounded-xl transition-all duration-500 pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
}