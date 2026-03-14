import { 
  TrendingUp, PenTool, Share2, Megaphone, Search, 
  BarChart, Globe, Zap, Mail, MessageSquare, 
  Video, Mic, Target, Award, Rocket, 
  FileText, Smartphone, Users, Rss, Layers 
} from "lucide-react";

export const MARKETING_PACKAGES: Record<string, any> = {
  // --- THE ATTENTION ECONOMY (SOCIAL & VIRAL) ---
  reels_engine: { 
    label: "Viral Reels Engine", 
    category: "Short-Form / IG / TikTok",
    videoSrc: "/videos/reels_engine.mp4",
    icon: Video, 
    textColor: "text-purple-500",
    borderColor: "border-purple-500/50",
    glowColor: "bg-purple-600",
    description: "High-retention, fast-paced video editing with Alex Hormozi-style captions and viral hooks.",
    features: ["15 Short-Form Videos", "Trending Audio Sync", "Custom B-Roll Selection", "Hook Scripting"],
    basePrice: 12999,
    addons: [
      { id: "auto_post", name: "Automated Daily Scheduling", price: 2999 },
      { id: "thumbnail_pack", name: "15 Custom Clickbait Thumbnails", price: 1999 }
    ]
  },
  linkedin_founder: { 
    label: "Founder Authority", 
    category: "B2B / LinkedIn / Ghostwriting",
    videoSrc: "/videos/linkedin_founder.mp4",
    icon: PenTool, 
    textColor: "text-blue-500",
    borderColor: "border-blue-500/50",
    glowColor: "bg-blue-600",
    description: "Executive ghostwriting to turn founders into industry thought leaders and generate inbound B2B leads.",
    features: ["12 Text/Image Posts", "Profile Optimization", "Engagement Pods", "1 Viral Carousel"],
    basePrice: 14999,
    addons: [
      { id: "outreach_bot", name: "Automated DM Lead Generation", price: 4999 },
      { id: "newsletter", name: "Weekly LinkedIn Newsletter", price: 3999 }
    ]
  },
  meme_warfare: { 
    label: "Meme Marketing", 
    category: "Gen-Z / X / Instagram",
    videoSrc: "/videos/meme_warfare.mp4",
    icon: Share2, 
    textColor: "text-yellow-400",
    borderColor: "border-yellow-400/50",
    glowColor: "bg-yellow-500",
    description: "Weaponized shitposting to build a cult-like community around your brand and hijack trending topics.",
    features: ["20 Custom Brand Memes", "Trend Hijacking", "X (Twitter) Threading", "Community Roasts"],
    basePrice: 8999,
    addons: [
      { id: "page_rt", name: "Retweets from 500k+ Network", price: 5999 },
      { id: "gif_stickers", name: "Custom Giphy IG Story Stickers", price: 2499 }
    ]
  },

  // --- THE TRUST LAYER (PR & AUTHORITY) ---
  digital_pr: { 
    label: "Digital PR Blitz", 
    category: "News / Articles / Trust",
    videoSrc: "/videos/digital_pr.mp4",
    icon: Globe, 
    textColor: "text-cyan-400",
    borderColor: "border-cyan-400/50",
    glowColor: "bg-cyan-500",
    description: "Guaranteed placements on mid-tier Indian news portals to unlock the 'As Featured In' flex on your site.",
    features: ["Custom Press Release", "Distribution to 15+ Portals", "Guaranteed Indexing", "Authority Backlinks"],
    basePrice: 19999,
    addons: [
      { id: "premium_tier", name: "Upgrade to Premium Outlets (ANI, Zee)", price: 8999 },
      { id: "interview_format", name: "Q&A Founder Interview Format", price: 3499 }
    ]
  },
  blue_tick_prep: { 
    label: "Verification Funnel", 
    category: "Instagram / Meta / Credibility",
    videoSrc: "/videos/blue_tick.mp4",
    icon: Award, 
    textColor: "text-sky-500",
    borderColor: "border-sky-500/50",
    glowColor: "bg-sky-600",
    description: "Building the required digital footprint and press mentions to trigger Meta's verification algorithms.",
    features: ["Wiki-style Bio Pages", "3 PR Features", "Google Knowledge Graph Sync", "Profile Auditing"],
    basePrice: 18999,
    addons: [
      { id: "meta_rep", name: "Direct Agency Rep Submission", price: 5999 },
      { id: "wiki_page", name: "Drafting Fandom/Wiki Pages", price: 4999 }
    ]
  },
  podcast_tour: { 
    label: "Podcast Guesting", 
    category: "Audio / Interviews / Reach",
    videoSrc: "/videos/podcast_tour.mp4",
    icon: Mic, 
    textColor: "text-orange-500",
    borderColor: "border-orange-500/50",
    glowColor: "bg-orange-600",
    description: "We book you as an expert guest on established Indian business, tech, and marketing podcasts.",
    features: ["3 Guaranteed Bookings", "Custom Media Kit", "Pre-interview Briefings", "Audio Backlinks"],
    basePrice: 14999,
    addons: [
      { id: "video_pods", name: "Filter for Video-Only Podcasts", price: 3999 },
      { id: "mic_setup", name: "Ship Shure SM7B Mic Rental", price: 2999 }
    ]
  },

  // --- THE SEARCH CORE (SEO & ORGANIC) ---
  local_domination: { 
    label: "Local Map Pack", 
    category: "Google My Business / Local",
    videoSrc: "/videos/local_seo.mp4",
    icon: Target, 
    textColor: "text-emerald-500",
    borderColor: "border-emerald-500/50",
    glowColor: "bg-emerald-600",
    description: "Total takeover of local search results for offline businesses, clinics, and regional agencies.",
    features: ["GMB Optimization", "100+ Local Citations", "Review Automation", "Geotagged Imagery"],
    basePrice: 7999,
    addons: [
      { id: "review_nfc", name: "Ship 5 Tap-to-Review NFC Cards", price: 1999 },
      { id: "local_pr", name: "Hyper-Local City News Feature", price: 4999 }
    ]
  },
  programmatic_seo: { 
    label: "Programmatic SEO", 
    category: "Traffic / AI Content / Scaling",
    videoSrc: "/videos/programmatic.mp4",
    icon: Layers, 
    textColor: "text-indigo-400",
    borderColor: "border-indigo-400/50",
    glowColor: "bg-indigo-500",
    description: "Deploying 100+ highly optimized, AI-assisted landing pages targeting low-competition, high-intent keywords.",
    features: ["Keyword Architecture", "100 Generated Pages", "Internal Linking Matrix", "Index API Pushing"],
    basePrice: 19999,
    addons: [
      { id: "human_edit", name: "Human Editor Fact-Checking", price: 6999 },
      { id: "schema_markup", name: "Advanced JSON-LD Schema", price: 2499 }
    ]
  },
  tech_audit: { 
    label: "Technical Core Web Vitals", 
    category: "Speed / Code / Indexing",
    videoSrc: "/videos/tech_audit.mp4",
    icon: Zap, 
    textColor: "text-lime-400",
    borderColor: "border-lime-400/50",
    glowColor: "bg-lime-500",
    description: "Deep-level code restructuring to achieve 95+ Google PageSpeed scores and fix crawl errors.",
    features: ["Image WebP Conversion", "JS/CSS Minification", "Render Blocking Fixes", "Crawl Error Resolution"],
    basePrice: 9999,
    addons: [
      { id: "cdn_setup", name: "Cloudflare Pro CDN Configuration", price: 1999 },
      { id: "ssl_fix", name: "Advanced SSL & Security Headers", price: 1499 }
    ]
  },

  // --- THE CONVERSION ENGINE (ADS & RETENTION) ---
  meta_scaling: { 
    label: "Meta Ads Scaling", 
    category: "FB / IG / E-commerce",
    videoSrc: "/videos/meta_ads.mp4",
    icon: Megaphone, 
    textColor: "text-rose-500",
    borderColor: "border-rose-500/50",
    glowColor: "bg-rose-600",
    description: "Aggressive performance marketing focused purely on driving lowest-CPA conversions and ROAS.",
    features: ["Pixel/CAPI Setup", "3 Creative Variations", "Retargeting Pools", "A/B Testing Framework"],
    basePrice: 15999,
    addons: [
      { id: "ad_creative", name: "Shoot 3 Custom UGC Ad Creatives", price: 5999 },
      { id: "lookalike", name: "LTV Data Lookalike Modeling", price: 2999 }
    ]
  },
  whatsapp_drip: { 
    label: "WhatsApp Automation", 
    category: "Retention / Chatbots / D2C",
    videoSrc: "/videos/whatsapp.mp4",
    icon: MessageSquare, 
    textColor: "text-green-500",
    borderColor: "border-green-500/50",
    glowColor: "bg-green-600",
    description: "High-open-rate WhatsApp API sequences to recover abandoned carts and nurture warm leads.",
    features: ["WhatsApp API Setup", "Abandoned Cart Flow", "Welcome Sequence", "Support Bot Menu"],
    basePrice: 11999,
    addons: [
      { id: "green_tick", name: "Official WhatsApp Green Tick Application", price: 4999 },
      { id: "catalog_sync", name: "Shopify WhatsApp Catalog Sync", price: 2999 }
    ]
  },
  cro_makeover: { 
    label: "CRO Landing Page", 
    category: "Design / Funnels / Copy",
    videoSrc: "/videos/cro.mp4",
    icon: BarChart, 
    textColor: "text-fuchsia-500",
    borderColor: "border-fuchsia-500/50",
    glowColor: "bg-fuchsia-600",
    description: "We rip apart your existing landing page and rebuild it using psychological triggers that actually convert.",
    features: ["Direct Response Copy", "Heatmap Analysis", "Trust Badge Integration", "Mobile-First Redesign"],
    basePrice: 16999,
    addons: [
      { id: "split_test", name: "Set up Google Optimize A/B Test", price: 3499 },
      { id: "video_vsl", name: "Scripting for a 3-min VSL", price: 4999 }
    ]
  },

  // --- OMNICHANNEL & SPECIALIZED ---
  discord_cult: { 
    label: "Community Management", 
    category: "Discord / Telegram / Web3",
    videoSrc: "/videos/discord.mp4",
    icon: Users, 
    textColor: "text-zinc-400",
    borderColor: "border-zinc-400/50",
    glowColor: "bg-zinc-500",
    description: "Building and moderating highly active, token-gated or paid communities for creators and brands.",
    features: ["Server Architecture", "Custom Bot Setup", "Onboarding Funnels", "Weekly Events"],
    basePrice: 13999,
    addons: [
      { id: "mod_team", name: "24/7 Dedicated Sub-Moderator", price: 6999 },
      { id: "economy_bot", name: "Custom Points/Economy Bot", price: 3999 }
    ]
  },
  app_store_seo: { 
    label: "App Store Optimization", 
    category: "ASO / iOS / Play Store",
    videoSrc: "/videos/aso.mp4",
    icon: Smartphone, 
    textColor: "text-blue-400",
    borderColor: "border-blue-400/50",
    glowColor: "bg-blue-500",
    description: "Pushing your application up the charts with keyword-optimized descriptions and high-converting screenshots.",
    features: ["Keyword Matrix", "App Description Copy", "5 Custom Screenshots", "Review Strategies"],
    basePrice: 12999,
    addons: [
      { id: "app_promo", name: "30-Sec App Store Promo Video", price: 4999 },
      { id: "localization", name: "Translate/Localize for Hindi Market", price: 2999 }
    ]
  },
  the_syndicate: { 
    label: "The Omnichannel Stack", 
    category: "Full-Stack / Scale / 360",
    videoSrc: "/videos/omni.mp4",
    icon: Rocket, 
    textColor: "text-red-500",
    borderColor: "border-red-500/50",
    glowColor: "bg-red-600",
    description: "The nuclear option. A combination of PR, SEO, and paid media to completely surround your target market.",
    features: ["Tier-2 PR Drop", "Basic SEO Audit", "Social Retargeting Ads", "Email Newsletter Setup"],
    basePrice: 19999,
    addons: [
      { id: "dedicated_pm", name: "Dedicated Slack Channel & PM", price: 4999 },
      { id: "competitor_spy", name: "Deep-Dive Competitor Ad Spy Report", price: 1999 }
    ]
  }
};