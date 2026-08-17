import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ songId: string }> }) {
  const { songId } = await params;
  const row = await prisma.songLike.findUnique({ where: { songId } });
  return NextResponse.json({ count: row?.count ?? 0 });
}

export async function POST(req: Request, { params }: { params: Promise<{ songId: string }> }) {
  const { songId } = await params;
  const { delta } = (await req.json()) as { delta: number };
  const clampedDelta = delta >= 0 ? 1 : -1;

  const existing = await prisma.songLike.findUnique({ where: { songId } });
  const nextCount = Math.max(0, (existing?.count ?? 0) + clampedDelta);

  const row = await prisma.songLike.upsert({
    where: { songId },
    create: { songId, count: nextCount },
    update: { count: nextCount },
  });

  return NextResponse.json({ count: row.count });
}
