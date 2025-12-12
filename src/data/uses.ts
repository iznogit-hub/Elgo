import {
  Keyboard,
  Terminal,
  Layers,
  PcCase,
  type LucideIcon,
} from "lucide-react";

export type Rarity = "legendary" | "epic" | "rare" | "common";

export interface ItemSpec {
  label: string;
  value: string;
}

interface UsesItem {
  name: string;
  desc: string;
  rarity: Rarity;
  specs?: ItemSpec[];
}

interface UsesCategory {
  category: string;
  icon: LucideIcon;
  items: UsesItem[];
}

export const USES_DATA: UsesCategory[] = [
  {
    category: "Workstation",
    icon: PcCase,
    items: [
      {
        name: "Custom Rig",
        desc: "Reactor core online.",
        rarity: "legendary",
        specs: [
          { label: "CPU", value: "i5-14600K" },
          { label: "GPU", value: "RTX 4060 Ti" },
          { label: "RAM", value: "32GB DDR5" },
        ],
      },
      {
        name: "LG UltraGear",
        desc: "Visual wallhacks.",
        rarity: "epic",
        specs: [
          { label: "REFRESH", value: "240Hz" },
          { label: "PANEL", value: "OLED" },
          { label: "RES", value: "1440p" },
        ],
      },
      {
        name: "Samsung Monitor",
        desc: "The sidekick.",
        rarity: "common",
        specs: [
          { label: "REFRESH", value: "120Hz" },
          { label: "SIZE", value: "27 Inch" },
          { label: "RES", value: "1080p" },
        ],
      },
    ],
  },
  {
    category: "Peripherals",
    icon: Keyboard,
    items: [
      {
        name: "Wooting 80HE",
        desc: "Rapid trigger aka Legal cheats.",
        rarity: "legendary",
        specs: [
          { label: "SWITCH", value: "Lekker L60" },
          { label: "ACTUATION", value: "0.1mm" },
          { label: "POLLING", value: "8kHz" },
        ],
      },
      {
        name: "Razer Viper V3 Pro",
        desc: "Hardware aim assist.",
        rarity: "legendary",
        specs: [
          { label: "WEIGHT", value: "54g" },
          { label: "SENSOR", value: "Focus Pro" },
          { label: "DPI", value: "35K" },
        ],
      },

      {
        name: "Logitech G PRO X",
        desc: "Footstep triangulation.",
        rarity: "rare",
        specs: [
          { label: "WEIGHT", value: "54g" },
          { label: "SENSOR", value: "Focus Pro" },
          { label: "DPI", value: "35K" },
        ],
      },
    ],
  },
  {
    category: "Development",
    icon: Terminal,
    items: [
      {
        name: "VS Code",
        desc: "The primary weapon.",
        rarity: "common",
      },
      {
        name: "Warp",
        desc: "Terminal velocity.",
        rarity: "epic",
      },
      { name: "Figma", desc: "Visual blueprints.", rarity: "common" },
    ],
  },
  {
    category: "Stack",
    icon: Layers,
    items: [
      { name: "Next.js", desc: "The heavy artillery.", rarity: "legendary" },
      { name: "Tailwind CSS", desc: "Rapid deployment.", rarity: "epic" },
      { name: "TypeScript", desc: "Stricter than your mom", rarity: "rare" },
    ],
  },
];
