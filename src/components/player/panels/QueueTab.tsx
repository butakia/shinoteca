"use client";

import { useState } from "react";
import { X, GripVertical, Trash2, ListPlus, ListMusic } from "lucide-react";
import clsx from "clsx";
import { usePlayer } from "@/context/PlayerContext";
import { usePlaylists } from "@/context/PlaylistsContext";
import CoverImage from "@/components/media/CoverImage";
import SongMenu from "@/components/song/SongMenu";
import { formatDuration } from "@/lib/format";

export default function QueueTab() {
  const { queue, currentSong, playQueueAt, removeFromQueue, reorderQueue, clearQueue, autoplay, setAutoplay } =
    usePlayer();
  const { createPlaylist } = usePlaylists();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  function handleSaveAsPlaylist() {
    if (queue.length === 0) return;
    createPlaylist(`Cola guardada ${new Date().toLocaleDateString("es")}`, queue.map((s) => s.id));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5">
        <label className="flex min-w-0 items-center gap-2.5 text-xs font-medium text-foreground-muted">
          <button
            type="button"
            role="switch"
            aria-label="Reproducción automática"
            aria-checked={autoplay}
            onClick={() => setAutoplay(!autoplay)}
            className={clsx(
              "relative h-7 w-12 shrink-0 rounded-full border shadow-inner transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              autoplay ? "border-accent bg-accent shadow-[0_0_14px_rgba(239,35,60,0.28)]" : "border-white/20 bg-white/10"
            )}
          >
            <span
              className={clsx(
                "absolute left-0.5 top-0.5 h-5.5 w-5.5 rounded-full bg-white shadow-md transition-transform duration-200",
                autoplay ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
          <span className="truncate">Reproducción automática</span>
        </label>
        <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={handleSaveAsPlaylist}
          aria-label="Guardar cola como playlist"
          disabled={queue.length === 0}
          className="rounded-full p-1.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground disabled:opacity-30"
          title="Guardar cola como playlist"
        >
          <ListPlus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={clearQueue}
          aria-label="Vaciar cola"
          disabled={queue.length === 0}
          className="rounded-full p-1.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground disabled:opacity-30"
          title="Vaciar cola"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        </div>
      </div>

      {savedNotice && (
        <div className="mx-3 mt-3 rounded-lg bg-success/15 px-3 py-2 text-xs text-success">
          Cola guardada como nueva playlist.
        </div>
      )}

      {queue.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
          <ListMusic className="h-8 w-8 text-foreground-muted/50" />
          <p className="text-sm text-foreground-muted">La cola está vacía.</p>
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto px-2 py-2">
          {queue.map((song, index) => {
            const isCurrent = song.id === currentSong?.id;
            return (
              <li
                key={song.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null && dragIndex !== index) reorderQueue(dragIndex, index);
                  setDragIndex(null);
                }}
                className={clsx(
                  "group flex items-center gap-2 rounded-lg px-2 py-2",
                  isCurrent ? "bg-accent-soft" : "hover:bg-surface-hover"
                )}
              >
                <span className="cursor-grab text-foreground-muted/50 active:cursor-grabbing">
                  <GripVertical className="h-4 w-4" />
                </span>
                <button
                  type="button"
                  onClick={() => playQueueAt(queue, index)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <div className="h-9 w-9 shrink-0">
                    <CoverImage src={song.coverUrl} title={song.title} size="xs" />
                  </div>
                  <div className="min-w-0">
                    <p className={clsx("truncate text-sm", isCurrent ? "text-white" : "text-foreground")}>
                      {song.title}
                    </p>
                    <p className="truncate text-xs text-foreground-muted">{song.alias ?? song.artist}</p>
                  </div>
                </button>
                <span className="shrink-0 text-[11px] tabular-nums text-foreground-muted">
                  {formatDuration(song.duration)}
                </span>
                <SongMenu song={song} className="shrink-0 opacity-0 group-hover:opacity-100" />
                <button
                  type="button"
                  onClick={() => removeFromQueue(song.id)}
                  aria-label={`Quitar ${song.title} de la cola`}
                  className="shrink-0 rounded-full p-1 text-foreground-muted opacity-0 hover:text-foreground group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
