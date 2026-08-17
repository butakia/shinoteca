"use client";

import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Loader2 } from "lucide-react";
import clsx from "clsx";
import { usePlayer } from "@/context/PlayerContext";

export default function PlayerControls({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const { isPlaying, isLoading, togglePlay, next, previous, shuffle, toggleShuffle, repeat, cycleRepeat, currentSong } =
    usePlayer();

  const playIconSize = size === "lg" ? "h-8 w-8" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const sideIconSize = size === "lg" ? "h-7 w-7" : "h-4 w-4";
  const playButtonSize = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const sideButtonSize = size === "lg" ? "min-h-[52px] min-w-[52px]" : "min-h-[44px] min-w-[44px]";
  const repeatLabel = repeat === "off" ? "Sin repetición" : repeat === "all" ? "Repetir cola" : "Repetir canción";

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        type="button"
        onClick={toggleShuffle}
        disabled={!currentSong}
        aria-pressed={shuffle}
        aria-label="Reproducción aleatoria"
        title={shuffle ? "Aleatorio activado" : "Reproducción aleatoria"}
        className={clsx(
          "hidden min-h-[44px] min-w-[44px] rounded-full p-2 transition-colors sm:flex sm:items-center sm:justify-center",
          shuffle ? "text-accent" : "text-foreground-muted hover:text-foreground",
          !currentSong && "opacity-40"
        )}
      >
        <Shuffle className={sideIconSize} strokeWidth={1.8} />
      </button>

      <button
        type="button"
        onClick={previous}
        disabled={!currentSong}
        aria-label="Canción anterior"
        title="Canción anterior"
        className={clsx(
          "flex items-center justify-center rounded-full p-2 text-foreground transition-colors hover:bg-white/10 hover:text-white",
          sideButtonSize,
          !currentSong && "opacity-40"
        )}
      >
        <SkipBack className={sideIconSize} fill="currentColor" strokeWidth={0} />
      </button>

      <button
        type="button"
        onClick={togglePlay}
        disabled={!currentSong}
        aria-label={isPlaying ? "Pausar" : "Reproducir"}
        title={isPlaying ? "Pausar" : "Reproducir"}
        className={clsx(
          "flex items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100",
          playButtonSize
        )}
      >
        {isLoading ? (
          <Loader2 className={clsx(playIconSize, "animate-spin")} />
        ) : isPlaying ? (
          <Pause className={playIconSize} fill="currentColor" strokeWidth={0} />
        ) : (
          <Play className={clsx(playIconSize, "ml-0.5")} fill="currentColor" strokeWidth={0} />
        )}
      </button>

      <button
        type="button"
        onClick={next}
        disabled={!currentSong}
        aria-label="Siguiente canción"
        title="Siguiente canción"
        className={clsx(
          "flex items-center justify-center rounded-full p-2 text-foreground transition-colors hover:bg-white/10 hover:text-white",
          sideButtonSize,
          !currentSong && "opacity-40"
        )}
      >
        <SkipForward className={sideIconSize} fill="currentColor" strokeWidth={0} />
      </button>

      <button
        type="button"
        onClick={cycleRepeat}
        disabled={!currentSong}
        aria-label="Modo de repetición"
        title={repeatLabel}
        className={clsx(
          "hidden min-h-[44px] min-w-[44px] rounded-full p-2 transition-colors sm:flex sm:items-center sm:justify-center",
          repeat !== "off" ? "text-accent" : "text-foreground-muted hover:text-foreground",
          !currentSong && "opacity-40"
        )}
      >
        {repeat === "one" ? (
          <Repeat1 className={sideIconSize} strokeWidth={1.8} />
        ) : (
          <Repeat className={sideIconSize} strokeWidth={1.8} />
        )}
      </button>
    </div>
  );
}
