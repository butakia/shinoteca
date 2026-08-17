"use client";

import { useState } from "react";
import { Flag, Trash2, MessageSquareOff } from "lucide-react";
import { getComments, addComment, deleteComment, reportComment, type Comment } from "@/lib/comments";
import { useNotices } from "@/context/NoticesContext";

export default function CommentsSection({ songId, enabled }: { songId: string; enabled: boolean }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [reportedIds, setReportedIds] = useState<string[]>([]);

  // Load comments for this song during render when songId/enabled changes,
  // instead of in an effect (React's documented pattern for resetting state
  // when a prop changes — avoids an extra commit).
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  if (enabled && loadedFor !== songId) {
    setLoadedFor(songId);
    setComments(getComments(songId));
  }

  const { getNoticeText } = useNotices();

  if (!enabled) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-6 text-sm text-foreground-muted">
        <MessageSquareOff className="h-4 w-4" />
        {getNoticeText("comments") ?? "Los comentarios están desactivados para esta canción."}
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const created = addComment(songId, name, text);
    if (created) {
      setComments(getComments(songId));
      setText("");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre (opcional)"
          maxLength={60}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/60 outline-none focus:border-accent/50"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario…"
          maxLength={500}
          rows={3}
          required
          className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/60 outline-none focus:border-accent/50"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/90"
        >
          Publicar comentario
        </button>
      </form>

      {comments.length === 0 ? (
        <p className="text-sm text-foreground-muted">Sé el primero en comentar.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-xl border border-border bg-surface/50 p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{comment.author}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-foreground-muted">
                    {new Date(comment.createdAt).toLocaleDateString("es")}
                  </span>
                  {comment.mine && (
                    <button
                      type="button"
                      onClick={() => {
                        deleteComment(songId, comment.id);
                        setComments(getComments(songId));
                      }}
                      aria-label="Eliminar comentario"
                      className="text-foreground-muted hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {!comment.mine && (
                    <button
                      type="button"
                      disabled={reportedIds.includes(comment.id) || comment.reported}
                      onClick={() => {
                        reportComment(songId, comment.id);
                        setReportedIds((prev) => [...prev, comment.id]);
                      }}
                      aria-label="Reportar comentario"
                      className="text-foreground-muted hover:text-danger disabled:opacity-40"
                    >
                      <Flag className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-foreground-muted">{comment.text}</p>
              {(comment.reported || reportedIds.includes(comment.id)) && (
                <p className="mt-1 text-[11px] text-danger">Reportado para revisión</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
