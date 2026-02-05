import { 
  Cpu, Camera, Dumbbell, Network, Globe, 
  Briefcase, Music, Terminal 
} from "lucide-react";

// 🧠 HELPER: Richer Campaign Generator
const generateWeek = (topic: string) => {
    return Array.from({ length: 7 }).map((_, i) => ({
        day: i + 1,
        title: `Protocol_0${i + 1}`,
        tasks: [
            `Record 60s ${topic} update`,
            `Engage with 5 ${topic} leaders`,
            `Post Story: "My view on ${topic}..."`
        ],
        script: `HOOK: "Stop doing ${topic} like this..."\nBODY: "Here is the real secret..."\nCTA: "Comment 'Access' for more."`,
        prompt: `Cinematic ${topic} environment, day ${i + 1} vibe, 8k resolution, dramatic lighting.`,
        audio: i % 2 === 0 ? "Trending: Phonk_V2" : "Trending: LoFi_Chill"
    }));
};

// 💎 THE "CARTEL" & ASSETS
export const NICHE_DATA: Record<string, any> = {
  tech: { 
      label: "Tech & AI", 
      description: "Dominate the algorithm with AI tools and futurism.",
      videoSrc: "/video/cyber_city.mp4",
      icon: <Cpu size={14} />, 
      color: "cyan",
      // 🤝 FOLLOW FOR COINS (Your Seed Accounts)
      featured_creators: [
          { handle: "@tech_frequence", reward: 100, verified: true },
          { handle: "@ai.militia", reward: 100, verified: true },
          { handle: "@code_cartel", reward: 50, verified: false }
      ],
      // 🎒 ASSET LIBRARY (Pre-Genkit Value)
      assets: {
          audio: [
             { title: "Cyberpunk Grit", type: "Phonk", duration: "0:15", url: "#" },
             { title: "Silicon Valley LoFi", type: "Chill", duration: "0:30", url: "#" },
             { title: "Data Stream", type: "Techno", duration: "0:20", url: "#" }
          ],
          prompts: [
             "Futuristic open office, neon blue lighting, glass walls, 8k --ar 9:16",
             "Macro shot of CPU processor, glowing circuits, cinematic depth of field --ar 9:16",
             "Hacker silhouette in dark room, multiple screens, green code rain --ar 9:16"
          ]
      },
      weekly_schedule: generateWeek("AI Tools") 
  },
  fashion: { 
      label: "Fashion", 
      description: "High-end aesthetics and streetwear culture.",
      videoSrc: "/video/runway_glitch.mp4",
      icon: <Camera size={14} />, 
      color: "pink",
      featured_creators: [
          { handle: "@street_gods", reward: 100, verified: true },
          { handle: "@vogue_rebel", reward: 100, verified: true }
      ],
      assets: {
          audio: [
             { title: "Runway Stomp", type: "House", duration: "0:15", url: "#" },
             { title: "Luxury Flow", type: "R&B", duration: "0:30", url: "#" }
          ],
          prompts: [
             "High fashion model walking on wet asphalt, neon city lights reflection, oversized jacket --ar 9:16",
             "Minimalist clothing rack, white background, soft shadows, studio lighting --ar 9:16"
          ]
      },
      weekly_schedule: generateWeek("Modern Style") 
  },
  // ... (Repeat pattern for other niches)
  fitness: { 
      label: "Fitness", videoSrc: "/video/gym_grit.mp4", icon: <Dumbbell size={14} />, color: "green",
      featured_creators: [{ handle: "@iron_church", reward: 10, verified: true }],
      assets: { audio: [], prompts: [] },
      weekly_schedule: generateWeek("Peak Performance") 
  },
  crypto: { 
      label: "Crypto", videoSrc: "/video/crypto_chart.mp4", icon: <Network size={14} />, color: "purple",
      featured_creators: [{ handle: "@web3_whale", reward: 10, verified: true }],
      assets: { audio: [], prompts: [] },
      weekly_schedule: generateWeek("DeFi Markets") 
  },
  travel: { 
      label: "Travel", videoSrc: "/video/travel_drone.mp4", icon: <Globe size={14} />, color: "yellow",
      featured_creators: [{ handle: "@nomad_life", reward: 10, verified: true }],
      assets: { audio: [], prompts: [] },
      weekly_schedule: generateWeek("Global Exploration") 
  },
  business: { 
      label: "Biz/Hustle", videoSrc: "/video/office_timelapse.mp4", icon: <Briefcase size={14} />, color: "blue",
      featured_creators: [{ handle: "@hustle_daily", reward: 10, verified: true }],
      assets: { audio: [], prompts: [] },
      weekly_schedule: generateWeek("Empire Building") 
  },
  music: { 
      label: "Music", videoSrc: "/video/studio_neon.mp4", icon: <Music size={14} />, color: "red",
      featured_creators: [{ handle: "@beat_stars", reward: 10, verified: true }],
      assets: { audio: [], prompts: [] },
      weekly_schedule: generateWeek("Music Production") 
  },
  coding: { 
      label: "Coding", videoSrc: "/video/matrix_code.mp4", icon: <Terminal size={14} />, color: "orange",
      featured_creators: [{ handle: "@git_push", reward: 10, verified: true }],
      assets: { audio: [], prompts: [] },
      weekly_schedule: generateWeek("Software Engineering") 
  },
};

export const ALL_SECTORS = Object.keys(NICHE_DATA).map(key => ({ 
    id: key, 
    ...NICHE_DATA[key] 
}));