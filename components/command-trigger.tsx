"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSfx } from "@/hooks/use-sfx";

export function CommandTrigger() {
  const { play } = useSfx();

  const trigger = () => {
    // Dispatch custom event to open the menu
    window.dispatchEvent(new Event("open-command-menu"));
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={trigger}
      onMouseEnter={() => play("hover")}
      className="gap-2 px-3 text-muted-foreground hover:text-foreground hidden md:flex"
    >
      <Search className="h-4 w-4" />
      <span className="text-xs">Search</span>
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}
