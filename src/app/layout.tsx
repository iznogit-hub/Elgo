import type { Metadata } from "next";
import { Orbitron, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

// --- PROVIDERS ---
import { AuthProvider } from "@/lib/context/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { SoundProvider } from "@/components/sound-provider";
import { RealtimeProvider } from "@/providers/realtime-provider"; 
import { GlobalAppWrapper } from "@/components/global-app-wrapper"; 

// FONTS
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  // ⚡ FIX: Sets the base URL for social images
  metadataBase: new URL("https://bubblepops.com"),

  title: {
    default: "BubblePops Zaibatsu // Algorithmic Dominance",
    template: "%s | BubblePops Zaibatsu",
  },
  description: "Join the Inner Circle. Control the Signal. The elite Instagram growth cartel.",
  keywords: ["Instagram Growth", "Zaibatsu", "Cyberpunk", "Marketing", "BubblePops"],
  authors: [{ name: "Amber", url: "https://bubblepops.com" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bubblepops.com",
    title: "BubblePops Zaibatsu",
    description: "Join the Inner Circle. Control the Signal.",
    siteName: "BubblePops",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${orbitron.variable} ${mono.variable} font-sans bg-black text-white antialiased selection:bg-cyan-500/30 selection:text-cyan-100 overflow-x-hidden`}
      >
        {/* 1. THEME PROVIDER */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* 2. SOUND ENGINE */}
          <SoundProvider>
            {/* 3. AUTHENTICATION */}
            <AuthProvider>
              {/* 4. REALTIME (Ghost Mode) */}
              <RealtimeProvider>
                
                {/* 5. VISUAL WRAPPER */}
                <GlobalAppWrapper>
                  {children}
                </GlobalAppWrapper>

                {/* 6. TOASTS */}
                <Toaster 
                  position="bottom-right" 
                  toastOptions={{
                    style: {
                      background: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                      fontFamily: 'var(--font-mono)',
                      backdropFilter: 'blur(10px)'
                    }
                  }} 
                />

              </RealtimeProvider>
            </AuthProvider>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}