// src/instrumentation-client.ts
// This file configures the initialization of Sentry on the client.

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://1d927523e7a78cfd434339ed1b35883a@o1032877.ingest.us.sentry.io/4510457780633600",

  integrations: [
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      // ZAIBATSU VISUAL PROTOCOLS
      colorScheme: "dark", 
      triggerLabel: "REPORT_ANOMALY", // The Button
      formTitle: "ZAIBATSU_DEBUG_LOG", // The Modal Header
      submitBtnLabel: "TRANSMIT_LOG", // The Action
      messagePlaceholder: "Describe the signal interruption...", // The Input
      
      // Auto-inject the floating button (Bottom Right)
      autoInject: true,
      isEmailRequired: true,
    }),
    // Log console outputs to Sentry for debugging user actions
    Sentry.consoleLoggingIntegration({ levels: ["error", "warn"] }),
  ],

  // Sampling: 100% in Dev, lower this in Prod to save quota
  tracesSampleRate: 1.0, 

  // Replays: Watch the user's session when they crash
  replaysSessionSampleRate: 0.1, // Record 10% of all sessions
  replaysOnErrorSampleRate: 1.0, // Record 100% of sessions with errors

  enableLogs: true,
  sendDefaultPii: true, // Needed to track User ID vs Crash
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;