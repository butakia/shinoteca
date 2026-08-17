"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Heart,
  ThumbsUp,
  ThumbsDown,
  Text,
  Download,
  Share2,
  ListPlus,
  Disc3,
  User,
  MoreHorizontal,
  Volume2,
  VolumeX,
} from "lucide-react";
import clsx from "clsx";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";
import { usePlaylists } from "@/context/PlaylistsContext";
import { useSongs } from "@/context/SongsContext";
import CoverImage from "@/components/media/CoverImage";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";
import CompactVolumeControl from "./CompactVolumeControl";
import OfflineDownloadButton from "./OfflineDownloadButton";
import AudioVisualizer from "./AudioVisualizer";
import AmbientBackground from "./AmbientBackground";
import PlaylistPickerModal from "@/components/song/PlaylistPickerModal";
import { releaseTypeLabels, formatDuration } from "@/lib/format";
import type { SidePanelTab } from "./SidePanel";

// The "stage" of the player — cover, visualizer, title, controls, and the
// action row. Shared verbatim between the quick-expand overlay
// (ExpandedPlayer) and the standalone /play/[songId] page so both stay
// pixel-identical and read from the single PlayerContext instance instead of
// duplicating markup.
export default function PlayerStage({
  activeTab,
  onOpenTab,
  onNavigate,
}: {
  activeTab?: SidePanelTab;
  onOpenTab: (tab: SidePanelTab) => void;
  onNavigate?: () => void;
}) {
  const { currentSong, position, duration, seek, addToQueue, isPlaying, next, previous } = usePlayer();
  const { isFavorite, toggleFavorite, getReaction, setReaction, likeCounts, ensureLikeCount } = useFavorites();
  const { playlists } = usePlaylists();
  const { getAlbumById } = useSongs();
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showVolumeSheet, setShowVolumeSheet] = useState(false);

  // Swipe the cover left/right to skip tracks, à la Spotify/YT Music. Only
  // commits to a horizontal swipe once the gesture is clearly more
  // horizontal than vertical — otherwise it falls through to the page's
  // normal vertical scroll instead of hijacking it.
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swipeAxis = useRef<"x" | "y" | null>(null);

  function onCoverTouchStart(e: React.TouchEvent) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    swipeAxis.current = null;
  }
  function onCoverTouchMove(e: React.TouchEvent) {
    if (!touchStart.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;
    if (swipeAxis.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      swipeAxis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (swipeAxis.current === "x") {
      setDragging(true);
      setDragX(dx);
    }
  }
  function onCoverTouchEnd() {
    if (swipeAxis.current === "x") {
      if (dragX < -70) next();
      else if (dragX > 70) previous();
    }
    setDragging(false);
    setDragX(0);
    touchStart.current = null;
    swipeAxis.current = null;
  }

  useEffect(() => {
    if (currentSong) ensureLikeCount(currentSong.id);
  }, [currentSong, ensureLikeCount]);

  if (!currentSong) return null;

  const album = currentSong.albumId ? getAlbumById(currentSong.albumId) : undefined;

  const favorite = isFavorite(currentSong.id);
  const reaction = getReaction(currentSong.id);
  const likeCount = likeCounts[currentSong.id] ?? 0;
  const inAnyPlaylist = playlists.some((p) => p.songIds.includes(currentSong.id));

  return (
    <div className="relative h-full overflow-y-auto">
      <AmbientBackground
        src={currentSong.coverUrl}
        seed={currentSong.id}
        intensity="full"
        className="absolute inset-x-0 top-0 -z-10 h-[560px]"
      />

      {/* min-h-full + justify-center: on a tall desktop viewport this content
          used to sit pinned to the top with a big dead void below it — now it
          centers in whatever space is actually available, and still scrolls
          normally if the viewport is too short to fit everything. */}
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-3 sm:py-4">
      {/* Explicit w-full + max-w-sm: as a bare flex column this box sized to
          its widest child (~280px), so the cover never got near the "big
          artwork" of the reference layout no matter what max-width it asked
          for. Pinning the column width makes every child predictable. */}
      <div key={currentSong.id} className="animate-song-in mx-auto flex w-full max-w-sm flex-col items-center gap-2.5 text-center sm:gap-3">
        <div
          // Capping width by BOTH vw and vh (not just vw) means the cover
          // shrinks on short viewports too — a common laptop window (say
          // 1400x700 with browser chrome) used to keep the cover at its full
          // ~320px size regardless of available height, pushing the actual
          // transport controls below the fold and forcing a scroll just to
          // reach play/pause.
          className="w-full max-w-[min(78vw,38vh)] touch-pan-y select-none sm:max-w-[min(20rem,36vh)]"
          onTouchStart={onCoverTouchStart}
          onTouchMove={onCoverTouchMove}
          onTouchEnd={onCoverTouchEnd}
          style={{
            transform: `translateX(${dragX}px) rotate(${dragX / 40}deg)`,
            opacity: 1 - Math.min(0.4, Math.abs(dragX) / 400),
            transition: dragging ? "none" : "transform 220ms ease-out, opacity 220ms ease-out",
          }}
        >
          <CoverImage src={currentSong.coverUrl} title={currentSong.title} size="large" priority className="shadow-2xl" />
        </div>

        <AudioVisualizer isPlaying={isPlaying} className="w-full max-w-sm" responsiveHeightClass="h-7 sm:h-10" />

        <div className="w-full">
          <h1 className="truncate text-xl font-bold text-foreground sm:text-3xl">{currentSong.title}</h1>
          <p className="mt-1 flex flex-wrap items-center justify-center gap-x-1.5 text-xs text-foreground-muted sm:mt-1.5 sm:text-sm">
            <Link href="/explorar" onClick={onNavigate} className="inline-flex items-center gap-1 hover:text-foreground">
              <User className="h-3.5 w-3.5" /> {currentSong.alias ?? currentSong.artist}
            </Link>
            {album && (
              <>
                <span>·</span>
                <Link href={`/albumes/${album.id}`} onClick={onNavigate} className="inline-flex items-center gap-1 hover:text-foreground">
                  <Disc3 className="h-3.5 w-3.5" /> {album.title}
                </Link>
              </>
            )}
            {!album && (
              <>
                <span>·</span>
                <span>{releaseTypeLabels[currentSong.releaseType]}</span>
              </>
            )}
            {currentSong.year && <span>· {currentSong.year}</span>}
            <span>· {formatDuration(currentSong.duration)}</span>
          </p>
        </div>

        {/* Compact "chip" row, mirroring the YouTube Music reference: the few
            actions people actually reach for live here as pills; everything
            else moved into the "más" sheet below so mobile no longer shows
            eight loose icons wrapped across two ragged rows.

            flex-wrap, no scroll horizontal: `justify-center` + `overflow-x-auto`
            recorta el contenido por AMBOS lados cuando no cabe (el desbordamiento
            por el lado inicial queda inalcanzable en flexbox), que es justo como
            se veía —la píldora de me gusta cortada a la izquierda y "Más" a la
            derecha—. Envolviendo en varias líneas nunca se recorta nada. */}
        <div className="flex w-full flex-wrap items-center justify-center gap-2">
          <div className="flex shrink-0 items-center rounded-full bg-white/10">
            <button
              type="button"
              onClick={() => setReaction(currentSong.id, "like")}
              aria-pressed={reaction === "like"}
              aria-label="Me gusta"
              className={clsx(
                "flex items-center gap-2 rounded-l-full py-2 pl-4 pr-3 text-sm font-medium transition-colors",
                reaction === "like" ? "text-accent" : "text-foreground hover:text-white"
              )}
            >
              <ThumbsUp className="h-5 w-5" fill={reaction === "like" ? "currentColor" : "none"} strokeWidth={1.8} />
              {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
            </button>
            <span className="h-5 w-px bg-white/15" aria-hidden />
            <button
              type="button"
              onClick={() => setReaction(currentSong.id, "dislike")}
              aria-pressed={reaction === "dislike"}
              aria-label="No me gusta"
              className={clsx(
                "rounded-r-full py-2 pl-3 pr-4 transition-colors",
                reaction === "dislike" ? "text-danger" : "text-foreground hover:text-white"
              )}
            >
              <ThumbsDown className="h-5 w-5" fill={reaction === "dislike" ? "currentColor" : "none"} strokeWidth={1.8} />
            </button>
          </div>

          <Chip
            active={favorite}
            label="Favorito"
            onClick={() => toggleFavorite(currentSong.id)}
            icon={<Heart className="h-5 w-5" fill={favorite ? "currentColor" : "none"} strokeWidth={1.8} />}
          />
          <Chip
            active={inAnyPlaylist}
            label="Guardar"
            onClick={() => setShowPlaylistPicker(true)}
            icon={<ListPlus className="h-5 w-5" strokeWidth={1.8} />}
          />
          <Chip
            label="Más"
            onClick={() => setShowMoreActions(true)}
            icon={<MoreHorizontal className="h-5 w-5" strokeWidth={1.8} />}
          />
        </div>

        <div className="w-full max-w-sm">
          <ProgressBar position={position} duration={duration} onSeek={seek} />
        </div>

        <div className="relative flex w-full items-center justify-center">
          <PlayerControls size="lg" />
          <CompactVolumeControl className="absolute right-0 top-1/2 hidden -translate-y-1/2 sm:block" />
        </div>
      </div>
      </div>

      {showMoreActions && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={() => setShowMoreActions(false)}
        >
          <div
            className="glass w-full max-w-sm rounded-t-2xl p-2 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SheetItem
              icon={<ListPlus className="h-5 w-5" strokeWidth={1.8} />}
              label="Añadir a la cola"
              onClick={() => {
                addToQueue(currentSong);
                setShowMoreActions(false);
              }}
            />
            <SheetItem
              icon={<Text className="h-5 w-5" strokeWidth={1.8} />}
              label="Ver letra"
              onClick={() => {
                onOpenTab("lyrics");
                setShowMoreActions(false);
              }}
            />
            <SheetItem
              icon={<Disc3 className="h-5 w-5" strokeWidth={1.8} />}
              label="Recomendadas"
              onClick={() => {
                onOpenTab("related");
                setShowMoreActions(false);
              }}
            />
            <div className="sm:hidden">
              <SheetItem
                icon={<Volume2 className="h-5 w-5" strokeWidth={1.8} />}
                label="Volumen"
                onClick={() => {
                  setShowMoreActions(false);
                  setShowVolumeSheet(true);
                }}
              />
            </div>
            {currentSong.isDownloadable && (
              <>
                <Link
                  href={`/canciones/${currentSong.id}#descargar`}
                  onClick={() => {
                    setShowMoreActions(false);
                    onNavigate?.();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground hover:bg-white/10"
                >
                  <Download className="h-5 w-5" strokeWidth={1.8} /> Descargar archivo
                </Link>
                <div className="flex items-center gap-3 rounded-lg px-3 py-1 text-sm font-medium text-foreground">
                  <OfflineDownloadButton song={currentSong} compact={false} />
                </div>
              </>
            )}
            <SheetItem
              icon={<Share2 className="h-5 w-5" strokeWidth={1.8} />}
              label="Compartir"
              onClick={() => {
                const url = `${window.location.origin}/canciones/${currentSong.id}`;
                navigator.clipboard?.writeText(url).catch(() => {});
                setShowMoreActions(false);
              }}
            />
          </div>
        </div>
      )}

      {showVolumeSheet && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={() => setShowVolumeSheet(false)}
        >
          <div
            className="glass w-full max-w-sm rounded-t-2xl p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-3 text-sm font-semibold text-foreground">Volumen</p>
            <MobileVolumeSlider />
          </div>
        </div>
      )}

      {showPlaylistPicker && <PlaylistPickerModal song={currentSong} onClose={() => setShowPlaylistPicker(false)} />}
    </div>
  );
}

function Chip({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={clsx(
        "flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/15",
        active ? "text-accent" : "text-foreground"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function SheetItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-white/10"
    >
      {icon}
      {label}
    </button>
  );
}

// Horizontal volume slider for the mobile bottom sheet — the hover-reveal
// CompactVolumeControl is desktop-only (there's no hover on touch).
function MobileVolumeSlider() {
  const { volume, muted, setVolume, toggleMute } = usePlayer();
  const effectiveVolume = muted ? 0 : volume;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Activar sonido" : "Silenciar"}
        className="shrink-0 rounded-full p-2 text-foreground transition-colors hover:bg-white/10"
      >
        {effectiveVolume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={effectiveVolume}
        onChange={(e) => setVolume(Number(e.target.value))}
        aria-label="Volumen"
        className="volume-slider h-1.5 w-full cursor-pointer appearance-none rounded-full accent-[var(--accent)]"
        style={{
          background: `linear-gradient(to right, var(--accent) ${effectiveVolume * 100}%, rgba(255,255,255,0.12) ${effectiveVolume * 100}%)`,
        }}
      />
    </div>
  );
}
