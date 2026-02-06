"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, Radar, ShoppingBag, Users, Crown,
  LogOut, ShieldAlert, Terminal, Globe,
  Moon, Sun, UserCircle
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useSfx } from "@/hooks/use-sfx";
import { useAuth } from "@/lib/context/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { play } = useSfx();
  const { userData } = useAuth();
  const { setTheme } = useTheme();

  // Admin Check
  const isAdmin = userData?.email === "iznoatwork@gmail.com";

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
        play("hover");
      }
    };
    
    // External trigger support
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

  const handleLogout = () => {
      runCommand(async () => {
        toast.loading("TERMINATING SESSION...");
        await signOut(auth);
        setTimeout(() => {
            toast.dismiss();
            router.push("/");
        }, 1000);
      })
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center border-b border-white/10 px-3 bg-black/50">
        <Terminal className="mr-2 h-4 w-4 shrink-0 opacity-50 text-cyan-500" />
        <CommandInput placeholder="EXECUTE PROTOCOL..." className="font-mono text-xs uppercase text-cyan-500 placeholder:text-gray-700" />
      </div>
      
      <CommandList className="font-mono text-xs uppercase max-h-[400px] bg-black/90">
        <CommandEmpty className="py-6 text-center text-gray-600 font-mono">
             NO_MATCHING_PROTOCOL
        </CommandEmpty>
        
        {/* --- SYSTEM LAYER --- */}
        <CommandGroup heading="System Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
            <Globe className="mr-2 h-4 w-4 text-gray-400" />
            <span>Public_Net</span>
            <CommandShortcut>P</CommandShortcut>
          </CommandItem>
          
          {userData && (
            <>
                <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                    <LayoutDashboard className="mr-2 h-4 w-4 text-cyan-500" />
                    <span>Dashboard // Launcher</span>
                    <CommandShortcut>D</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push("/profile"))}>
                    <UserCircle className="mr-2 h-4 w-4 text-cyan-500" />
                    <span>Operative Profile</span>
                </CommandItem>
            </>
          )}
        </CommandGroup>

        {/* --- APP LAYER --- */}
        {userData && (
          <>
            <CommandSeparator className="bg-white/10" />
            <CommandGroup heading="Modules">
              <CommandItem onSelect={() => runCommand(() => router.push("/hunter"))}>
                <Radar className="mr-2 h-4 w-4 text-green-500" />
                <span>Signal Hunter</span>
                <CommandShortcut>H</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/store"))}>
                <ShoppingBag className="mr-2 h-4 w-4 text-yellow-500" />
                <span>Black Market</span>
                <CommandShortcut>B</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/referrals"))}>
                <Users className="mr-2 h-4 w-4 text-purple-500" />
                <span>Network Hierarchy</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/council"))}>
                <Crown className="mr-2 h-4 w-4 text-yellow-600" />
                <span>High Council</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {/* --- UTILITY LAYER --- */}
        <CommandSeparator className="bg-white/10" />
        <CommandGroup heading="Protocols">
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Theme: Stealth</span>
            </CommandItem>
             <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Theme: Flashbang</span>
            </CommandItem>
        </CommandGroup>

        {/* --- GOD MODE --- */}
        {isAdmin && (
           <>
            <CommandSeparator className="bg-white/10" />
            <CommandGroup heading="God Mode">
                <CommandItem onSelect={() => runCommand(() => router.push("/admin"))} className="data-[selected=true]:bg-red-900/20 data-[selected=true]:text-red-500">
                    <ShieldAlert className="mr-2 h-4 w-4 text-red-600" />
                    <span className="text-red-500 font-bold">Admin Console</span>
                    <CommandShortcut>GOD</CommandShortcut>
                </CommandItem>
            </CommandGroup>
           </>
        )}

        {/* --- LOGOUT --- */}
        {userData && (
            <>
                <CommandSeparator className="bg-white/10" />
                <CommandGroup>
                    <CommandItem onSelect={handleLogout} className="data-[selected=true]:bg-red-900/10">
                        <LogOut className="mr-2 h-4 w-4 text-red-500" />
                        <span>Terminate Session</span>
                    </CommandItem>
                </CommandGroup>
            </>
        )}

      </CommandList>
      
      <div className="border-t border-white/10 p-2 bg-black text-[10px] text-gray-600 font-mono flex justify-between items-center uppercase">
         <span>ZAIBATSU_OS v4.0</span>
         <div className="flex gap-2">
             <span>CMD+K</span>
             <div className="h-3 w-px bg-white/10"></div>
             <span>NAVIGATE</span>
         </div>
      </div>
    </CommandDialog>
  );
}