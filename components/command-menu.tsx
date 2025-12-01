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
  RotateCcw,
  ArrowRight,
  User,
  Home,
  Volume2,
  VolumeX,
  Gamepad2,
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
import { useSound } from "@/components/sound-provider"; // Import global sound state

interface CommandMenuProps {
  onOpenGame: () => void;
}

export function CommandMenu({ onOpenGame }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false);
  const { setTheme } = useTheme();
  const { play } = useSfx();
  const { isMuted, toggleMute } = useSound(); // Access global mute state
  const router = useRouter();

  // 1. Toggle Event Listener
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!open) play("click");
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, play]);

  // 2. Keyboard Navigation Sound
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        play("hover");
      }
      if (e.key === "Enter") {
        play("click");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, play]);

  const runCommand = React.useCallback(
    (command: () => void) => {
      play("success");
      setOpen(false);
      command();
    },
    [play]
  );

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 hidden md:flex items-center gap-2 text-muted-foreground text-xs pointer-events-none select-none">
        <span className="bg-muted px-2 py-1 rounded border border-border/50">
          ⌘ K
        </span>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

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
              <span>About Me</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="General">
            <CommandItem
              onSelect={() => runCommand(() => toggleMute())}
              onMouseEnter={() => play("hover")}
            >
              {isMuted ? (
                <Volume2 className="mr-2 h-4 w-4" />
              ) : (
                <VolumeX className="mr-2 h-4 w-4" />
              )}
              <span>{isMuted ? "Unmute Sounds" : "Mute Sounds"}</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  navigator.clipboard.writeText("contact@t7sen.com")
                )
              }
              onMouseEnter={() => play("hover")}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              <span>Copy Email</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  window.open("mailto:contact@t7sen.com", "_self")
                )
              }
              onMouseEnter={() => play("hover")}
            >
              <Mail className="mr-2 h-4 w-4" />
              <span>Send Email</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Socials">
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  window.open("https://github.com/t7sen", "_blank")
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
                  window.open("https://linkedin.com/in/t7sen", "_blank")
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
                  window.open("https://twitter.com/t7sen", "_blank")
                )
              }
              onMouseEnter={() => play("hover")}
            >
              <Twitter className="mr-2 h-4 w-4" />
              <span>Twitter</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

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

          <CommandSeparator />

          <CommandGroup heading="System">
            {/* ADDED: Game Trigger */}
            <CommandItem
              onSelect={() => runCommand(() => onOpenGame())}
              onMouseEnter={() => play("hover")}
            >
              <Gamepad2 className="mr-2 h-4 w-4" />
              <span>Initialize Snake Protocol</span>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => window.location.reload())}
              onMouseEnter={() => play("hover")}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              <span>Reboot System</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
