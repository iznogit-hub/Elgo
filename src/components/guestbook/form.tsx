"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { signGuestbook } from "@/app/actions/guestbook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, AlertCircle } from "lucide-react"; // Added AlertCircle
import { useSfx } from "@/hooks/use-sfx";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      Sign Guestbook
    </Button>
  );
}

export function GuestbookForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { play } = useSfx();

  async function action(formData: FormData) {
    setError(null);

    // Capture data for optimistic update before sending
    const name = formData.get("name") as string;
    const message = formData.get("message") as string;

    const result = await signGuestbook(formData);

    if (result?.error) {
      if (typeof result.error === "string") {
        setError(result.error);
      } else {
        setError("Invalid input. Please check your entries.");
      }
      play("error"); // Updated to use the new error sound
    } else {
      play("success");
      formRef.current?.reset();

      // Dispatch event for optimistic UI update
      const event = new CustomEvent("guestbook-new-entry", {
        detail: {
          name,
          message,
          timestamp: Date.now(),
        },
      });
      window.dispatchEvent(event);
    }
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col w-full max-w-lg mb-8 gap-4"
    >
      {/* Inputs Row */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Input
          name="name"
          placeholder="Your Name"
          className="flex-1 bg-background/50 backdrop-blur-sm"
          required
          maxLength={32}
        />
        <Input
          name="message"
          placeholder="Leave a message..."
          // Used flex-[2] to ensure the message input is wider if space permits
          className="flex-2 bg-background/50 backdrop-blur-sm"
          required
          maxLength={140}
        />
        <SubmitButton />
      </div>

      {/* Visible Error Box */}
      {error && (
        <div className="flex items-center gap-3 rounded-md bg-red-500/10 border border-red-500/50 p-3 text-red-500 animate-in slide-in-from-top-1 fade-in duration-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </form>
  );
}
