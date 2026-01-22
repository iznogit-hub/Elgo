"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Radar, ShoppingBag, Users, Crown,
  LogOut, ShieldAlert, Monitor, Terminal, Search
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useSfx } from "@/hooks/use-sfx";
import { useAuth } from "@/lib/context/auth-context";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { play } = useSfx();
  const { userData, isAdmin } = useAuth();

  // Toggle with CMD+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
        play("hover");
      }
    };
    
    const openHandler = () => setOpen(true);
    window.addEventListener("keydown", down);
    window.addEventListener("open-command-menu", openHandler);
    
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("open-command-menu", openHandler);
    };
  }, [play]);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    play("click");
    command();
  }, [play]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList className="font-mono">
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
            <Terminal className="mr-2 h-4 w-4" />
            <span>Home / Landing</span>
          </CommandItem>
          {userData && (
            <>
              <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Launcher (Dashboard)</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/hunter"))}>
                <Radar className="mr-2 h-4 w-4" />
                <span>Signal Hunter</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/store"))}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span>Armory (Store)</span>
              </CommandItem>
            </>
          )}
        </CommandGroup>
        
        {userData && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Operative Controls">
              <CommandItem onSelect={() => runCommand(() => router.push("/referrals"))}>
                <Users className="mr-2 h-4 w-4" />
                <span>Hierarchy (Referrals)</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/counsil"))}>
                <Crown className="mr-2 h-4 w-4" />
                <span>High Council</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {isAdmin && (
           <>
            <CommandSeparator />
            <CommandGroup heading="God Mode">
                <CommandItem onSelect={() => runCommand(() => router.push("/admin"))} className="text-red-500 aria-selected:text-red-400">
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    <span>Admin Console</span>
                </CommandItem>
            </CommandGroup>
           </>
        )}
      </CommandList>
      
      <div className="border-t border-white/10 p-2 bg-black/50 text-[10px] text-gray-500 font-mono flex justify-between">
         <span>ZAIBATSU_OS v2.4</span>
         <span>SECURE_CONNECTION</span>
      </div>
    </CommandDialog>
  );
}