import Link from "next/link"; // Import added here
import { HeroSection } from "@/components/coming-soon/hero-section";
import { SocialLinks } from "@/components/coming-soon/social-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { Background } from "@/components/coming-soon/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Background />

      {/* Navigation Header */}
      <nav className="flex w-full items-center justify-between p-6 md:px-12 z-10">
        <div className="flex items-center gap-2">
          <MagneticWrapper strength={0.2}>
            {/* FIXED: Changed <a> to <Link> for internal routing */}
            <Link href="/" aria-label="Home" className="block">
              <Logo className="h-8 w-auto text-foreground transition-transform hover:scale-105" />
            </Link>
          </MagneticWrapper>
        </div>

        <MagneticWrapper strength={0.6}>
          <ThemeToggle />
        </MagneticWrapper>
      </nav>

      {/* Central Content */}
      <div className="w-full z-10">
        <HeroSection />
      </div>

      {/* Footer Section */}
      <footer className="flex w-full flex-col items-center gap-6 pb-12 pt-8 z-10">
        <SocialLinks />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} t7sen. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
