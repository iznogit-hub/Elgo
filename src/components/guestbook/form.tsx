"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { signGuestbook } from "@/app/actions/guestbook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
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
    const result = await signGuestbook(formData);

    if (result?.error) {
      if (typeof result.error === "string") {
        setError(result.error);
      } else {
        setError("Invalid input. Please check your entries.");
      }
      play("click"); // Error sound if you have one, or standard click
    } else {
      play("success");
      formRef.current?.reset();
    }
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mb-8"
    >
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
        className="flex-2 bg-background/50 backdrop-blur-sm"
        required
        maxLength={140}
      />
      <SubmitButton />
      {error && (
        <p className="text-red-500 text-xs absolute -bottom-6">{error}</p>
      )}
    </form>
  );
}
