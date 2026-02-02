import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: false, // Keeps auth logic simple

  images: {
    domains: [
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "bee-popper.vercel.app",
    ],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // 1. Unblock the Google Popup
          { key: "Cross-Origin-Opener-Policy", value: "unsafe-none" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
          
          // 2. Unblock the Database (The "Offline" Fix)
          // We explicitly allow the Google API domains Firestore uses.
          { 
            key: "Content-Security-Policy", 
            value: `
              default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
              script-src * 'unsafe-inline' 'unsafe-eval' blob:;
              connect-src * 'unsafe-inline' https://*.googleapis.com https://*.firebase.com https://*.firebaseio.com wss://*.firebaseio.com;
              img-src * 'unsafe-inline' data: blob:;
              frame-src * 'unsafe-inline' data: blob:;
              style-src * 'unsafe-inline';
            `.replace(/\s{2,}/g, " ").trim() 
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