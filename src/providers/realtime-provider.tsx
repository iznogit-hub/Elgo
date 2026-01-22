"use client";

import React from "react";

// ⚡ GHOST PROVIDER:
// We have removed Liveblocks logic to stop the crash.
// This wrapper exists only to prevent import errors in layout.tsx.
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}