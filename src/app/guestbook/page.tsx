import { Suspense } from "react";
import { auth } from "@/auth";
import { Metadata } from "next";
import { GuestbookShell } from "@/components/pages/guestbook-client";
import { GuestbookForm } from "@/components/guestbook/form";
import { InfiniteGuestbookList } from "@/components/guestbook/infinite-list";
import { fetchGuestbookEntries } from "@/app/actions/guestbook";
import { GuestbookSkeleton } from "@/components/skeletons/guestbook-skeleton";
// IMPORT THE NEW SKELETON
import { GuestbookFormSkeleton } from "@/components/skeletons/guestbook-form-skeleton";

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Sign the digital ledger.",
  openGraph: {
    images: [
      "/api/og?title=NET_TRACE&section=GUESTBOOK&description=Leave%20your%20permanent%20mark%20on%20the%20digital%20ledger.",
    ],
  },
};

// --- ISOLATED COMPONENTS ---

async function AsyncGuestbookList() {
  const initialEntries = await fetchGuestbookEntries(0, 20);
  return <InfiniteGuestbookList initialEntries={initialEntries} />;
}

async function AsyncGuestbookForm() {
  const session = await auth();
  return <GuestbookForm user={session?.user} />;
}

// --- ROOT PAGE ---
export default function GuestbookPage() {
  return (
    <GuestbookShell
      form={
        // UPDATE: Use the Form Skeleton here
        <Suspense fallback={<GuestbookFormSkeleton />}>
          <AsyncGuestbookForm />
        </Suspense>
      }
    >
      <Suspense fallback={<GuestbookSkeleton />}>
        <AsyncGuestbookList />
      </Suspense>
    </GuestbookShell>
  );
}
