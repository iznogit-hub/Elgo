import { Suspense } from "react";
import { auth } from "@/auth";
import { Metadata } from "next";
import { GuestbookClient } from "@/components/pages/guestbook-client";
import { InfiniteGuestbookList } from "@/components/guestbook/infinite-list";
import { fetchGuestbookEntries } from "@/app/actions/guestbook";
import { Loader2 } from "lucide-react";
// 1. IMPORT: The specialized skeleton
import { GuestbookSkeleton } from "@/components/skeletons/guestbook-skeleton";

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
async function GuestbookEntries() {
  const initialEntries = await fetchGuestbookEntries(0, 20);
  return <InfiniteGuestbookList initialEntries={initialEntries} />;
}

// 2. The Auth/Shell Component (Fetches Session)
async function GuestbookContent() {
  const session = await auth();

  return (
    <GuestbookClient user={session?.user}>
      {/* 2. APPLY: Replace generic Loader with Skeleton */}
      {/* The form above loads instantly; the list below shimmers. */}
      <Suspense fallback={<GuestbookSkeleton />}>
        <GuestbookEntries />
      </Suspense>
    </GuestbookClient>
  );
}

// 3. The Root Page (Non-Blocking)
// We keep the generic spinner for the brief authentication check
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
