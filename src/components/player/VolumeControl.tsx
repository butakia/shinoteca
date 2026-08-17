"use client";

import { Volume2, Volume1, VolumeX } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";

export default function VolumeControl() {
  const { volume, muted, setVolume, toggleMute } = usePlayer();
  const effectiveVolume = muted ? 0 : volume;
  const Icon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex w-full items-center gap-2">
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Activar sonido" : "Silenciar"}
        className="shrink-0 rounded-full p-1 text-foreground-muted transition-colors hover:bg-white/10 hover:text-foreground"
      >
        <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={effectiveVolume}
        onChange={(e) => setVolume(Number(e.target.value))}
        aria-label="Volumen"
        className="volume-slider h-1 w-full cursor-pointer appearance-none rounded-full accent-[var(--accent)]"
        style={{
          background: `linear-gradient(to right, var(--accent) ${effectiveVolume * 100}%, rgba(255,255,255,0.12) ${effectiveVolume * 100}%)`,
        }}
      />
    </div>
  );
}
