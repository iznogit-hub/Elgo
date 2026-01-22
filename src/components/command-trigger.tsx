"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSfx } from "@/hooks/use-sfx";

export function CommandTrigger() {
  const { play } = useSfx();

  const trigger = () => {
    window.dispatchEvent(new Event("open-command-menu"));
    play("click");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={trigger}
      onMouseEnter={() => play("hover")}
      className="gap-2 px-4 h-9 border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all font-mono hidden md:flex"
    >
      <Search className="h-3 w-3" />
      <span className="text-xs tracking-widest">SEARCH</span>
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-black px-1.5 font-mono text-[10px] font-medium opacity-100 text-gray-500">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}