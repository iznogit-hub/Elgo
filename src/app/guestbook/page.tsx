import { auth } from "@/auth";
import { Metadata } from "next";
import { GuestbookClient } from "@/components/pages/guestbook-client";
import { InfiniteGuestbookList } from "@/components/guestbook/infinite-list";
import { fetchGuestbookEntries } from "@/app/actions/guestbook";

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Sign the digital ledger.",
  openGraph: {
    images: [
      "/api/og?title=NET_TRACE&section=GUESTBOOK&description=Leave%20your%20permanent%20mark%20on%20the%20digital%20ledger.",
    ],
  },
};

export default async function GuestbookPage() {
  // 1. Fetch User Session (Dynamic)
  const session = await auth();

  // 2. Fetch Initial Data (Cached via "use cache" in the action)
  // We fetch the first 20 items server-side for immediate SEO and performance.
  const initialEntries = await fetchGuestbookEntries(0, 20);

  // 3. Render Composition
  // GuestbookClient handles the layout/animations.
  // InfiniteGuestbookList handles the interactive list and "load more" logic.
  return (
    <GuestbookClient user={session?.user}>
      <InfiniteGuestbookList initialEntries={initialEntries} />
    </GuestbookClient>
  );
}
