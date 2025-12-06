import {
  Keyboard,
  Terminal,
  Layers,
  PcCase,
  type LucideIcon,
} from "lucide-react";

interface UsesCategory {
  category: string;
  icon: LucideIcon;
  items: { name: string; desc: string }[];
}

export const USES_DATA: UsesCategory[] = [
  {
    category: "Workstation",
    icon: PcCase,
    items: [
      { name: "Custom Rig", desc: "i5-14600K & 4060 Ti. 32GB." },
      { name: "LG UltraGear", desc: "240Hz. Frames win games." },
      { name: "Samsung Monitor", desc: "120Hz. The sidekick." },
    ],
  },
  {
    category: "Peripherals",
    icon: Keyboard,
    items: [
      { name: "Wooting 80HE", desc: "Rapid trigger. Legal cheats." },
      { name: "Razer Viper V3 Pro", desc: "54g wireless aimbot." },
      { name: "HyperX QuadCast 2 S", desc: "Crystal clear rage." },
      { name: "Logitech G PRO X", desc: "Noise cancelling bliss." },
    ],
  },
  {
    category: "Development",
    icon: Terminal,
    items: [
      { name: "VS Code", desc: "With Github Dark theme" },
      { name: "Warp", desc: "Rust-based terminal" },
      { name: "Figma", desc: "For system design" },
    ],
  },
  {
    category: "Stack",
    icon: Layers,
    items: [
      { name: "Next.js", desc: "The React Framework" },
      { name: "Tailwind CSS", desc: "Utility-first styling" },
      { name: "TypeScript", desc: "Strict typing always" },
    ],
  },
];
