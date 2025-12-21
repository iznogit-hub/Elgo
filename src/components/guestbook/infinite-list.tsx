"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchGuestbookEntries,
  deleteGuestbookEntry,
  purgeGuestbook,
  type GuestbookEntry,
} from "@/app/actions/guestbook";
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

const CARD_WIDTH = 280;
const GAP = 16;

const ProviderIcon = ({ provider }: { provider?: string }) => {
  const style =
    "w-3 h-3 text-muted-foreground/40 transition-colors group-hover:text-primary/60";
  if (provider === "github")
    return <Icons.github className={style} aria-hidden="true" />;
  if (provider === "discord")
    return <Icons.discord className={style} aria-hidden="true" />;
  if (provider === "google")
    return <Icons.google className={style} aria-hidden="true" />;
  return null;
};

// --- REDESIGNED CARD ---
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
          observer.disconnect();
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
        "relative shrink-0 flex flex-col justify-between rounded-2xl border border-white/5 bg-zinc-50/5 dark:bg-zinc-900/5 p-4 backdrop-blur-md transition-all duration-500 hover:bg-zinc-50/10 dark:hover:bg-zinc-900/10 hover:border-white/10 hover:shadow-lg hover:shadow-primary/5 select-none overflow-hidden group",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10",
      )}
      style={{
        width: `${CARD_WIDTH}px`,
        height: "170px",
        transitionDelay: `${(index % 5) * 100}ms`,
      }}
    >
      {/* 1. Header Row: Avatar | Name | Provider */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10 shadow-sm">
          <Image
            src={entry.avatar || "/Avatar.png"}
            alt={entry.name}
            fill
            sizes="24px"
            className="object-cover"
          />
        </div>

        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-foreground/90 flex items-center gap-1 tracking-tight truncate">
            {entry.name}
            {entry.verified && (
              <CheckCircle2 className="w-2.5 h-2.5 text-blue-400" />
            )}
          </span>
          <ProviderIcon provider={entry.provider} />
        </div>
      </div>

      {/* 2. Message Body: Takes available space */}
      <div className="relative flex-1 min-h-0 group/text my-2">
        <p className="text-xs text-foreground/80 leading-relaxed font-normal whitespace-pre-wrap overflow-y-auto scrollbar-none h-full pr-1">
          {entry.message}
        </p>
        {/* Fade effect at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-linear-to-t from-background/5 to-transparent pointer-events-none opacity-0 group-hover/text:opacity-100 transition-opacity" />
      </div>

      {/* 3. Footer: Date & Admin Controls */}
      <div className="flex items-center justify-between shrink-0 pt-2 border-t border-white/5">
        <span
          className="text-[9px] text-muted-foreground/50 font-medium hover:text-foreground/80 transition-colors cursor-help"
          title={new Date(entry.timestamp).toLocaleString()} // HOVER RESTORED
        >
          {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
        </span>

        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all -mr-1"
            onClick={() => onDelete(entry)}
            title="Delete Entry"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function InfiniteGuestbookList({
  initialEntries,
}: InfiniteGuestbookListProps) {
  const [entries, setEntries] = useState<GuestbookEntry[]>(initialEntries);
  const [offset, setOffset] = useState(initialEntries.length);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll logic
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>(0);

  const { isAdmin } = useAdmin();
  const { play } = useSfx();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Calculate width for infinite loop reset
  const singleSetWidth = entries.length * (CARD_WIDTH + GAP);

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

  // --- UNIFIED SCROLL HANDLER ---
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Loop Reset Logic
      if (container.scrollLeft >= singleSetWidth) {
        container.scrollLeft -= singleSetWidth;
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [singleSetWidth]);

  // --- ANIMATION LOOP ---
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const animate = () => {
      if (!isPaused) {
        container.scrollLeft += 0.5;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPaused]);

  // --- MOUSE WHEEL HANDLER ---
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // --- DATA SYNC ---
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

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className="w-full h-full overflow-x-auto whitespace-nowrap scrollbar-none [&::-webkit-scrollbar]:hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="flex w-max gap-4 p-1 pt-2 pb-4 items-start h-full px-4">
          {/* ORIGINAL SET */}
          {entries.map((entry, i) => (
            <GuestbookCard
              key={`orig-${entry.timestamp}-${entry.name}-${i}`}
              entry={entry}
              index={i}
              isAdmin={isAdmin}
              onDelete={handleDelete}
            />
          ))}

          {/* DUPLICATE SET */}
          {entries.map((entry, i) => (
            <GuestbookCard
              key={`dup-${entry.timestamp}-${entry.name}-${i}`}
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
      </div>
    </div>
  );
}
