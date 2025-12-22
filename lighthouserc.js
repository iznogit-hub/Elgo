module.exports = {
  ci: {
    collect: {
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
