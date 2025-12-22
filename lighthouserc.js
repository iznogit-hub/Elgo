module.exports = {
  ci: {
    collect: {
      settings: {
        // CI runners are slow.
        // We can simulate a desktop device to get more realistic "Performance" scores
        // if your site is responsive.
        formFactor: "desktop",
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        // Don't throttle the CPU as much (CI is already slow)
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
      // 1. Start the Next.js production server
      startServerCommand: "npm run start",
      // 2. Wait up to 90s for the server to start (avoid timeouts)
      startServerReadyTimeout: 90000,
      // 3. The list of URLs to audit
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/about",
        "http://localhost:3000/uses",
        "http://localhost:3000/guestbook",
        "http://localhost:3000/contact",
        // Add '/dashboard' only if you mock auth, otherwise it redirects
      ],
      // 4. Run each page 3 times to average out noise
      numberOfRuns: 3,
    },
    upload: {
      // Uploads report to a temporary public URL for easy viewing
      target: "temporary-public-storage",
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        // 5. Fail the build if scores are too low
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
      },
    },
  },
};
