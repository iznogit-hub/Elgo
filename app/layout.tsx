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
  metadataBase: new URL("https://t7sen.com"),
  title: {
    default: "T7SEN | Software Architect",
    template: "%s | T7SEN",
  },
  description:
    "Software Architect and Developer specializing in high-performance web applications, scalable systems, and immersive digital experiences.",
  keywords: [
    "Software Architect",
    "Full Stack Developer",
    "Next.js",
    "React",
    "TypeScript",
    "Portfolio",
    "Cyberpunk Design",
  ],
  authors: [{ name: "T7SEN", url: "https://t7sen.com" }],
  creator: "T7SEN",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://t7sen.com",
    title: "T7SEN | Software Architect",
    description:
      "Crafting digital reality through code. Specialized in high-performance web graphics and scalable architecture.",
    siteName: "T7SEN Portfolio",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "T7SEN Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "T7SEN | Software Architect",
    description:
      "Crafting digital reality through code. Specialized in high-performance web graphics and scalable architecture.",
    images: ["/opengraph-image"],
    creator: "@T7SEN", // Replace with your actual handle if different
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
            <GlobalAppWrapper>{children}</GlobalAppWrapper>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
