import { Suspense } from "react";
import { auth } from "@/auth";
import { Metadata } from "next";
import { GuestbookClient } from "@/components/pages/guestbook-client";
import { InfiniteGuestbookList } from "@/components/guestbook/infinite-list";
import { fetchGuestbookEntries } from "@/app/actions/guestbook";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Sign the digital ledger.",
  openGraph: {
    images: [
      "/api/og?title=NET_TRACE&section=GUESTBOOK&description=Leave%20your%20permanent%20mark%20on%20the%20digital%20ledger.",
    ],
  },
};

// --- COMPONENTS ---

// 1. The Data Component (Fetches List)
// This is isolated so it can stream in independently of the shell.
async function GuestbookEntries() {
  const initialEntries = await fetchGuestbookEntries(0, 20);
  return <InfiniteGuestbookList initialEntries={initialEntries} />;
}

// 2. The Auth/Shell Component (Fetches Session)
// We move `auth()` here so we can wrap THIS component in Suspense,
// preventing the root page from blocking.
async function GuestbookContent() {
  const session = await auth();

  return (
    <GuestbookClient user={session?.user}>
      <Suspense
        fallback={
          <div className="flex h-40 w-full items-center justify-center rounded-md border border-border/40 bg-background/20 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
          </div>
        }
      >
        <GuestbookEntries />
      </Suspense>
    </GuestbookClient>
  );
}

// 3. The Root Page (Non-Blocking)
// It immediately renders the Suspense boundary, satisfying Next.js 16 requirements.
export default function GuestbookPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[50vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
        </div>
      }
    >
      <GuestbookContent />
    </Suspense>
  );
}
