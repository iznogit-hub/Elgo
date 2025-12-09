"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthSuccessPage() {
  useEffect(() => {
    // 1. Notify the main window
    if (window.opener) {
      window.opener.postMessage(
        { type: "AUTH_SUCCESS" },
        window.location.origin
      );
    }

    // 2. Close this popup
    window.close();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <p className="text-sm text-muted-foreground font-mono">
          Authenticated. Closing...
        </p>
      </div>
    </div>
  );
}
