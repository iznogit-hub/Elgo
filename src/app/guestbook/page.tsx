import { Metadata } from "next";
import { auth } from "@/auth"; // <--- Import auth
import { GuestbookList } from "@/components/guestbook/list";
import { GuestbookClient } from "@/components/pages/guestbook-client";

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Sign the digital ledger.",
  openGraph: {
    images: [
      "/api/og?title=NET_TRACE&section=GUESTBOOK&description=Leave%20your%20permanent%20mark%20on%20the%20digital%20ledger.",
    ],
  },
};

export const dynamic = "force-dynamic";

export default async function GuestbookPage() {
  const session = await auth();

  return (
    // Pass the user object (or null) to the client wrapper
    <GuestbookClient user={session?.user}>
      <GuestbookList />
    </GuestbookClient>
  );
}
