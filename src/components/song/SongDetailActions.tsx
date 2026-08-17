"use client";

import { Play, Pause, Heart, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import clsx from "clsx";
import type { Song } from "@/lib/types";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";

export default function SongDetailActions({ song }: { song: Song }) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { isFavorite, toggleFavorite, getReaction, setReaction } = useFavorites();
  const isCurrent = currentSong?.id === song.id;
  const favorite = isFavorite(song.id);
  const reaction = getReaction(song.id);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => (isCurrent ? togglePlay() : playSong(song))}
        className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:bg-accent/90 active:scale-95"
      >
        {isCurrent && isPlaying ? (
          <Pause className="h-4 w-4" fill="currentColor" strokeWidth={0} />
        ) : (
          <Play className="h-4 w-4" fill="currentColor" strokeWidth={0} />
        )}
        {isCurrent && isPlaying ? "Pausar" : "Reproducir"}
      </button>
      <button
        type="button"
        onClick={() => toggleFavorite(song.id)}
        aria-pressed={favorite}
        className={clsx(
          "flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-hover",
          favorite ? "text-accent" : "text-foreground"
        )}
      >
        <Heart className="h-4 w-4" fill={favorite ? "currentColor" : "none"} /> Favorito
      </button>
      <button
        type="button"
        onClick={() => setReaction(song.id, "like")}
        aria-pressed={reaction === "like"}
        className={clsx(
          "rounded-full border border-border p-2.5 transition-colors hover:bg-surface-hover",
          reaction === "like" ? "text-success" : "text-foreground-muted"
        )}
      >
        <ThumbsUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setReaction(song.id, "dislike")}
        aria-pressed={reaction === "dislike"}
        className={clsx(
          "rounded-full border border-border p-2.5 transition-colors hover:bg-surface-hover",
          reaction === "dislike" ? "text-danger" : "text-foreground-muted"
        )}
      >
        <ThumbsDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(window.location.href).catch(() => {})}
        className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
      >
        <Share2 className="h-4 w-4" /> Copiar enlace
      </button>
    </div>
  );
}
