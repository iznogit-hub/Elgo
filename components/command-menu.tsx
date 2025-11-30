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
import { Button } from "@/components/ui/button";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const { setTheme } = useTheme();
  const router = useRouter();

  // 1. Event Listener for CMD+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // 2. Action Handlers
  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      {/* Optional: A visual hint button in the bottom right (for mobile users) */}
      <div className="fixed bottom-4 right-4 z-50 hidden md:flex items-center gap-2 text-muted-foreground text-xs pointer-events-none">
        <span className="bg-muted px-2 py-1 rounded border border-border/50">
          ⌘ K
        </span>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  window.open("mailto:contact@t7sen.com", "_self")
                )
              }
            >
              <Mail className="mr-2 h-4 w-4" />
              <span>Send Email</span>
              <CommandShortcut>↵</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  navigator.clipboard.writeText("contact@t7sen.com")
                )
              }
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              <span>Copy Email</span>
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
            >
              <Twitter className="mr-2 h-4 w-4" />
              <span>Twitter</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light Mode</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark Mode</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Laptop className="mr-2 h-4 w-4" />
              <span>System</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="System">
            <CommandItem
              onSelect={() => runCommand(() => window.location.reload())}
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
