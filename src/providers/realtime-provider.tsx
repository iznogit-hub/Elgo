"use client";

import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import React from "react";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

  // Graceful fallback if key is missing (prevents crash during dev)
  if (!API_KEY) {
    console.warn("Liveblocks API key is missing. Real-time features disabled.");
    return <>{children}</>;
  }

  return (
    <LiveblocksProvider publicApiKey={API_KEY}>
      {/* "portfolio-presence-v1" is the unique room ID. 
        All visitors connect to this same room.
        initialPresence defines the data each user broadcasts (empty for now).
      */}
      <RoomProvider id="portfolio-presence-v1" initialPresence={{}}>
        {children}
      </RoomProvider>
    </LiveblocksProvider>
  );
}
