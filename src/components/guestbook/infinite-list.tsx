"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { useSfx } from "@/hooks/use-sfx";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/providers/admin-provider";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface InfiniteGuestbookListProps {
  initialEntries: GuestbookEntry[];
}

// --- HELPER COMPONENTS ---

const ProviderIcon = ({ provider }: { provider?: string }) => {
  if (provider === "github")
    return (
      <Icons.github
        className="w-3 h-3 text-muted-foreground/50"
        aria-hidden="true"
      />
    );
  if (provider === "discord")
    return (
      <Icons.discord
        className="w-3 h-3 text-muted-foreground/50"
        aria-hidden="true"
      />
    );
  if (provider === "google")
    return (
      <Icons.google
        className="w-3 h-3 text-muted-foreground/50"
        aria-hidden="true"
      />
    );
  return null;
};

// --- ANIMATED CARD COMPONENT ---
function GuestbookCard({
  entry,
  index,
  isAdmin,
  onDelete,
}: {
  entry: GuestbookEntry;
  index: number;
  isAdmin: boolean;
  onDelete: (entry: GuestbookEntry) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only animate once
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "w-75 md:w-87.5 shrink-0 flex flex-col gap-3 rounded-lg border border-border/40 bg-background/40 p-5 backdrop-blur-md group relative hover:bg-background/60 transition-all duration-500 whitespace-normal",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10", // Scroll Reveal Animation
      )}
      style={{
        transitionDelay: `${(index % 5) * 100}ms`, // Stagger effect
      }}
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
              <span
                className="text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-help"
                suppressHydrationWarning
                title={new Date(entry.timestamp).toLocaleString()}
              >
                {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
              </span>
              <ProviderIcon provider={entry.provider} />
            </div>
          </div>

          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-500 hover:text-white hover:bg-red-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(entry)}
              title="Delete Entry"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <p className="text-sm text-foreground/90 wrap-break-word whitespace-pre-wrap leading-relaxed h-full overflow-y-auto max-h-37.5 scrollbar-hide">
        {entry.message}
      </p>
    </div>
  );
}

// --- MAIN LIST COMPONENT ---
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
    currentList: GuestbookEntry[],
  ) => {
    return currentList.some(
      (existing) =>
        existing.timestamp === newEntry.timestamp &&
        existing.name === newEntry.name,
    );
  };

  const handlePurgeAll = async () => {
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
    setEntries((prev) => prev.filter((e) => e.timestamp !== entry.timestamp));

    const result = await deleteGuestbookEntry(entry);

    if (result?.error) {
      setEntries(previousEntries);
      play("error");
      toast.error(result.error);
    } else {
      play("click");
      toast.success("Entry Deleted", { duration: 2000 });
    }
  };

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
            (entry) => !isDuplicate(entry, prev),
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
      { root: null, rootMargin: "0px 200px 0px 0px", threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [loadMoreEntries]);

  if (entries.length === 0) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-md border border-border/40 bg-background/20 backdrop-blur-sm p-4">
        <p className="text-sm italic text-muted-foreground">No messages yet.</p>
        {isAdmin && (
          <div className="text-[10px] text-red-500 font-mono">ADMIN ACTIVE</div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isAdmin && (
        <div className="absolute top-0 left-0 z-50 flex items-center gap-4 mb-4 -mt-10 pl-2">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/50 text-green-500 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest backdrop-blur-md">
            <ShieldCheck className="w-3 h-3" />
            <span>ADMIN_ACTIVE</span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handlePurgeAll}
            className="h-7 text-[10px] font-mono tracking-widest bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20"
          >
            <Skull className="w-3 h-3 mr-2" />
            PURGE
          </Button>
        </div>
      )}

      <ScrollArea
        className="w-full h-full whitespace-nowrap"
        orientation="horizontal"
      >
        <div className="flex w-max space-x-4 p-1 pb-4 items-stretch h-full">
          {entries.map((entry, i) => (
            <GuestbookCard
              key={`${entry.timestamp}-${entry.name}-${i}`}
              entry={entry}
              index={i}
              isAdmin={isAdmin}
              onDelete={handleDelete}
            />
          ))}

          <div
            ref={sentinelRef}
            className="flex w-20 h-full shrink-0 items-center justify-center"
          >
            {isLoading && (
              <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
            )}
            {!hasMore && entries.length > 0 && (
              <div className="h-full w-px bg-border/40 mx-auto" />
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
