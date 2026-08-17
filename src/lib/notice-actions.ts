"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { getCurrentUser } from "./auth";
import type { Notice, NoticeKey } from "./notices";

// Same per-browser problem NoticesContext had before this file existed: an
// admin edit to a notice (e.g. "Contenido compartido con autorización") only
// ever lived in that admin's own localStorage. These actions persist it to
// the shared database instead, so every visitor sees the same text.
export async function saveNoticeOverrideAction(
  key: NoticeKey,
  patch: Partial<Notice>
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { error: "No autorizado." };
  await prisma.noticeOverride.upsert({
    where: { key },
    create: { key, patch: JSON.stringify(patch) },
    update: { patch: JSON.stringify(patch) },
  });
  revalidatePath("/");
  return {};
}

export async function resetNoticeOverrideAction(key: NoticeKey): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { error: "No autorizado." };
  await prisma.noticeOverride.delete({ where: { key } }).catch(() => {});
  revalidatePath("/");
  return {};
}
