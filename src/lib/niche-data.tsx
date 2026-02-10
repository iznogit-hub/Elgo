import React from "react";
import { 
  Cpu, Camera, Dumbbell, Globe, 
  Briefcase, Music, Zap, Gamepad2, 
  Skull, Plane, UserPlus, Heart, MessageCircle, Share2, Eye
} from "lucide-react";

// --- 1. FACTION DEFINITIONS ---
export const NICHE_DATA: Record<string, any> = {
  
  // 1. VANGUARD (General/Lifestyle)
  general: { 
      label: "The Vanguard", 
      category: "Lifestyle & Viral",
      description: "The face of the new world. Influencers, Vloggers, and Trendsetters.",
      imageSrc: "/images/sectors/general.jpg", // User must add this image
      icon: Skull, 
      color: "text-white",
      tags: ["Lifestyle", "Vlog", "Trends", "Personality"],
      base_bounty: 50,
  },

  // 2. SYNTHWAVE (Tech/AI)
  tech: { 
      label: "Synthwave", 
      category: "Tech & AI",
      description: "Architects of the simulation. Developers, AI Artists, and Futurists.",
      imageSrc: "/images/sectors/tech.jpg",
      icon: Cpu, 
      color: "text-cyan-500",
      tags: ["AI", "Coding", "SaaS", "Gadgets"],
      base_bounty: 75,
  },

  // 3. VELVET (Fashion/Beauty)
  fashion: { 
      label: "Velvet Cartel", 
      category: "Fashion & Beauty",
      description: "Visual dominance. Models, Designers, and Aesthetes.",
      imageSrc: "/images/sectors/fashion.jpg",
      icon: Camera, 
      color: "text-pink-500",
      tags: ["OOTD", "Makeup", "Streetwear", "Luxury"],
      base_bounty: 60,
  },

  // 4. TITAN (Fitness)
  fitness: { 
      label: "Titan Legion", 
      category: "Fitness & Health",
      description: "The Iron born. Bodybuilders, Athletes, and Biohackers.",
      imageSrc: "/images/sectors/fitness.jpg",
      icon: Dumbbell, 
      color: "text-green-500", 
      tags: ["Gym", "Nutrition", "Sports", "Yoga"],
      base_bounty: 100, 
  },

  // 5. SYNDICATE (Business/Crypto)
  finance: { 
      label: "The Syndicate", 
      category: "Wealth & Crypto",
      description: "Builders of empires. Traders, Entrepreneurs, and Hustlers.",
      imageSrc: "/images/sectors/finance.jpg",
      icon: Briefcase, 
      color: "text-yellow-500", 
      tags: ["Crypto", "Stocks", "Marketing", "Sales"],
      base_bounty: 80,
  },

  // 6. DRIFTERS (Travel)
  travel: { 
      label: "The Drifters", 
      category: "Travel & Exploration",
      description: "Those who roam. Explorers, Foodies, and Photographers.",
      imageSrc: "/images/sectors/travel.jpg",
      icon: Plane, 
      color: "text-orange-500", 
      tags: ["Travel", "Food", "Nature", "Photography"],
      base_bounty: 55,
  },

  // 7. FREQUENCY (Music/Art)
  art: { 
      label: "Frequency", 
      category: "Art & Music",
      description: "The soul of the grid. Musicians, Dancers, and Digital Artists.",
      imageSrc: "/images/sectors/art.jpg",
      icon: Music, 
      color: "text-purple-500", 
      tags: ["Music", "Art", "Dance", "Design"],
      base_bounty: 65,
  },

  // 8. GLITCH (Gaming)
  gaming: { 
      label: "The Glitch", 
      category: "Gaming & Streaming",
      description: "Virtual warriors. Esports pros, Streamers, and Anime fans.",
      imageSrc: "/images/sectors/gaming.jpg",
      icon: Gamepad2, 
      color: "text-lime-500", 
      tags: ["Gaming", "Esports", "Anime", "Cosplay"],
      base_bounty: 90,
  }
};

// --- 2. MISSION TEMPLATES (The Tasks) ---
// You must add these images to your public/images/missions/ folder
export const MISSION_TYPES = [
  {
    id: "mission_follow",
    type: "FOLLOW",
    title: "Establish Comms",
    desc: "Follow the Sector Warlord to intercept orders.",
    thumbnail: "/images/missions/follow.jpg", 
    energy: 10,
    reward: 50,
    icon: UserPlus
  },
  {
    id: "mission_like",
    type: "LIKE",
    title: "Signal Boost",
    desc: "Like recent transmission to strengthen presence.",
    thumbnail: "/images/missions/like.jpg",
    energy: 5,
    reward: 25,
    icon: Heart
  },
  {
    id: "mission_comment",
    type: "COMMENT",
    title: "Drop Payload",
    desc: "Leave strategic comments to infiltrate algorithm.",
    thumbnail: "/images/missions/comment.jpg",
    energy: 15,
    reward: 75,
    icon: MessageCircle
  },
  {
    id: "mission_share",
    type: "SHARE",
    title: "Viral Broadcast",
    desc: "Share intel to spread faction influence.",
    thumbnail: "/images/missions/share.jpg",
    energy: 20,
    reward: 100,
    icon: Share2
  },
  {
    id: "mission_watch",
    type: "WATCH",
    title: "Intel Briefing",
    desc: "Analyze full video transmission.",
    thumbnail: "/images/missions/watch.jpg",
    energy: 25,
    reward: 150,
    icon: Eye
  }
];

export const ALL_SECTORS = Object.keys(NICHE_DATA).map(key => ({ 
    id: key, 
    ...NICHE_DATA[key] 
}));