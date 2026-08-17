import { NextResponse } from "next/server";
import { getUploadedSongs } from "@/lib/uploaded-songs";

export async function GET() {
  const songs = await getUploadedSongs();
  return NextResponse.json({ songs });
}
