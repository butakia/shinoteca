import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Serves the server-side patches/deletions for STATIC catalog songs (edited
// or removed from the admin panel) to every visitor. Without this, an
// admin's edit only ever showed up in their own browser's localStorage.
export async function GET() {
  try {
    const [overrides, deleted] = await Promise.all([
      prisma.songOverride.findMany(),
      prisma.deletedSong.findMany({ select: { songId: true } }),
    ]);

    const overridesMap = Object.fromEntries(
      overrides.map((row) => [row.songId, JSON.parse(row.patch)])
    );

    return NextResponse.json({
      overrides: overridesMap,
      deletedIds: deleted.map((row) => row.songId),
    });
  } catch (err) {
    console.error("song-overrides query failed — is the database configured?", err);
    return NextResponse.json({ overrides: {}, deletedIds: [] });
  }
}
