import { NextResponse } from "next/server";

export async function GET() {
  // Simple check to ensure the server is responsive
  // You can extend this to check DB connections in the future
  return NextResponse.json(
    { status: "ok", timestamp: new Date().toISOString() },
    { status: 200 }
  );
}
