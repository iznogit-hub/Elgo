import { redis } from "@/lib/redis";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GuestbookEntry {
  name: string;
  message: string;
  timestamp: number;
}

export async function GuestbookList() {
  // Fetch top 50 entries
  const entries = await redis.lrange<GuestbookEntry>("guestbook", 0, 50);

  if (!entries || entries.length === 0) {
    return (
      <p className="text-muted-foreground text-sm italic">
        No messages yet. Be the first!
      </p>
    );
  }

  return (
    <ScrollArea className="h-[400px] w-full max-w-lg rounded-md border border-border/40 bg-background/20 backdrop-blur-sm p-4">
      <div className="flex flex-col gap-4">
        {entries.map((entry, i) => (
          <div
            key={`${entry.timestamp}-${i}`}
            className="p-4 rounded-lg border border-border/40 bg-background/40 backdrop-blur-md flex flex-col gap-1 animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-primary font-mono">
                {entry.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(entry.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-foreground/90">{entry.message}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
