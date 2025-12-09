"use client";

import { useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function AuthPopupLogic() {
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider");

  useEffect(() => {
    if (!provider) return;

    // Trigger the Auth.js flow immediately
    // callbackUrl points to our success page which handles the closing
    signIn(provider, {
      callbackUrl: "/auth/success",
    });
  }, [provider]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-mono">
          Connecting to {provider}...
        </p>
      </div>
    </div>
  );
}

export default function AuthPopupPage() {
  return (
    <Suspense>
      <AuthPopupLogic />
    </Suspense>
  );
}
