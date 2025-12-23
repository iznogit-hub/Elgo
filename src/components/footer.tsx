import Link from "next/link";
import { cacheLife } from "next/cache";
import { GitPulse } from "@/components/ui/git-pulse";
import { SocialLinks } from "@/components/home/social-links";

export async function Footer() {
  "use cache";
  // Cache for days since the year and layout rarely change.
  // This also fixes the "new Date()" error by memoizing the result.
  cacheLife("days");

  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 py-6 pointer-events-none">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-4 pointer-events-auto">
        {/* TOP: Socials */}
        <div className="scale-90 origin-bottom">
          <SocialLinks isFooter={true} />
        </div>

        {/* BOTTOM: Info Pill */}
        <div className="flex items-center gap-3 md:gap-5 bg-background/80 backdrop-blur-md px-5 py-2 rounded-full border border-border/50 shadow-sm">
          {/* Copyright */}
          <Link
            href="https://discord.com/users/170916597156937728"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-mono text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>© {currentYear} T7SEN</span>
          </Link>

          {/* Subtle Divider */}
          <span className="text-border h-3 w-px bg-border block"></span>

          {/* GitPulse */}
          <GitPulse />
        </div>
      </div>
    </footer>
  );
}
