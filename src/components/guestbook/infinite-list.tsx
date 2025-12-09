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
  ShieldAlert,
  Skull,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { FaGithub, FaDiscord, FaGoogle } from "react-icons/fa";
import { useSfx } from "@/hooks/use-sfx";
import { Button } from "@/components/ui/button";

interface InfiniteGuestbookListProps {
  initialEntries: GuestbookEntry[];
}

export function InfiniteGuestbookList({
  initialEntries,
}: InfiniteGuestbookListProps) {
  const [entries, setEntries] = useState<GuestbookEntry[]>(initialEntries);
  const [offset, setOffset] = useState(initialEntries.length);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [isAdminMode, setIsAdminMode] = useState(false);
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

  // Trigger: Shift + Alt + X (or D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Changed to 'X' as per your last message, or keep 'D'
      if (e.shiftKey && e.altKey && (e.key === "x" || e.key === "X")) {
        e.preventDefault();
        setIsAdminMode((prev) => {
          const newState = !prev;
          play(newState ? "on" : "off");
          return newState;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [play]);

  // --- NEW: Purge All Handler ---
  const handlePurgeAll = async () => {
    // 1. Double Confirmation
    if (
      !confirm(
        "⚠️ WARNING: This will delete ALL messages forever.\nAre you sure?"
      )
    ) {
      return;
    }

    const secret = window.prompt(
      "FINAL AUTHORIZATION:\nEnter Admin Secret to NUKE database:"
    );
    if (!secret) return;

    // 2. Server Action
    const result = await purgeGuestbook(secret);

    if (result?.error) {
      alert(result.error);
      play("error");
    } else {
      // 3. Success: Clear local state immediately
      setEntries([]);
      setHasMore(false);
      play("success"); // Or a custom explosion sound if you add one!
      alert("SYSTEM PURGED. Guestbook is empty.");
    }
  };

  const handleDelete = async (entry: GuestbookEntry) => {
    const secret = window.prompt(
      "AUTHENTICATION REQUIRED:\nEnter Admin Secret:"
    );
    if (!secret) return;

    const previousEntries = [...entries];
    setEntries((prev) => prev.filter((e) => e.timestamp !== entry.timestamp));

    const result = await deleteGuestbookEntry(entry, secret);

    if (result?.error) {
      alert(result.error);
      play("error");
      setEntries(previousEntries);
    } else {
      play("click");
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
      if (newEntries.length === 0) {
        setHasMore(false);
      } else {
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

  // Empty State
  if (entries.length === 0) {
    return (
      <div className="flex h-40 flex-col gap-4 items-center justify-center rounded-md border border-border/40 bg-background/20 backdrop-blur-sm p-4">
        <p className="text-sm italic text-muted-foreground">No messages yet.</p>
        {/* Allow Purge even if empty? Probably not needed, but here's the admin toggle just in case you want to toggle it OFF visually */}
        {isAdminMode && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-500 px-3 py-1 rounded-full text-[10px] font-mono font-bold">
            <ShieldAlert className="w-3 h-3" />
            <span>ADMIN_ACTIVE</span>
          </div>
        )}
      </div>
    );
  }

  // Helper to render provider icon (Optional detail)
  const ProviderIcon = ({ provider }: { provider?: string }) => {
    if (provider === "github")
      return <FaGithub className="w-3 h-3 text-muted-foreground/50" />;
    if (provider === "discord")
      return <FaDiscord className="w-3 h-3 text-muted-foreground/50" />;
    if (provider === "google")
      return <FaGoogle className="w-3 h-3 text-muted-foreground/50" />;
    return null;
  };

  return (
    <ScrollArea className="h-full w-full max-w-lg rounded-md border border-border/40 bg-background/20 backdrop-blur-sm p-4 relative">
      {/* --- Admin Controls Header --- */}
      {isAdminMode && (
        <div className="sticky top-0 left-0 right-0 z-50 flex flex-col items-center gap-2 pb-6 -mt-2 pointer-events-none">
          {/* Status Badge */}
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-500 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest animate-pulse backdrop-blur-md">
            <ShieldAlert className="w-3 h-3" />
            <span>PURGE_MODE_ENGAGED</span>
          </div>

          {/* NUKE BUTTON (Pointer events auto to allow clicking) */}
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
            {/* --- HEADER ROW --- */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
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

                {/* Name & Badge */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-bold text-primary">
                      {entry.name}
                    </span>
                    {entry.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400/10" />
                    )}
                  </div>
                  {/* Timestamp & Provider Icon */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] text-muted-foreground"
                      suppressHydrationWarning
                    >
                      {new Date(entry.timestamp).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </span>
                    <ProviderIcon provider={entry.provider} />
                  </div>
                </div>
              </div>

              {/* Admin Delete Button (Keep existing logic) */}
              {isAdminMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500 hover:text-white hover:bg-red-600 transition-all duration-300"
                  onClick={() => handleDelete(entry)}
                  title="Delete Entry"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* --- MESSAGE CONTENT --- */}
            <p className="text-sm text-foreground/90 wrap-break-word whitespace-pre-wrap pl-11">
              {entry.message}
            </p>
          </div>
        ))}

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
