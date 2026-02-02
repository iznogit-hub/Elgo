import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // 1. Disable Strict Mode (Reduces double-firing in auth)
  reactStrictMode: false,

  // 2. Allow all standard image domains (Fixes your 400 Image Error)
  images: {
    domains: [
      "lh3.googleusercontent.com", 
      "avatars.githubusercontent.com",
      "bee-popper.vercel.app" // Allow your own domain
    ],
    remotePatterns: [
      { protocol: "https", hostname: "**" }, // Allow ALL external images for now
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // ⚡ THE FIX: Force the browser to allow the Google Popup to communicate
          { key: "Cross-Origin-Opener-Policy", value: "unsafe-none" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
          
          // ⚡ OPEN CSP: We are removing restrictions to fix the "Offline" error
          { 
            key: "Content-Security-Policy", 
            value: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;" 
          },
        ],
      },
    ];
  },
};

export default bundleAnalyzer(
  withSentryConfig(nextConfig, {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring",
  })
);