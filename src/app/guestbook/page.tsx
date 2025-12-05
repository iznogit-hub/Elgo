import { Metadata } from "next";
import { GuestbookForm } from "@/components/guestbook/form";
import { GuestbookList } from "@/components/guestbook/list";
import { HackerText } from "@/components/ui/hacker-text";

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Sign the persistent digital ledger.",
};

export const dynamic = "force-dynamic"; // Ensure fresh data on every visit

export default function GuestbookPage() {
  return (
    <main className="flex min-h-screen flex-col items-center pt-24 pb-20 px-6 overflow-hidden relative">
      <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
            <HackerText text="Guestbook" />
          </h1>
          <p className="text-muted-foreground max-w-[400px] mx-auto">
            Leave your mark on the digital ledger.
            <br />
            Data is persisted via Redis.
          </p>
        </div>

        {/* Interactive Elements */}
        <GuestbookForm />

        <div className="w-full h-px bg-linear-to-r from-transparent via-border to-transparent my-4" />

        <GuestbookList />
      </div>

      {/* Optional: reuse background grid or globe here if desired */}
    </main>
  );
}
