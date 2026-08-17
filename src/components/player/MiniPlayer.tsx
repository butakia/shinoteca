"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Heart, ListMusic, ChevronUp, AlertTriangle, ListPlus } from "lucide-react";
import clsx from "clsx";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";
import CoverImage from "@/components/media/CoverImage";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";
import VolumeControl from "./VolumeControl";
import AmbientBackground from "./AmbientBackground";
import { getAlbumById } from "@/lib/data";
import PlaylistPickerModal from "@/components/song/PlaylistPickerModal";

export default function MiniPlayer() {
  const { currentSong, position, duration, seek, error, setExpanded, next, previous } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const pathname = usePathname();
  const touchStartY = useRef<number | null>(null);
  const coverTouch = useRef<{ x: number; y: number } | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  // Publish this bar's *real* height as --player-height so PlayerSpacer
  // reserves exactly the right amount of scroll room. It used to be a
  // hardcoded 96px, which silently stopped matching once the mini player
  // grew (bigger cover + its own progress row on mobile) — the last rows of
  // every page then sat underneath the bar. Measuring keeps the two in sync
  // no matter how this component is restyled later.
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const apply = () => {
      document.documentElement.style.setProperty("--player-height", `${Math.ceil(el.getBoundingClientRect().height)}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--player-height");
    };
  }, [currentSong?.id, error]);

  // Swipe-up-to-expand, like every mainstream mobile music player (YouTube
  // Music included) — the chevron button remains for anyone who taps instead
  // of dragging. Only measures a vertical delta on release, so it never
  // fights with an ordinary tap on the cover/controls.
  function onTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0]?.clientY ?? null;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartY.current === null) return;
    const endY = e.changedTouches[0]?.clientY ?? touchStartY.current;
    const deltaY = touchStartY.current - endY;
    touchStartY.current = null;
    if (deltaY > 40) setExpanded(true);
  }

  // Left/right swipe on the cover specifically skips tracks — separate from
  // the bar-wide vertical swipe-to-expand above. stopPropagation on a
  // horizontal swipe's touchend keeps that same gesture from also being
  // read as a (near-zero) vertical swipe by the parent handler.
  function onCoverTouchStart(e: React.TouchEvent) {
    coverTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onCoverTouchEnd(e: React.TouchEvent) {
    if (!coverTouch.current) return;
    const dx = e.changedTouches[0].clientX - coverTouch.current.x;
    const dy = e.changedTouches[0].clientY - coverTouch.current.y;
    coverTouch.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      e.stopPropagation();
      if (dx < 0) next();
      else previous();
    }
  }

  // The standalone /play/[songId] page already shows the full transport —
  // stacking the mini player under it would just duplicate the controls.
  if (!currentSong || pathname?.startsWith("/play/")) return null;

  const album = currentSong.albumId ? getAlbumById(currentSong.albumId) : undefined;
  const favorite = isFavorite(currentSong.id);

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 z-40 isolate overflow-hidden border-t border-white/10 lg:left-64"
      style={{ bottom: "var(--mobile-nav-height, 0px)" }}
      data-mini-player
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <AmbientBackground src={currentSong.coverUrl} seed={currentSong.id} intensity="mini" />
      <div className="absolute inset-0 -z-[1] bg-[rgba(10,8,14,0.55)] backdrop-blur-xl" aria-hidden />

      {error && error.songId === currentSong.id && (
        <div className="relative flex items-center gap-2 border-b border-white/10 bg-danger/20 px-4 py-1.5 text-xs text-danger">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error.message}
        </div>
      )}

      <div className="relative flex items-center gap-3 px-3 py-3.5 sm:px-4 sm:py-3.5">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          onTouchStart={onCoverTouchStart}
          onTouchEnd={onCoverTouchEnd}
          className="flex min-w-0 shrink-0 basis-48 items-center gap-3 text-left md:basis-64"
          aria-label="Abrir reproductor expandido"
        >
          <div key={currentSong.id} className="animate-song-in h-14 w-14 shrink-0 sm:h-14 sm:w-14">
            <CoverImage src={currentSong.coverUrl} title={currentSong.title} size="small" className="shadow-lg" />
          </div>
          <div key={`${currentSong.id}-text`} className="animate-song-in min-w-0">
            <p className="truncate text-sm font-medium text-white">{currentSong.title}</p>
            <p className="truncate text-xs text-white/60">
              {currentSong.alias ?? currentSong.artist}
              {album ? ` · ${album.title}` : ""}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => toggleFavorite(currentSong.id)}
          aria-pressed={favorite}
          aria-label={favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          title={favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          className={clsx(
            "hidden shrink-0 rounded-full p-2 transition-colors sm:block",
            favorite ? "text-accent" : "text-white/60 hover:text-white"
          )}
        >
          <Heart className="h-4.5 w-4.5" strokeWidth={1.8} fill={favorite ? "currentColor" : "none"} />
        </button>

        <button
          type="button"
          onClick={() => setShowPlaylistPicker(true)}
          aria-label="Agregar a playlist"
          title="Agregar a playlist"
          className="hidden shrink-0 items-center gap-1.5 rounded-full px-2 py-2 text-white/70 transition-colors hover:text-white md:flex xl:px-3"
        >
          <ListPlus className="h-4.5 w-4.5" strokeWidth={1.8} />
          <span className="hidden text-xs font-medium xl:inline">Guardar</span>
        </button>

        <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
          <PlayerControls size="sm" />
          <ProgressBar position={position} duration={duration} onSeek={seek} />
        </div>

        <div className="flex shrink-0 items-center gap-1 md:hidden">
          <PlayerControls size="sm" />
        </div>

        <div className="hidden w-28 shrink-0 lg:block">
          <VolumeControl />
        </div>

        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label="Ver cola de reproducción"
          title="Ver cola de reproducción"
          className="hidden shrink-0 rounded-full p-2 text-white/60 transition-colors hover:text-white lg:block"
        >
          <ListMusic className="h-4.5 w-4.5" strokeWidth={1.8} />
        </button>

        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label="Expandir reproductor"
          className="shrink-0 rounded-full p-2 text-white/60 transition-colors hover:text-white md:hidden"
        >
          <ChevronUp className="h-5 w-5" strokeWidth={1.8} />
        </button>
      </div>

      <div className="relative px-3 pb-2.5 md:hidden">
        <ProgressBar position={position} duration={duration} onSeek={seek} compact />
      </div>

      {showPlaylistPicker && (
        <PlaylistPickerModal song={currentSong} onClose={() => setShowPlaylistPicker(false)} />
      )}
    </div>
  );
}
