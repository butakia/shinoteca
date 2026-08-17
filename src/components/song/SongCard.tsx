"use client";

import Link from "next/link";
import { Play, Pause } from "lucide-react";
import clsx from "clsx";
import type { Song } from "@/lib/types";
import { usePlayer } from "@/context/PlayerContext";
import CoverImage from "@/components/media/CoverImage";
import SongMenu from "./SongMenu";

export default function SongCard({ song, queue }: { song: Song; queue?: Song[] }) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const isCurrent = currentSong?.id === song.id;

  function handlePlay() {
    if (isCurrent) togglePlay();
    else playSong(song, queue);
  }

  // Navigating to the song's info page and starting playback used to require
  // two separate clicks (the cover only linked, a hover-only button played) —
  // on touch devices the hover button was effectively unreachable, so tapping
  // a song did nothing but show its info page. Clicking the cover/title now
  // does both at once, like every other music app.
  function handleNavigateAndPlay() {
    if (!isCurrent) playSong(song, queue);
  }

  return (
    <div className="group relative w-full">
      <div className="relative">
        <Link href={`/canciones/${song.id}`} onClick={handleNavigateAndPlay} className="block">
          <CoverImage src={song.coverUrl} title={song.title} size="medium" className="shadow-lg" />
        </Link>
        <button
          type="button"
          onClick={handlePlay}
          aria-label={isCurrent && isPlaying ? "Pausar" : `Reproducir ${song.title}`}
          className={clsx(
            "absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-all",
            "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100",
            isCurrent && "translate-y-0 opacity-100"
          )}
        >
          {isCurrent && isPlaying ? (
            <Pause className="h-4 w-4" fill="currentColor" strokeWidth={0} />
          ) : (
            <Play className="ml-0.5 h-4 w-4" fill="currentColor" strokeWidth={0} />
          )}
        </button>
      </div>
      <div className="mt-2 flex items-start justify-between gap-1">
        <Link href={`/canciones/${song.id}`} onClick={handleNavigateAndPlay} className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{song.title}</p>
          <p className="truncate text-xs text-foreground-muted">{song.alias ?? song.artist}</p>
        </Link>
        <SongMenu song={song} className="mt-0.5 opacity-0 group-hover:opacity-100" />
      </div>
    </div>
  );
}
