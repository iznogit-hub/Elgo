// src/sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://1d927523e7a78cfd434339ed1b35883a@o1032877.ingest.us.sentry.io/4510457780633600",

  // Adjust in production
  tracesSampleRate: 1.0,

  // Debugging
  debug: false,
  enableLogs: true,
  sendDefaultPii: true,
});