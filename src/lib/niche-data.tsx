import React from "react";
import { 
  Cpu, Camera, Dumbbell, Network, Globe, 
  Briefcase, Music, Terminal, Zap, Gamepad2, 
  Skull, Paintbrush, Plane
} from "lucide-react";

// 🧠 FACTION PROTOCOL GENERATOR
const generateProtocol = (faction: string, focus: string) => {
    return Array.from({ length: 7 }).map((_, i) => ({
        day: i + 1,
        title: `Day 0${i + 1}: ${focus}`,
        tasks: [
            `Connect with 3 other ${faction} Units`,
            `Post content related to ${focus}`,
            `Scout potential rivals in other sectors`
        ],
        script: `FACTION BRIEF: We are the ${faction}. We dominate the ${focus} narrative. Expand our influence today.`,
        audio: "Faction_Anthem_V1",
        prompt: `High-tech ${faction} propaganda poster, ${focus} theme, cinematic lighting --ar 9:16`
    }));
};

// 💎 THE 8 GREAT FACTIONS (Formerly Niches)
export const NICHE_DATA: Record<string, any> = {
  
  // 1. VANGUARD (General/Lifestyle)
  general: { 
      label: "The Vanguard", 
      category: "Lifestyle & Viral",
      description: "The face of the new world. Influencers, Vloggers, and Trendsetters.",
      imageSrc: "/images/sectors/tokyo.jpg",
      icon: <Skull size={14} />, 
      color: "white",
      tags: ["Lifestyle", "Vlog", "Trends", "Personality"],
      base_bounty: 50,
      protocol: generateWeek("Viral Trends", "Mass Appeal")
  },

  // 2. SYNTHWAVE (Tech/AI)
  tech: { 
      label: "Synthwave", 
      category: "Tech & AI",
      description: "Architects of the simulation. Developers, AI Artists, and Futurists.",
      imageSrc: "/images/sectors/tech.jpg",
      icon: <Cpu size={14} />, 
      color: "cyan",
      tags: ["AI", "Coding", "SaaS", "Gadgets"],
      base_bounty: 75,
      protocol: generateWeek("Future Tech", "Innovation")
  },

  // 3. VELVET (Fashion/Beauty)
  fashion: { 
      label: "Velvet Cartel", 
      category: "Fashion & Beauty",
      description: "Visual dominance. Models, Designers, and Aesthetes.",
      imageSrc: "/images/sectors/fashion.jpg",
      icon: <Camera size={14} />, 
      color: "pink",
      tags: ["OOTD", "Makeup", "Streetwear", "Luxury"],
      base_bounty: 60,
      protocol: generateWeek("Aesthetics", "Visuals")
  },

  // 4. TITAN (Fitness)
  fitness: { 
      label: "Titan Legion", 
      category: "Fitness & Health",
      description: "The Iron born. Bodybuilders, Athletes, and Biohackers.",
      imageSrc: "/images/sectors/fitness.jpg",
      icon: <Dumbbell size={14} />, 
      color: "green", 
      tags: ["Gym", "Nutrition", "Sports", "Yoga"],
      base_bounty: 100, 
      protocol: generateWeek("Strength", "Discipline")
  },

  // 5. SYNDICATE (Business/Crypto)
  business: { 
      label: "The Syndicate", 
      category: "Wealth & Crypto",
      description: "Builders of empires. Traders, Entrepreneurs, and Hustlers.",
      imageSrc: "/images/sectors/crypto.jpg",
      icon: <Briefcase size={14} />, 
      color: "yellow", 
      tags: ["Crypto", "Stocks", "Marketing", "Sales"],
      base_bounty: 80,
      protocol: generateWeek("Wealth", "Power")
  },

  // 6. DRIFTERS (Travel)
  travel: { 
      label: "The Drifters", 
      category: "Travel & Exploration",
      description: "Those who roam. Explorers, Foodies, and Photographers.",
      imageSrc: "/images/sectors/travel.jpg",
      icon: <Plane size={14} />, 
      color: "orange", 
      tags: ["Travel", "Food", "Nature", "Photography"],
      base_bounty: 55,
      protocol: generateWeek("Exploration", "Freedom")
  },

  // 7. FREQUENCY (Music/Art)
  art: { 
      label: "Frequency", 
      category: "Art & Music",
      description: "The soul of the grid. Musicians, Dancers, and Digital Artists.",
      imageSrc: "/images/sectors/music.jpg",
      icon: <Music size={14} />, 
      color: "purple", 
      tags: ["Music", "Art", "Dance", "Design"],
      base_bounty: 65,
      protocol: generateWeek("Creativity", "Expression")
  },

  // 8. GLITCH (Gaming)
  gaming: { 
      label: "The Glitch", 
      category: "Gaming & Streaming",
      description: "Virtual warriors. Esports pros, Streamers, and Anime fans.",
      imageSrc: "/images/sectors/gaming.jpg",
      icon: <Gamepad2 size={14} />, 
      color: "lime", 
      tags: ["Gaming", "Esports", "Anime", "Cosplay"],
      base_bounty: 90,
      protocol: generateWeek("Competition", "Skill")
  }
};

export const ALL_SECTORS = Object.keys(NICHE_DATA).map(key => ({ 
    id: key, 
    ...NICHE_DATA[key] 
}));

// Helper to reuse the week generator logic
function generateWeek(topic: string, tone: string) {
    return Array.from({ length: 7 }).map((_, i) => ({
        day: i + 1,
        title: `Protocol_0${i + 1}`,
        tasks: [
            `Scout 3 Targets in ${topic}`,
            `Deploy Content: ${topic} Focus`,
            `Verify 1 Kill in Sector`
        ],
        script: `DAILY MEMO: The ${tone} sector is heating up. Establish dominance in ${topic} today.`,
        audio: "Secure_Channel_V1",
        prompt: `Dark cinematic ${topic} background, 8k resolution --ar 16:9`
    }));
}