import { HeroSection } from "@/components/coming-soon/hero-section";
import { SocialLinks } from "@/components/coming-soon/social-links";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Navigation Header */}
      <nav className="flex w-full items-center justify-between p-6 md:px-12">
        <div className="text-xl font-bold tracking-tighter">
          <span className="cursor-default transition-colors hover:text-primary">
            t7sen
          </span>
        </div>
        <ThemeToggle />
      </nav>

      {/* Central Content */}
      <div className="w-full">
        <HeroSection />
      </div>

      {/* Footer Section */}
      <footer className="flex w-full flex-col items-center gap-6 pb-12 pt-8">
        <SocialLinks />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} t7sen. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
