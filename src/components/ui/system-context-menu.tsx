"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  RotateCw,
  ArrowRight,
  Shield,
  LayoutDashboard,
  LogOut,
  Terminal,
  Minimize2,
  type LucideIcon,
} from "lucide-react";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface MenuPosition {
  x: number;
  y: number;
}

export function SystemContextMenu() {
  const { play } = useSfx();
  const router = useRouter();
  const { userData } = useAuth();
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

      // Prevent overflow
      if (menuRef.current) {
        const { offsetWidth, offsetHeight } = menuRef.current;
        if (x + offsetWidth > window.innerWidth) x -= offsetWidth;
        if (y + offsetHeight > window.innerHeight) y -= offsetHeight;
      }

      setPosition({ x, y });
      setIsVisible(true);
    };

    const handleClick = () => setIsVisible(false);

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("click", handleClick);
    };
  }, [play]);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      style={{ top: position.y, left: position.x }}
      className="fixed z-[9999] min-w-[200px] overflow-hidden rounded-lg border border-white/10 bg-black/90 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-2 py-1.5 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 mb-1 flex justify-between items-center">
        <span>ZAIBATSU_OS</span>
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      </div>

      <div className="flex flex-col gap-0.5">
        <ContextItem
          icon={RotateCw}
          label="Force Reload"
          shortcut="⌘R"
          onClick={() => window.location.reload()}
        />
        
        {userData ? (
          <>
            <div className="h-px bg-white/10 my-1" />
            <ContextItem
              icon={LayoutDashboard}
              label="Open Launcher"
              onClick={() => router.push("/dashboard")}
            />
            <ContextItem
              icon={LogOut}
              label="Disconnect"
              destructive
              onClick={handleLogout}
            />
          </>
        ) : (
          <ContextItem
            icon={ArrowRight}
            label="Initialize Session"
            onClick={() => router.push("/auth/login")}
          />
        )}

        <div className="h-px bg-white/10 my-1" />

        <ContextItem
          icon={Terminal}
          label="System Status"
          onClick={() => window.open("/api/health", "_blank")}
        />
        
        <ContextItem
          icon={Shield}
          label="Support Uplink"
          onClick={() => window.open("mailto:support@bubblepops.com")}
        />

        <div className="h-px bg-white/10 my-1" />

        <ContextItem
          icon={Minimize2}
          label="Close Menu"
          onClick={() => setIsVisible(false)}
        />
      </div>
    </div>
  );
}

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
        "group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors select-none font-mono",
        destructive
          ? "text-red-500 hover:bg-red-900/20 hover:text-red-400"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      {shortcut && (
        <span className="text-[9px] text-gray-600 group-hover:text-gray-400">
          {shortcut}
        </span>
      )}
    </button>
  );
}