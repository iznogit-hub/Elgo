"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Laptop,
  Moon,
  Sun,
  Github,
  Twitter,
  Linkedin,
  Mail,
  User,
  Book,
  Home,
  Gamepad2,
  Copy,
  ArrowLeft,
  Command as CommandIcon,
  Monitor,
  Share2,
  PcCase,
  LayoutDashboard,
  Trophy,
} from "lucide-react";
import { useAchievements } from "@/hooks/use-achievements";

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
import { useSound } from "@/components/sound-provider";

interface CommandMenuProps {
  onOpenGame?: () => void;
}

export function CommandMenu({ onOpenGame }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [activePage, setActivePage] = React.useState("main");
  const [search, setSearch] = React.useState("");
  const { unlock } = useAchievements();

  const { setTheme } = useTheme();
  const { play } = useSfx();
  const { isMuted, toggleMute } = useSound();
  const router = useRouter();

  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setActivePage("main");
        setSearch("");
      }, 300);
    }
  }, [open]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!open) unlock("COMMAND_LINE");
        setOpen((open) => !open);
        if (!open) play("click");
      }
      if (e.key === "Backspace" && activePage !== "main" && open && !search) {
        e.preventDefault();
        setSearch("");
        setActivePage("main");
        play("hover");
      }
    };

    const openHandler = () => {
      if (!open) unlock("COMMAND_LINE");
      setOpen(true);
      play("click");
    };

    document.addEventListener("keydown", down);
    window.addEventListener("open-command-menu", openHandler);

    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-command-menu", openHandler);
    };
  }, [open, activePage, play, search, unlock]);

  const runCommand = React.useCallback(
    (command: () => void) => {
      play("success");
      setOpen(false);
      setSearch("");
      command();
    },
    [play],
  );

  const navigateTo = (page: string) => {
    play("click");
    setSearch("");
    setActivePage(page);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    play("success");
    setOpen(false);
    setSearch("");
  };

  const handleLaunchGame = () => {
    if (onOpenGame) onOpenGame();
    window.dispatchEvent(new Event("open-snake-game"));
    play("success");
    setOpen(false);
    setSearch("");
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} className="cursor-none">
      <div className="flex items-center border-b border-border/40 px-3">
        {activePage === "main" ? (
          <CommandIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        ) : (
          <ArrowLeft
            className="mr-2 h-4 w-4 shrink-0 cursor-pointer hover:text-primary transition-colors"
            onClick={() => {
              setActivePage("main");
              setSearch("");
            }}
          />
        )}
        <CommandInput
          placeholder={
            activePage === "main"
              ? "Type a command or search..."
              : `Searching ${activePage}...`
          }
          value={search}
          onValueChange={setSearch}
          className="border-none focus:ring-0"
        />
      </div>

      <CommandList className="h-75 overflow-y-auto overflow-x-hidden scrollbar-none">
        <CommandEmpty>No results found.</CommandEmpty>

        {activePage === "main" && (
          <>
            <CommandGroup heading="Suggestions">
              <CommandItem
                onSelect={() => runCommand(() => router.push("/contact"))}
                onMouseEnter={() => play("hover")}
              >
                <Mail className="mr-2 h-4 w-4" />
                <span>Contact Me</span>
              </CommandItem>
              <CommandItem
                onSelect={() => navigateTo("theme")}
                onMouseEnter={() => play("hover")}
              >
                <Laptop className="mr-2 h-4 w-4" />
                <span>Change Theme...</span>
              </CommandItem>
              <CommandItem
                onSelect={handleLaunchGame}
                onMouseEnter={() => play("hover")}
              >
                <Gamepad2 className="mr-2 h-4 w-4" />
                <span>Play Snake</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Navigation">
              <CommandItem
                onSelect={() => runCommand(() => router.push("/"))}
                onMouseEnter={() => play("hover")}
              >
                <Home className="mr-2 h-4 w-4" />
                <span>Home</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/about"))}
                onMouseEnter={() => play("hover")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>About</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/uses"))}
                onMouseEnter={() => play("hover")}
              >
                <PcCase className="mr-2 h-4 w-4" />
                <span>Uses</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/guestbook"))}
                onMouseEnter={() => play("hover")}
              >
                <Book className="mr-2 h-4 w-4" />
                <span>Guestbook</span>
              </CommandItem>
              {/* --- ADDED ACHIEVEMENTS HERE --- */}
              <CommandItem
                onSelect={() => runCommand(() => router.push("/achievements"))}
                onMouseEnter={() => play("hover")}
              >
                <Trophy className="mr-2 h-4 w-4" />
                <span>Achievements</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                onMouseEnter={() => play("hover")}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading="Utilities">
              <CommandItem
                onSelect={copyUrl}
                onMouseEnter={() => play("hover")}
              >
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy Current URL</span>
              </CommandItem>
              <CommandItem
                onSelect={toggleMute}
                onMouseEnter={() => play("hover")}
              >
                {isMuted ? (
                  <Monitor className="mr-2 h-4 w-4" />
                ) : (
                  <Monitor className="mr-2 h-4 w-4 text-muted-foreground" />
                )}
                <span>{isMuted ? "Unmute Sfx" : "Mute Sfx"}</span>
              </CommandItem>
              <CommandItem
                onSelect={() => navigateTo("socials")}
                onMouseEnter={() => play("hover")}
              >
                <Share2 className="mr-2 h-4 w-4" />
                <span>Socials...</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {/* ... (Theme and Socials groups remain unchanged) ... */}
        {activePage === "theme" && (
          <CommandGroup heading="Theme">
            <CommandItem
              onSelect={() => runCommand(() => setTheme("light"))}
              onMouseEnter={() => play("hover")}
            >
              <Sun className="mr-2 h-4 w-4" />
              <span>Light Mode</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setTheme("dark"))}
              onMouseEnter={() => play("hover")}
            >
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark Mode</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setTheme("system"))}
              onMouseEnter={() => play("hover")}
            >
              <Laptop className="mr-2 h-4 w-4" />
              <span>System</span>
            </CommandItem>
          </CommandGroup>
        )}

        {activePage === "socials" && (
          <CommandGroup heading="Connect">
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  window.open("https://github.com/t7sen", "_blank"),
                )
              }
              onMouseEnter={() => play("hover")}
            >
              <Github className="mr-2 h-4 w-4" />
              <span>GitHub</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  window.open("https://linkedin.com/in/t7sen", "_blank"),
                )
              }
              onMouseEnter={() => play("hover")}
            >
              <Linkedin className="mr-2 h-4 w-4" />
              <span>LinkedIn</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  window.open("https://twitter.com/t7sen", "_blank"),
                )
              }
              onMouseEnter={() => play("hover")}
            >
              <Twitter className="mr-2 h-4 w-4" />
              <span>Twitter</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  window.open("mailto:contact@t7sen.com", "_self"),
                )
              }
              onMouseEnter={() => play("hover")}
            >
              <Mail className="mr-2 h-4 w-4" />
              <span>Email</span>
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>

      <div className="border-t border-border/40 p-2 px-4 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-mono">
          Tip: Press <kbd className="font-bold">Backspace</kbd> to go back
        </span>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-mono">
            SYSTEM_ONLINE
          </span>
        </div>
      </div>
    </CommandDialog>
  );
}
