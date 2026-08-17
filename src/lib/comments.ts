import { readStorage, writeStorage } from "@/lib/storage";

export type Comment = {
  id: string;
  songId: string;
  author: string;
  text: string;
  createdAt: string;
  reported: boolean;
  mine: boolean;
};

function key(songId: string) {
  return `shinoflow:comments:${songId}`;
}

const MAX_COMMENT_LENGTH = 500;

// Minimal sanitization for defense in depth — React already escapes text on
// render, this just strips characters that have no place in a plain comment.
export function sanitizeText(input: string): string {
  return input.replace(/[<>]/g, "").trim().slice(0, MAX_COMMENT_LENGTH);
}

export function getComments(songId: string): Comment[] {
  return readStorage<Comment[]>(key(songId), []);
}

export function addComment(songId: string, author: string, text: string): Comment | null {
  const cleanText = sanitizeText(text);
  const cleanAuthor = sanitizeText(author) || "Anónimo";
  if (!cleanText) return null;
  const comment: Comment = {
    id: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    songId,
    author: cleanAuthor,
    text: cleanText,
    createdAt: new Date().toISOString(),
    reported: false,
    mine: true,
  };
  const existing = getComments(songId);
  writeStorage(key(songId), [...existing, comment]);
  return comment;
}

export function deleteComment(songId: string, commentId: string) {
  const existing = getComments(songId);
  writeStorage(key(songId), existing.filter((c) => c.id !== commentId));
}

export function reportComment(songId: string, commentId: string) {
  const existing = getComments(songId);
  writeStorage(
    key(songId),
    existing.map((c) => (c.id === commentId ? { ...c, reported: true } : c))
  );
}
