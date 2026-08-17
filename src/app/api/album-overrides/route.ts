import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Serves album cover/title edits and admin-created albums to every visitor.
// See album-actions.ts for the write side and why this exists.
export async function GET() {
  try {
    const rows = await prisma.albumOverride.findMany();
    const overrides = Object.fromEntries(
      rows.filter((row) => !row.isCustom).map((row) => [row.albumId, JSON.parse(row.patch)])
    );
    const customAlbums = rows.filter((row) => row.isCustom).map((row) => JSON.parse(row.patch));
    return NextResponse.json({ overrides, customAlbums });
  } catch (err) {
    console.error("album-overrides query failed — is the database configured?", err);
    return NextResponse.json({ overrides: {}, customAlbums: [] });
  }
}
