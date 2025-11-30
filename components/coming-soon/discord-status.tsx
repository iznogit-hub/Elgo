"use client";

import * as React from "react";
import { Music, Gamepad2, Moon, Code2 } from "lucide-react";
import { useLanyard } from "@/hooks/use-lanyard";
import { useSfx } from "@/hooks/use-sfx"; // Import Hook
import { cn } from "@/lib/utils";

const DISCORD_ID = "170916597156937728";

export function DiscordStatus() {
  const { data, isConnected } = useLanyard(DISCORD_ID);
  const { play } = useSfx(); // Initialize

  if (!data || !isConnected) {
    return (
      <div className="flex min-w-[220px] items-center gap-3 rounded-2xl border border-border/50 bg-background/40 px-4 py-3 backdrop-blur-md">
        {/* ... loading skeletons ... */}
        <div className="relative">
          <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-20 animate-pulse rounded-full bg-muted" />
          <div className="h-2 w-16 animate-pulse rounded-full bg-muted/50" />
        </div>
      </div>
    );
  }

  const {
    discord_user,
    discord_status,
    activities,
    listening_to_spotify,
    spotify,
  } = data;

  let statusText = "Chilling";
  let StatusIcon = Moon;
  let isActivity = false;

  if (listening_to_spotify && spotify) {
    statusText = `${spotify.song}`;
    StatusIcon = Music;
    isActivity = true;
  } else if (activities.length > 0) {
    const game = activities.find((a) => a.type !== 4) || activities[0];
    if (game.type !== 4) {
      if (game.name === "Visual Studio Code") {
        statusText = "Coding";
        StatusIcon = Code2;
      } else {
        statusText = game.name;
        StatusIcon = Gamepad2;
      }
      isActivity = true;
    } else {
      statusText = game.state || "Vibing";
    }
  }

  const statusColor = {
    online: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]",
    idle: "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]",
    dnd: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
    offline: "bg-zinc-500",
  }[discord_status];

  return (
    <a
      href={`https://discord.com/users/${DISCORD_ID}`}
      target="_blank"
      rel="noopener noreferrer"
      // EXISTING: Hover Sound
      onMouseEnter={() => play("hover")}
      // ADDED: Click Sound
      onClick={() => play("click")}
      className="group relative flex min-w-[220px] items-center gap-4 rounded-2xl border border-border/40 bg-background/40 px-4 py-3 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-background/60 hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98] active:translate-y-0"
    >
      {/* ... rest of the component ... */}
      <div className="relative shrink-0">
        {discord_user.avatar ? (
          <img
            src={`https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png`}
            alt={discord_user.username}
            className="h-10 w-10 rounded-full border border-border/50 bg-muted transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-muted border border-border/50" />
        )}
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background transition-all duration-300",
            statusColor
          )}
        />
      </div>

      <div className="flex flex-col text-left overflow-hidden">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold leading-none text-foreground tracking-tight">
            {discord_user.username}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <StatusIcon
            className={cn(
              "h-3 w-3 shrink-0 transition-colors duration-300",
              isActivity ? "text-primary" : "text-muted-foreground"
            )}
          />
          <span className="truncate text-xs font-medium text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
            {statusText}
          </span>
        </div>
      </div>

      <div className="absolute -inset-px -z-10 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-linear-to-r from-primary/10 via-transparent to-transparent blur-sm" />
    </a>
  );
}
