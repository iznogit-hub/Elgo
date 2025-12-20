"use client";

import { useEffect, useState } from "react";
import { getLatestCommit } from "@/app/actions/github";
import Link from "next/link";
import { GitCommitHorizontal } from "lucide-react";

interface CommitInfo {
  hash: string;
  message: string;
  url: string;
}

export function GitPulse() {
  const [commit, setCommit] = useState<CommitInfo | null>(null);

  useEffect(() => {
    getLatestCommit().then((data) => {
      if (data) setCommit(data);
    });
  }, []);

  if (!commit) return null;

  return (
    <div className="relative flex items-center gap-3 font-mono text-xs z-50">
      {/* Status Indicator (Professional Green) */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
      </span>

      {/* Interactive Hash Container */}
      <div className="group relative">
        <Link
          href={commit.url}
          target="_blank"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <GitCommitHorizontal className="h-3.5 w-3.5 opacity-70" />
          <span className="font-medium opacity-80 group-hover:opacity-100 transition-opacity">
            {commit.hash}
          </span>
        </Link>

        {/* Theme-Aware Hover Toast */}
        <div className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 w-max max-w-50 opacity-0 translate-y-2 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 z-50">
          <div className="bg-popover text-popover-foreground border border-border rounded px-3 py-2 text-[10px] shadow-lg">
            <span className="text-emerald-500 font-bold mr-1">&gt;</span>
            {commit.message}
            {/* Arrow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover border-r border-b border-border rotate-45"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
