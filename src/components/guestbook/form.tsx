"use client";

import * as React from "react";
import { useRef, useEffect } from "react";
import { useActionState } from "react";
import Image from "next/image";
import { User } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signGuestbook, type GuestbookState } from "@/app/actions/guestbook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  AlertCircle,
  Github,
  LogOut,
  CheckCircle2,
  Terminal,
} from "lucide-react";
import { FaDiscord, FaGoogle } from "react-icons/fa";
import { useSfx } from "@/hooks/use-sfx";
import { HackerText } from "@/components/ui/hacker-text";

const initialState: GuestbookState = {
  success: false,
  message: "",
};

// --- TERMINAL LOADER ---
function TerminalLoader() {
  const [text, setText] = React.useState("INITIALIZING...");

  React.useEffect(() => {
    const steps = ["ENCRYPTING...", "SIGNING...", "UPLOADING...", "SYNCING..."];
    let i = 0;
    const interval = setInterval(() => {
      setText(steps[i]);
      i = (i + 1) % steps.length;
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono text-xs animate-pulse flex items-center gap-2">
      <Terminal className="h-3 w-3" />
      {text}
    </span>
  );
}

export function GuestbookForm({ user }: { user?: User | null }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { play } = useSfx();
  const router = useRouter();
  const { update } = useSession();

  // React 19 Hook
  const [state, formAction, isPending] = useActionState(
    signGuestbook,
    initialState
  );

  // --- Effect: Handle Success & Events ---
  useEffect(() => {
    if (state.success && state.newEntry) {
      play("success");
      formRef.current?.reset();

      // Dispatch event for the infinite list to pick up immediately
      const event = new CustomEvent("guestbook-new-entry", {
        detail: state.newEntry,
      });
      window.dispatchEvent(event);
    } else if (!state.success && state.message) {
      play("error");
    }
  }, [state, play]);

  // --- Auth Popup Logic ---
  const openLoginPopup = (provider: string) => {
    play("click");
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `/auth/popup?provider=${provider}`,
      `Login with ${provider}`,
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "AUTH_SUCCESS") {
        play("on");
        await update();
        router.refresh();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [play, router, update]);

  const handleLogout = async () => {
    play("click");
    await signOut({ redirect: false });
    router.refresh();
  };

  return (
    <div className="w-full max-w-lg mb-8 flex flex-col gap-4">
      {/* Identity Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-lg border border-border/40 bg-background/30 backdrop-blur-md">
        {user ? (
          <>
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 rounded-full border-2 border-green-500/50 p-0.5">
                <Image
                  src={user.image || "/Avatar.png"}
                  alt={user.name || "User"}
                  fill
                  sizes="40px"
                  className="rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 z-10">
                  <CheckCircle2 className="w-4 h-4 text-green-500 fill-current" />
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-bold flex items-center gap-2">
                  {user.name}
                  <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20">
                    VERIFIED
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  ID: {user.email?.split("@")[0] || "UNKNOWN"}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-red-500 gap-2 h-8"
            >
              <LogOut className="w-3 h-3" />
              <span className="text-xs">Disconnect</span>
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">
                Connect ID for verified status
              </span>
              <span className="sm:hidden">Connect ID</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 hover:border-primary/50 transition-colors"
                onClick={() => openLoginPopup("github")}
                title="Connect GitHub"
              >
                <Github className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 hover:border-primary/50 transition-colors"
                onClick={() => openLoginPopup("discord")}
                title="Connect Discord"
              >
                <FaDiscord className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 hover:border-primary/50 transition-colors"
                onClick={() => openLoginPopup("google")}
                title="Connect Google"
              >
                <FaGoogle className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* The Form */}
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col w-full gap-4"
      >
        <div className="flex flex-col sm:flex-row gap-3 w-full items-start">
          {!user && (
            <div className="flex-1 w-full sm:w-auto">
              <Input
                name="name"
                placeholder="Alias"
                className="bg-background/50 backdrop-blur-sm"
                required
                maxLength={32}
                onFocus={() => play("click")}
                aria-invalid={!!state.errors?.name}
              />
              {state.errors?.name && (
                <p className="text-[10px] text-red-500 mt-1 pl-1 font-mono">
                  {state.errors.name[0]}
                </p>
              )}
            </div>
          )}

          <div className="flex-2 w-full sm:w-auto">
            <Input
              name="message"
              placeholder="Leave a mark in the matrix..."
              className="bg-background/50 backdrop-blur-sm"
              required
              maxLength={140}
              onFocus={() => play("click")}
              aria-invalid={!!state.errors?.message}
            />
            {state.errors?.message && (
              <p className="text-[10px] text-red-500 mt-1 pl-1 font-mono">
                {state.errors.message[0]}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto min-w-[120px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
            onClick={() => play("click")}
          >
            {isPending ? (
              <TerminalLoader />
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                <HackerText text="SIGN" speed={50} />
              </>
            )}
          </Button>
        </div>

        {/* Global Error/Success Message */}
        {state.message && !state.success && (
          <div className="flex items-center gap-3 rounded-md bg-red-500/10 border border-red-500/50 p-3 text-red-500 animate-in slide-in-from-top-1 fade-in duration-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium font-mono">{state.message}</p>
          </div>
        )}
      </form>
    </div>
  );
}
