"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { User } from "next-auth";
import Image from "next/image";
import { signGuestbook } from "@/app/actions/guestbook";
import { login, logout } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Send,
  AlertCircle,
  Github,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { FaDiscord, FaGoogle } from "react-icons/fa"; // You installed react-icons
import { useSfx } from "@/hooks/use-sfx";

// --- Submit Button Component ---
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto min-w-[140px]"
    >
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      Sign
    </Button>
  );
}

// --- Main Form Component ---
export function GuestbookForm({ user }: { user?: User | null }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { play } = useSfx();

  async function action(formData: FormData) {
    setError(null);

    // Capture data for optimistic update
    const name = user?.name || (formData.get("name") as string);
    const message = formData.get("message") as string;
    const avatar = user?.image || undefined;

    // Determine provider for optimistic UI
    let provider = undefined;
    if (user?.image?.includes("github")) provider = "github";
    else if (user?.image?.includes("discord")) provider = "discord";
    else if (user?.image?.includes("google")) provider = "google";

    const result = await signGuestbook(formData);

    if (result?.error) {
      if (typeof result.error === "string") {
        setError(result.error);
      } else {
        setError("Invalid input. Please check your entries.");
      }
      play("error");
    } else {
      play("success");
      formRef.current?.reset();

      const event = new CustomEvent("guestbook-new-entry", {
        detail: {
          name,
          message,
          timestamp: Date.now(),
          verified: !!user,
          avatar,
          provider,
        },
      });
      window.dispatchEvent(event);
    }
  }

  return (
    <div className="w-full max-w-lg mb-8 flex flex-col gap-4">
      {/* --- IDENTITY CONTROL PANEL --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-lg border border-border/40 bg-background/30 backdrop-blur-md">
        {user ? (
          // --- AUTHENTICATED STATE ---
          <>
            <div className="flex items-center gap-3">
              {/* Avatar Ring */}
              <div className="relative h-10 w-10 rounded-full border-2 border-green-500/50 p-0.5">
                <Image
                  src={user.image || "/Avatar.png"}
                  alt={user.name || "User"}
                  fill
                  sizes="40px"
                  className="rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
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
              onClick={() => {
                play("click");
                logout();
              }}
              className="text-muted-foreground hover:text-red-500 gap-2 h-8"
            >
              <LogOut className="w-3 h-3" />
              <span className="text-xs">Disconnect</span>
            </Button>
          </>
        ) : (
          // --- ANONYMOUS STATE ---
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
                className="h-8 w-8"
                onClick={() => {
                  play("click");
                  login("github");
                }}
                title="Connect GitHub"
              >
                <Github className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  play("click");
                  login("discord");
                }}
                title="Connect Discord"
              >
                <FaDiscord className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  play("click");
                  login("google");
                }}
                title="Connect Google"
              >
                <FaGoogle className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* --- INPUT FORM --- */}
      <form
        ref={formRef}
        action={action}
        className="flex flex-col w-full gap-4"
      >
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {/* If user is logged in, we hide the name input and let the server use their session name */}
          {!user && (
            <Input
              name="name"
              placeholder="Your Name"
              className="flex-1 bg-background/50 backdrop-blur-sm"
              required
              maxLength={32}
            />
          )}

          <Input
            name="message"
            placeholder="Leave a message..."
            className="flex-2 bg-background/50 backdrop-blur-sm"
            required
            maxLength={140}
          />
          <SubmitButton />
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-md bg-red-500/10 border border-red-500/50 p-3 text-red-500 animate-in slide-in-from-top-1 fade-in duration-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
}
