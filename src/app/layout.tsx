"use client";

import { Orbitron, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

// --- PROVIDERS ---
import { AuthProvider } from "@/lib/context/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { SoundProvider } from "@/components/sound-provider";
import { RealtimeProvider } from "@/providers/realtime-provider"; 
import { GlobalAppWrapper } from "@/components/global-app-wrapper"; 

// --- GLOBAL UI ---
import { Cursor } from "@/components/ui/cursor"; 

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${orbitron.variable} ${mono.variable} font-sans bg-black text-white antialiased selection:bg-red-900 selection:text-white overflow-x-hidden min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SoundProvider>
            <AuthProvider>
              <RealtimeProvider>
                
                {/* 🔴 TACTICAL OVERLAY: Desktop Only */}
                <div className="hidden lg:block pointer-events-none z-[9999] fixed inset-0">
                  <Cursor />
                </div>

                {/* 🔴 CORE ARCHITECTURE */}
                <GlobalAppWrapper>
                  {children}
                </GlobalAppWrapper>

                {/* 🔴 INDUSTRIAL NOTIFICATIONS */}
                <Toaster 
                  position="bottom-right" 
                  toastOptions={{
                    style: {
                      background: 'rgba(5, 0, 0, 0.95)',
                      border: '1px solid rgba(220,38,38,0.2)', // Red border
                      color: 'white',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      backdropFilter: 'blur(12px)',
                      borderRadius: '0px', 
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