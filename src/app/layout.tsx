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

// --- FONTS ---
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  display: "swap",
});

const orbitron = Orbitron({ 
  subsets: ["latin"], 
  variable: "--font-orbitron",
  display: "swap",
});

const mono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono",
  display: "swap",
});

// --- METADATA ---
export const metadata: Metadata = {
  metadataBase: new URL("https://bubblepops.com"),
  title: {
    default: "BubblePops // High-Frequency Growth",
    template: "%s | BubblePops",
  },
  description: "The algorithmic growth cartel. Join the inner circle.",
  keywords: ["Instagram Growth", "Zaibatsu", "Cyberpunk", "Marketing", "BubblePops"],
  authors: [{ name: "High Command", url: "https://bubblepops.com" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bubblepops.com",
    title: "BubblePops Zaibatsu",
    description: "Join the Inner Circle. Control the Signal.",
    siteName: "BubblePops",
  },
  icons: {
    icon: "/favicon.ico",
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
        className={`${inter.variable} ${orbitron.variable} ${mono.variable} font-sans bg-black text-white antialiased selection:bg-cyan-500/30 selection:text-cyan-100 overflow-x-hidden min-h-screen`}
      >
        {/* 1. THEME ENGINE */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* 2. AUDIO ENGINE */}
          <SoundProvider>
            
            {/* 3. IDENTITY LAYER (This enables the iznoatwork check) */}
            <AuthProvider>
              
              {/* 4. REALTIME SOCKETS (Ghost Mode) */}
              <RealtimeProvider>
                
                {/* 5. VISUAL FX WRAPPER (Scanlines, CRT, etc) */}
                <GlobalAppWrapper>
                  {children}
                </GlobalAppWrapper>

                {/* 6. SYSTEM NOTIFICATIONS */}
                <Toaster 
                  position="bottom-right" 
                  toastOptions={{
                    style: {
                      background: 'rgba(5, 5, 5, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '4px'
                    },
                    className: "font-mono"
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