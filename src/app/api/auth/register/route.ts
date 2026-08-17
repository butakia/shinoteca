import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const { email, password, displayName } = (await req.json()) as {
    email?: string;
    password?: string;
    displayName?: string;
  };

  const normalizedEmail = email?.trim().toLowerCase() ?? "";
  const name = displayName?.trim() || normalizedEmail.split("@")[0] || "Usuario";

  if (!EMAIL_RE.test(normalizedEmail)) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese correo." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  // Bootstrap: nobody can approve uploads or reach /admin until an admin
  // exists, and there's no seed script for a fresh deploy — so the very
  // first account created becomes admin automatically. Every account after
  // that registers as a regular (non-admin) user.
  const hasAdmin = await prisma.user.count({ where: { isAdmin: true } });
  const user = await prisma.user.create({
    data: { email: normalizedEmail, passwordHash, displayName: name, isAdmin: hasAdmin === 0 },
  });

  await createSession(user.id);

  return NextResponse.json({
    user: { id: user.id, email: user.email, displayName: user.displayName, isAdmin: user.isAdmin },
  });
}
