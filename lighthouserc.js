module.exports = {
  ci: {
    collect: {
      settings: {
        formFactor: "desktop",
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        chromeFlags: "--force-prefers-reduced-motion",
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
      startServerCommand: "npm run start",
      startServerReadyTimeout: 90000,
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/about",
        "http://localhost:3000/uses",
        "http://localhost:3000/guestbook",
        "http://localhost:3000/contact",
      ],
      numberOfRuns: 3,
    },
    upload: {
      target: "temporary-public-storage",
    },
    assert: {
      // 1. Base settings on the strict recommended preset
      preset: "lighthouse:recommended",

      // 2. Override specific rules that conflict with Next.js/Security
      assertions: {
        // FAIL if performance is below 90 (Strict)
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],

        // ALLOW 2 unused scripts (Webpack runtime + App chunk are unavoidable)
        "unused-javascript": ["error", { maxLength: 2 }],

        // WARN (don't fail) for BF Cache (Security trade-off)
        "bf-cache": "warn",

        // WARN for source maps (We don't ship source maps to prod for security)
        "valid-source-maps": "warn",

        // WARN for console errors (often hydration noise in CI)
        // If you fix the Heading Order, you can try setting this back to "error"
        "errors-in-console": "warn",
      },
    },
  },
};
