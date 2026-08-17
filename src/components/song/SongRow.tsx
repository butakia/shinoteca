"use client";

import Link from "next/link";
import { Play, Pause, Heart } from "lucide-react";
import clsx from "clsx";
import type { Song } from "@/lib/types";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";
import CoverImage from "@/components/media/CoverImage";
import SongMenu from "./SongMenu";
import { formatDuration } from "@/lib/format";
import { useSongs } from "@/context/SongsContext";

type SongRowProps = {
  song: Song;
  index?: number;
  queue?: Song[];
  showAlbum?: boolean;
};

export default function SongRow({ song, index, queue, showAlbum = true }: SongRowProps) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getAlbumById } = useSongs();
  const isCurrent = currentSong?.id === song.id;
  const album = song.albumId ? getAlbumById(song.albumId) : undefined;

  function handlePlay() {
    if (isCurrent) togglePlay();
    else playSong(song, queue);
  }

  // Same reasoning as SongCard: tapping the title used to only navigate to
  // the song's info page, leaving playback to a separate control — now it
  // starts the song immediately too.
  function handleNavigateAndPlay() {
    if (!isCurrent) playSong(song, queue);
  }

  return (
    <div
      className={clsx(
        "group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg px-2 py-2 sm:grid-cols-[2rem_auto_1fr_auto_auto]",
        isCurrent ? "bg-accent-soft" : "hover:bg-surface-hover"
      )}
    >
      <div className="hidden w-8 items-center justify-center sm:flex">
        {index !== undefined ? (
          <>
            <span className={clsx("text-sm tabular-nums text-foreground-muted", "group-hover:hidden", isCurrent && "hidden")}>
              {index + 1}
            </span>
            <button
              type="button"
              onClick={handlePlay}
              aria-label={isCurrent && isPlaying ? "Pausar" : `Reproducir ${song.title}`}
              className={clsx("hidden text-foreground group-hover:block", isCurrent && "block")}
            >
              {isCurrent && isPlaying ? (
                <Pause className="h-4 w-4" fill="currentColor" strokeWidth={0} />
              ) : (
                <Play className="h-4 w-4" fill="currentColor" strokeWidth={0} />
              )}
            </button>
          </>
        ) : (
          <button type="button" onClick={handlePlay} aria-label="Reproducir">
            {isCurrent && isPlaying ? (
              <Pause className="h-4 w-4" fill="currentColor" strokeWidth={0} />
            ) : (
              <Play className="h-4 w-4" fill="currentColor" strokeWidth={0} />
            )}
          </button>
        )}
      </div>

      <button type="button" onClick={handlePlay} className="h-10 w-10 shrink-0 sm:h-11 sm:w-11">
        <CoverImage src={song.coverUrl} title={song.title} size="xs" />
      </button>

      <Link href={`/canciones/${song.id}`} onClick={handleNavigateAndPlay} className="min-w-0">
        <p className={clsx("truncate text-sm", isCurrent ? "text-white" : "text-foreground")}>{song.title}</p>
        <p className="truncate text-xs text-foreground-muted">{song.alias ?? song.artist}</p>
      </Link>

      {showAlbum && (
        <Link
          href={album ? `/albumes/${album.id}` : "#"}
          className="hidden truncate text-xs text-foreground-muted hover:text-foreground sm:block"
        >
          {album?.title ?? "—"}
        </Link>
      )}

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => toggleFavorite(song.id)}
          aria-pressed={isFavorite(song.id)}
          aria-label="Favorito"
          className={clsx(
            "rounded-full p-1.5 opacity-0 transition-opacity group-hover:opacity-100",
            isFavorite(song.id) && "opacity-100 text-accent"
          )}
        >
          <Heart className="h-3.5 w-3.5" fill={isFavorite(song.id) ? "currentColor" : "none"} />
        </button>
        <span className="w-9 text-right text-xs tabular-nums text-foreground-muted">
          {formatDuration(song.duration)}
        </span>
        <SongMenu song={song} />
      </div>
    </div>
  );
}
