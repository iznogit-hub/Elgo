import { redis } from "@/lib/redis";
import { type GuestbookEntry } from "@/app/actions/guestbook";
import { InfiniteGuestbookList } from "./infinite-list";

export async function GuestbookList() {
  // 1. Fetch the initial batch of entries (Indices 0 to 19 = 20 items)
  // We fetch this on the server so the page has content immediately on load (SEO friendly)
  const entries = await redis.lrange<GuestbookEntry>("guestbook", 0, 19);

  // 2. Safety check: Redis might return null if empty
  const safeEntries = entries ?? [];

  // 3. Hand off to the Client Component
  // The Client Component will take these initial entries and handle fetching more
  // as the user scrolls down.
  return <InfiniteGuestbookList initialEntries={safeEntries} />;
}
