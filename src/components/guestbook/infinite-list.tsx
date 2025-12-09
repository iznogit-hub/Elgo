"use client";

import { useState, useEffect, useRef, useCallback } from "react";
// FIX: Import the new purge action
import {
  fetchGuestbookEntries,
  deleteGuestbookEntry,
  purgeGuestbook,
  type GuestbookEntry,
} from "@/app/actions/guestbook";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Trash2,
  Skull,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { FaGithub, FaDiscord, FaGoogle } from "react-icons/fa";
import { useSfx } from "@/hooks/use-sfx";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/providers/admin-provider";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface InfiniteGuestbookListProps {
  initialEntries: GuestbookEntry[];
}

const ProviderIcon = ({ provider }: { provider?: string }) => {
  if (provider === "github")
    return <FaGithub className="w-3 h-3 text-muted-foreground/50" />;
  if (provider === "discord")
    return <FaDiscord className="w-3 h-3 text-muted-foreground/50" />;
  if (provider === "google")
    return <FaGoogle className="w-3 h-3 text-muted-foreground/50" />;
  return null;
};

export function InfiniteGuestbookList({
  initialEntries,
}: InfiniteGuestbookListProps) {
  const [entries, setEntries] = useState<GuestbookEntry[]>(initialEntries);
  const [offset, setOffset] = useState(initialEntries.length);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { isAdmin } = useAdmin();
  const { play } = useSfx();

  const sentinelRef = useRef<HTMLDivElement>(null);

  const isDuplicate = (
    newEntry: GuestbookEntry,
    currentList: GuestbookEntry[]
  ) => {
    return currentList.some(
      (existing) =>
        existing.timestamp === newEntry.timestamp &&
        existing.name === newEntry.name
    );
  };

  // --- NEW: Purge All Handler ---
  const handlePurgeAll = async () => {
    // Use toast.promise for better UX
    const promise = async () => {
      const result = await purgeGuestbook();
      if (result?.error) throw new Error(result.error);
      setEntries([]);
      setHasMore(false);
      play("success");
      return "SYSTEM DATA PURGED";
    };

    toast.promise(promise, {
      loading: "Initializing Purge Protocol...",
      success: (data) => data,
      error: (err) => {
        play("error");
        return err.message;
      },
    });
  };

  const handleDelete = async (entry: GuestbookEntry) => {
    const previousEntries = [...entries];

    // Optimistic Update
    setEntries((prev) => prev.filter((e) => e.timestamp !== entry.timestamp));

    // Use toast instead of silent fail/alert
    const result = await deleteGuestbookEntry(entry);

    if (result?.error) {
      setEntries(previousEntries); // Revert
      play("error");
      toast.error(result.error);
    } else {
      play("click");
      toast.success("Entry Deleted", { duration: 2000 });
    }
  };

  // ... (Keep Real-time Event Listener & LoadMore logic exactly as is) ...
  useEffect(() => {
    const handleNewEntry = (event: Event) => {
      const customEvent = event as CustomEvent<GuestbookEntry>;
      const newEntry = customEvent.detail;
      setEntries((prev) => {
        if (isDuplicate(newEntry, prev)) return prev;
        return [newEntry, ...prev];
      });
      setOffset((prev) => prev + 1);
    };
    window.addEventListener("guestbook-new-entry", handleNewEntry);
    return () =>
      window.removeEventListener("guestbook-new-entry", handleNewEntry);
  }, []);

  const loadMoreEntries = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const newEntries = await fetchGuestbookEntries(offset, 20);
      if (newEntries.length === 0) setHasMore(false);
      else {
        setEntries((prev) => {
          const uniqueNewEntries = newEntries.filter(
            (entry) => !isDuplicate(entry, prev)
          );
          return [...prev, ...uniqueNewEntries];
        });
        setOffset((prev) => prev + 20);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [offset, isLoading, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreEntries();
      },
      { root: null, rootMargin: "100px", threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [loadMoreEntries]);

  // --- RENDER ---
  if (entries.length === 0) {
    return (
      <div className="flex h-40 flex-col gap-4 items-center justify-center rounded-md border border-border/40 bg-background/20 backdrop-blur-sm p-4">
        <p className="text-sm italic text-muted-foreground">No messages yet.</p>
        {isAdmin && (
          // Keep the indicator logic if you want
          <div className="text-[10px] text-red-500 font-mono">ADMIN ACTIVE</div>
        )}
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full max-w-lg rounded-md border border-border/40 bg-background/20 backdrop-blur-sm p-4 relative">
      {/* Admin Header */}
      {isAdmin && (
        <div className="sticky top-0 left-0 right-0 z-50 flex flex-col items-center gap-2 pb-6 -mt-2 pointer-events-none">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/50 text-green-500 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest backdrop-blur-md">
            <ShieldCheck className="w-3 h-3" />
            <span>ADMIN_CLEARANCE_GRANTED</span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handlePurgeAll}
            className="pointer-events-auto h-7 text-[10px] font-mono tracking-widest bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20"
          >
            <Skull className="w-3 h-3 mr-2" />
            PURGE_ALL_DATA
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {entries.map((entry, i) => (
          <div
            key={`${entry.timestamp}-${entry.name}-${i}`}
            className="flex flex-col gap-2 rounded-lg border border-border/40 bg-background/40 p-4 backdrop-blur-md animate-fade-in group relative hover:bg-background/60 transition-colors"
            style={{ animationDelay: `${(i % 20) * 0.05}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 w-full">
                {/* Avatar */}
                <div className="relative h-8 w-8 shrink-0 rounded-full border border-border/50 bg-muted overflow-hidden">
                  <Image
                    src={entry.avatar || "/Avatar.png"}
                    alt={entry.name}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-bold text-primary truncate">
                      {entry.name}
                    </span>
                    {entry.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400/10 shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* UPDATED: Relative Time with Tooltip behavior */}
                    <span
                      className="text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-help"
                      suppressHydrationWarning
                      title={new Date(entry.timestamp).toLocaleString()} // Native browser tooltip
                    >
                      {formatDistanceToNow(entry.timestamp, {
                        addSuffix: true,
                      })}
                    </span>

                    <ProviderIcon provider={entry.provider} />
                  </div>
                </div>

                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-white hover:bg-red-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(entry)}
                    title="Delete Entry"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            <p className="text-sm text-foreground/90 wrap-break-word whitespace-pre-wrap pl-11">
              {entry.message}
            </p>
          </div>
        ))}
        {/* ... (Sentinel remains the same) ... */}
        <div
          ref={sentinelRef}
          className="flex h-10 w-full items-center justify-center py-4"
        >
          {isLoading && (
            <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
          )}
          {!hasMore && entries.length > 0 && (
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40">
              End of Transmission
            </span>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
