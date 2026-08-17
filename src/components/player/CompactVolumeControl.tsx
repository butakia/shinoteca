"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import clsx from "clsx";
import { usePlayer } from "@/context/PlayerContext";

// A single small icon that reveals the slider on hover (desktop) or tap
// (mobile) instead of taking up permanent space next to the main transport
// controls — volume shouldn't visually compete with play/pause/skip.
export default function CompactVolumeControl({ className }: { className?: string }) {
  const { volume, muted, setVolume, toggleMute } = usePlayer();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const effectiveVolume = muted ? 0 : volume;
  const Icon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 0.5 ? Volume1 : Volume2;

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={clsx("group/volume relative", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => {
          if (open) toggleMute();
          else setOpen(true);
        }}
        aria-label={muted ? "Activar sonido" : "Silenciar"}
        title="Volumen"
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground-muted transition-colors hover:bg-white/10 hover:text-foreground"
      >
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </button>

      <div
        className={clsx(
          "absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-xl border border-border bg-surface px-3 py-3 shadow-xl transition-all duration-150",
          open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        )}
      >
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={effectiveVolume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volumen"
          className="volume-slider h-24 w-1.5 cursor-pointer appearance-none rounded-full accent-[var(--accent)]"
          style={{
            background: `linear-gradient(to top, var(--accent) ${effectiveVolume * 100}%, rgba(255,255,255,0.12) ${effectiveVolume * 100}%)`,
            writingMode: "vertical-lr",
            direction: "rtl",
          }}
        />
      </div>
    </div>
  );
}
