import { NextRequest, NextResponse } from "next/server";
import { getInstagramAuthUrl } from "@/lib/instagram";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ error: "User ID required for handshake." }, { status: 400 });
  }

  const url = getInstagramAuthUrl(uid);
  return NextResponse.redirect(url);
}