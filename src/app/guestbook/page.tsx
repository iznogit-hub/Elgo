import { Metadata } from "next";
import { GuestbookList } from "@/components/guestbook/list";
import { GuestbookClient } from "@/components/pages/guestbook-client";

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Sign the persistent digital ledger.",
};

export const dynamic = "force-dynamic";

export default function GuestbookPage() {
  return (
    <GuestbookClient>
      <GuestbookList />
    </GuestbookClient>
  );
}
