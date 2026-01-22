import { NextRequest, NextResponse } from "next/server";
import { getLongLivedToken } from "@/lib/instagram";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const uid = searchParams.get("state"); // User ID passed from the login route
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 1. Handle Meta Errors (User clicked "Cancel")
  if (error || errorReason) {
    console.error("Instagram Auth Error:", error, errorReason);
    return NextResponse.redirect(`${appUrl}/profile?error=access_denied`);
  }

  // 2. Validate Response
  if (!code || !uid) {
    return NextResponse.redirect(`${appUrl}/profile?error=invalid_response`);
  }

  try {
    // 3. Exchange Code for Long-Lived Token (Server-Side)
    const accessToken = await getLongLivedToken(code);

    // 4. "The Loophole Strategy"
    // Instead of fighting Firebase Admin SDK right now, we pass the token
    // back to the client via URL fragment. The client (profile/page.tsx) 
    // detects this, saves it to Firestore, and clears the URL.
    return NextResponse.redirect(`${appUrl}/counsil?token=${accessToken}&action=save_token`);

  } catch (err: any) {
    console.error("Token Exchange Failed:", err.message);
    return NextResponse.redirect(`${appUrl}/profile?error=token_exchange_failed`);
  }
}