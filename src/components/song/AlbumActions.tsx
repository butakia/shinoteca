"use client";

import { Play, Shuffle, ListPlus, Heart } from "lucide-react";
import clsx from "clsx";
import type { Song } from "@/lib/types";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";

export default function AlbumActions({ songs }: { songs: Song[] }) {
  const { playQueueAt, addToQueue } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();

  const allFavorite = songs.length > 0 && songs.every((s) => isFavorite(s.id));

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => playQueueAt(songs, 0)}
        disabled={songs.length === 0}
        className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:bg-accent/90 active:scale-95 disabled:opacity-40"
      >
        <Play className="h-4 w-4" fill="currentColor" strokeWidth={0} /> Reproducir todo
      </button>
      <button
        type="button"
        onClick={() => {
          const shuffled = [...songs].sort(() => Math.random() - 0.5);
          playQueueAt(shuffled, 0);
        }}
        disabled={songs.length === 0}
        className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-40"
      >
        <Shuffle className="h-4 w-4" /> Aleatorio
      </button>
      <button
        type="button"
        onClick={() => songs.forEach(addToQueue)}
        disabled={songs.length === 0}
        className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-40"
      >
        <ListPlus className="h-4 w-4" /> Añadir a la cola
      </button>
      <button
        type="button"
        onClick={() => songs.forEach((s) => { if (isFavorite(s.id) !== !allFavorite) toggleFavorite(s.id); })}
        disabled={songs.length === 0}
        className={clsx(
          "flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-hover disabled:opacity-40",
          allFavorite ? "text-accent" : "text-foreground"
        )}
      >
        <Heart className="h-4 w-4" fill={allFavorite ? "currentColor" : "none"} /> Guardar álbum
      </button>
    </div>
  );
}
