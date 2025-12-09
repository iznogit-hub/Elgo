import { Metadata } from "next";
import { auth } from "@/auth"; // <--- Import auth
import { GuestbookList } from "@/components/guestbook/list";
import { GuestbookClient } from "@/components/pages/guestbook-client";

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Sign the persistent digital ledger.",
};

export const dynamic = "force-dynamic";

export default async function GuestbookPage() {
  const session = await auth(); // <--- Fetch Session

  return (
    // Pass the user object (or null) to the client wrapper
    <GuestbookClient user={session?.user}>
      <GuestbookList />
    </GuestbookClient>
  );
}
