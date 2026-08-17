import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as { email?: string; password?: string };
  const normalizedEmail = email?.trim().toLowerCase() ?? "";

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  // Same generic error whether the email is unknown or the password is wrong,
  // so a login attempt can't be used to enumerate registered emails.
  const genericError = NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
  if (!user) return genericError;

  const valid = await verifyPassword(password ?? "", user.passwordHash);
  if (!valid) return genericError;

  await createSession(user.id);

  return NextResponse.json({
    user: { id: user.id, email: user.email, displayName: user.displayName, isAdmin: user.isAdmin },
  });
}
