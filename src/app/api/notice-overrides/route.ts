import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Serves admin edits to notices/disclaimers to every visitor — see
// notice-actions.ts for why this exists (localStorage-only was per-browser).
export async function GET() {
  try {
    const rows = await prisma.noticeOverride.findMany();
    const overrides = Object.fromEntries(rows.map((row) => [row.key, JSON.parse(row.patch)]));
    return NextResponse.json({ overrides });
  } catch (err) {
    console.error("notice-overrides query failed — is the database configured?", err);
    return NextResponse.json({ overrides: {} });
  }
}
