"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";
// Note: We cannot use the server logger here because this is a Client Component.
// However, Sentry covers the client-side logging well enough.

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error("Global Error Caught:", error); // Keep console.error for client-side debugging
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
