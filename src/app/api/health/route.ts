/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse, type NextRequest } from "next/server";

// 1. REMOVE: export const dynamic = "force-dynamic";
// This config is incompatible with cacheComponents.

// 2. UPDATE: Accept 'request' to opt-out of static optimization
export async function GET(request: NextRequest) {
  // 3. USAGE: Access the dynamic request data (searchParams).
  // This ensures Next.js treats this route as dynamic/per-request.
  // We use the variable (log or assignment) to satisfy linters.
  const _clientTimestamp = request.nextUrl.searchParams.get("t");

  return NextResponse.json(
    { status: "ok", timestamp: new Date().toISOString() },
    { status: 200 },
  );
}
