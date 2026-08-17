"use client";

import { useEffect, useRef } from "react";
import { AudioLines } from "lucide-react";
import clsx from "clsx";
import { usePlayer } from "@/context/PlayerContext";

type AudioVisualizerProps = {
  isPlaying: boolean;
  height?: number;
  className?: string;
  // Tailwind height classes (e.g. "h-9 sm:h-14") for a size that varies by
  // breakpoint — takes over from the fixed `height` prop, which can only
  // ever be one number and so can't shrink the visualizer on small screens.
  responsiveHeightClass?: string;
};

const BAR_COUNT = 40;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Reacts to the currently-playing song's real audio via the AnalyserNode
// exposed by PlayerContext (one shared AudioContext for the whole app — see
// PlayerContext.ensureAudioGraph). Falls back to a gentle decorative pulse
// if the browser can't analyze the audio (unsupported, or a future
// cross-origin source without CORS headers keeping the graph silent).
export default function AudioVisualizer({ isPlaying, height = 56, className, responsiveHeightClass }: AudioVisualizerProps) {
  const { analyser, audioGraphUnavailable, currentSong } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const barsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0.05));
  const silentFramesRef = useRef(0);
  const usingFallbackRef = useRef(false);

  useEffect(() => {
    // reset the smoothed bar heights whenever the track changes
    barsRef.current = new Array(BAR_COUNT).fill(0.05);
    silentFramesRef.current = 0;
  }, [currentSong?.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = prefersReducedMotion();
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    function resize() {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      const rect = canvasEl.getBoundingClientRect();
      canvasEl.width = Math.max(1, rect.width * dpr);
      canvasEl.height = Math.max(1, rect.height * dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    const freqData = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    function draw() {
      const canvasEl = canvasRef.current;
      const c = canvasEl?.getContext("2d");
      if (!canvasEl || !c) return;
      const w = canvasEl.width;
      const h = canvasEl.height;
      c.clearRect(0, 0, w, h);

      const bars = barsRef.current;
      const useRealData = analyser && freqData && !audioGraphUnavailable && isPlaying && !reduceMotion;

      if (useRealData) {
        analyser.getByteFrequencyData(freqData);
        let total = 0;
        // Sample the spectrum with a log-ish curve so bass doesn't dominate
        // every bar and treble isn't lost in a handful of near-empty bins.
        for (let i = 0; i < BAR_COUNT; i++) {
          const t = i / BAR_COUNT;
          const binIndex = Math.floor(Math.pow(t, 1.7) * (freqData.length * 0.85));
          const raw = freqData[binIndex] / 255;
          total += freqData[binIndex];
          bars[i] = bars[i] * 0.55 + raw * 0.45;
        }
        silentFramesRef.current = total === 0 ? silentFramesRef.current + 1 : 0;
        usingFallbackRef.current = silentFramesRef.current > 90; // ~1.5s of true silence while "playing"
      } else {
        usingFallbackRef.current = true;
      }

      if (usingFallbackRef.current || !isPlaying || reduceMotion) {
        const idleTarget = isPlaying && !reduceMotion ? 0.16 : 0.06;
        for (let i = 0; i < BAR_COUNT; i++) {
          const wobble = isPlaying && !reduceMotion ? Math.sin(Date.now() / 400 + i) * 0.05 : 0;
          bars[i] = bars[i] * 0.85 + Math.max(0.03, idleTarget + wobble) * 0.15;
        }
      }

      const gap = w / BAR_COUNT;
      const barWidth = gap * 0.6;
      for (let i = 0; i < BAR_COUNT; i++) {
        const barH = Math.max(2 * dpr, bars[i] * h);
        const x = i * gap + (gap - barWidth) / 2;
        const y = h - barH;
        c.fillStyle = "rgba(225, 29, 47, 0.85)";
        c.fillRect(x, y, barWidth, barH);
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [analyser, audioGraphUnavailable, isPlaying]);

  return (
    <div
      className={clsx(className, responsiveHeightClass)}
      style={responsiveHeightClass ? undefined : { height }}
      role="img"
      aria-label={isPlaying ? "Visualizador de audio en reproducción" : "Visualizador de audio en pausa"}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      {audioGraphUnavailable && (
        <span className="sr-only">
          <AudioLines /> El navegador no permite analizar el audio en tiempo real; se muestra una animación de respaldo.
        </span>
      )}
    </div>
  );
}
