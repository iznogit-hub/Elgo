import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // 1. Disable Strict Mode to prevent double-firing auth in dev
  reactStrictMode: false,

  // 2. Allow ALL image domains (Fixes image loading errors)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  // 3. NUCLEAR SECURITY HEADERS
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // A. Fixes "window.closed" error by disabling isolation
          { key: "Cross-Origin-Opener-Policy", value: "unsafe-none" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
          
          // B. Fixes "Client is offline" by allowing ALL connections
          // We set default-src to * (wildcard) to allow everything.
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