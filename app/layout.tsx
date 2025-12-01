import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SoundProvider } from "@/components/sound-provider";
import { GlobalAppWrapper } from "@/components/global-app-wrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "t7sen | Portfolio",
  description: "Something amazing is being built.",
  openGraph: {
    title: "t7sen | Portfolio",
    description: "Something amazing is being built.",
    url: "https://t7sen.com",
    siteName: "t7sen",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SoundProvider>
            
            {/* WRAPPER: Now contains all overlays (Cursor, Preloader, Navbar, Analytics) */}
            <GlobalAppWrapper>
                {children}
            </GlobalAppWrapper>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
