import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// ⚡ PRODUCTION CSP:
// 1. Removed strict blob restrictions
// 2. Added explicit 'unsafe-none' for opener policy
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://apis.google.com https://accounts.google.com https://www.googletagmanager.com https://va.vercel-scripts.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.googleusercontent.com https://*.githubusercontent.com https://images.unsplash.com https://cdn.discordapp.com https://cdn.simpleicons.org https://media.giphy.com https://raw.githack.com https://raw.githubusercontent.com;
    font-src 'self' data: https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://content.googleapis.com;
    upgrade-insecure-requests;
    worker-src 'self' blob:;
    connect-src 'self' https://*.googleapis.com https://*.firebase.com https://*.firebaseio.com https://*.sentry.io https://accounts.google.com https://www.google-analytics.com https://*.google-analytics.com https://api.lanyard.rest wss://api.lanyard.rest https://raw.githack.com https://raw.githubusercontent.com;
`;

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "date-fns",
      "lodash",
      "canvas-confetti",
      "gsap",
      "cobe",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "cdn.simpleicons.org" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "graph.instagram.com" },
      { protocol: "https", hostname: "scontent.cdninstagram.com" },
      { protocol: "https", hostname: "media.giphy.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), browsing-topics=()" },
          
          // ⚡ CRITICAL FIX FOR LIVE DEPLOYMENT ⚡
          // We set this to 'unsafe-none' to stop the browser from blocking the Google Popup interaction.
          { key: "Cross-Origin-Opener-Policy", value: "unsafe-none" },
          
          { key: "Content-Security-Policy", value: cspHeader.replace(/\s{2,}/g, " ").trim() },
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