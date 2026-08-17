"use client";

import { useRef, useState } from "react";
import { formatDuration } from "@/lib/format";

type ProgressBarProps = {
  position: number;
  duration: number;
  onSeek: (time: number) => void;
  compact?: boolean;
};

export default function ProgressBar({ position, duration, onSeek, compact }: ProgressBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  // A ref (not state) tracks whether a drag is in progress. Pointerdown/up
  // can fire back-to-back within the same tick (a plain click, or a fast
  // drag), before React re-renders — reading state in those handlers would
  // see a stale value from before the interaction started. A ref is always
  // current synchronously, which is what the seek-on-release logic needs.
  const draggingRef = useRef(false);
  const [dragValue, setDragValue] = useState<number | null>(null);

  const safeDuration = duration > 0 ? duration : 0;
  const value = dragValue ?? position;
  const percent = safeDuration > 0 ? Math.min(100, (value / safeDuration) * 100) : 0;

  function valueFromClientX(clientX: number) {
    const track = trackRef.current;
    if (!track || safeDuration === 0) return 0;
    const rect = track.getBoundingClientRect();
    if (rect.width === 0) return 0;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return ratio * safeDuration;
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // pointer capture isn't available in every environment — dragging still
      // works via the move/up listeners, this just loses capture-outside-bounds
    }
    draggingRef.current = true;
    setDragValue(valueFromClientX(e.clientX));
  }
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    setDragValue(valueFromClientX(e.clientX));
  }
  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    onSeek(valueFromClientX(e.clientX));
    setDragValue(null);
  }

  return (
    <div className={compact ? "flex min-w-0 items-center gap-2" : "flex min-w-0 w-full items-center gap-2"}>
      {!compact && (
        <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-foreground-muted">
          {formatDuration(value)}
        </span>
      )}
      <div
        ref={trackRef}
        role="slider"
        aria-label="Progreso de la canción"
        aria-valuemin={0}
        aria-valuemax={safeDuration}
        aria-valuenow={value}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") onSeek(Math.min(safeDuration, position + 5));
          if (e.key === "ArrowLeft") onSeek(Math.max(0, position - 5));
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="group relative flex min-w-[60px] flex-1 cursor-pointer touch-none items-center py-3.5"
      >
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />
        <div
          className="pointer-events-none absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent transition-[width] group-active:bg-red-400"
          style={{ width: `${percent}%` }}
        />
        <div
          className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-active:opacity-100"
          style={{ left: `${percent}%` }}
        />
      </div>
      {!compact && (
        <span className="w-9 shrink-0 text-[11px] tabular-nums text-foreground-muted">
          {formatDuration(safeDuration)}
        </span>
      )}
    </div>
  );
}
