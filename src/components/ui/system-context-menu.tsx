"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Copy,
  Terminal,
  Minimize2,
  Share2,
  Printer, // ✅ NEW
  Activity, // ✅ NEW
  Send, // ✅ NEW
  type LucideIcon,
} from "lucide-react";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MenuPosition {
  x: number;
  y: number;
}

export function SystemContextMenu() {
  const { play } = useSfx();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      play("click");

      const { pageX, pageY } = e;
      let x = pageX;
      let y = pageY;

      if (menuRef.current) {
        const width = 200;
        // Increased height again to accommodate new items
        const height = 400;
        if (x + width > window.innerWidth) x -= width;
        if (y + height > window.innerHeight) y -= height;
      }

      setPosition({ x, y });
      setIsVisible(true);
    };

    const handleClick = () => setIsVisible(false);
    const handleScroll = () => setIsVisible(false);

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClick);
    document.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("scroll", handleScroll);
    };
  }, [play]);

  const handleAction = (action: () => void) => {
    action();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-9999 min-w-52 rounded-md border border-border/50 bg-background/90 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
      style={{ top: position.y, left: position.x }}
    >
      <div className="flex flex-col gap-1">
        {/* Header */}
        <div className="px-2 py-1.5 text-[10px] font-mono font-bold text-muted-foreground/50 border-b border-border/30 mb-1 select-none">
          SYS_OP_MENU_V3
        </div>

        {/* Browser Navigation */}
        <ContextItem
          icon={ArrowLeft}
          label="Back"
          shortcut="Alt+Left"
          onClick={() => handleAction(() => router.back())}
        />
        <ContextItem
          icon={ArrowRight}
          label="Forward"
          shortcut="Alt+Right"
          onClick={() => handleAction(() => router.forward())}
        />
        <ContextItem
          icon={RotateCw}
          label="Reload System"
          shortcut="Ctrl+R"
          onClick={() => handleAction(() => window.location.reload())}
        />

        <div className="h-px bg-border/40 my-1" />

        {/* ✅ NEW: App Shortcuts */}
        <ContextItem
          icon={Activity}
          label="Diagnostics"
          onClick={() => handleAction(() => router.push("/dashboard"))}
        />
        <ContextItem
          icon={Send}
          label="Establish Uplink"
          onClick={() => handleAction(() => router.push("/contact"))}
        />

        <div className="h-px bg-border/40 my-1" />

        {/* Actions */}
        <ContextItem
          icon={Share2}
          label="Share Node"
          onClick={() =>
            handleAction(async () => {
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: "T7SEN | Portfolio",
                    text: "Check out this high-performance cyber portfolio.",
                    url: window.location.href,
                  });
                } catch (err) {
                  console.error("Share failed:", err);
                }
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard");
              }
            })
          }
        />

        {/* ✅ NEW: Print/Save PDF */}
        <ContextItem
          icon={Printer}
          label="Print Manifest"
          shortcut="Ctrl+P"
          onClick={() => handleAction(() => window.print())}
        />

        <ContextItem
          icon={Copy}
          label="Copy Link"
          onClick={() =>
            handleAction(() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied to clipboard");
            })
          }
        />
        <ContextItem
          icon={Terminal}
          label="Inspect Source"
          onClick={() =>
            handleAction(() => {
              window.open("https://github.com/t7sen/portfolio", "_blank");
            })
          }
        />

        <div className="h-px bg-border/40 my-1" />

        <ContextItem
          icon={Minimize2}
          label="Close Menu"
          onClick={() => setIsVisible(false)}
          destructive
        />
      </div>
    </div>
  );
}

// Helper Subcomponent
function ContextItem({
  icon: Icon,
  label,
  shortcut,
  onClick,
  destructive,
}: {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  const { play } = useSfx();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        play("click");
        onClick();
      }}
      onMouseEnter={() => play("hover")}
      className={cn(
        "group flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-xs transition-colors select-none",
        destructive
          ? "text-red-500 hover:bg-red-500/10 focus:bg-red-500/10"
          : "text-foreground hover:bg-primary/10 hover:text-primary focus:bg-primary/10",
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
        <span className="font-medium">{label}</span>
      </div>
      {shortcut && (
        <span className="ml-4 font-mono text-[9px] text-muted-foreground/50">
          {shortcut}
        </span>
      )}
    </button>
  );
}
