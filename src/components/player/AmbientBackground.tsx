"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { useAmbientColor } from "@/hooks/useAmbientColor";
import { pickCoverVariant } from "@/lib/coverVariants";

type AmbientBackgroundProps = {
  src?: string | null;
  seed: string;
  /** "mini" = subtler, spans a horizontal bar. "full" = the expanded player's tall hero. */
  intensity?: "mini" | "full";
  className?: string;
};

// The shared 4-layer ambient system described across the design notes:
//   1. cover, enlarged + blurred + saturated
//   2. color halo (radial gradient from the sampled dominant color)
//   3. dark gradient for legibility
//   4. (rendered by the caller) sharp foreground content
export default function AmbientBackground({ src, seed, intensity = "full", className }: AmbientBackgroundProps) {
  const color = useAmbientColor(src, seed);
  const variant = pickCoverVariant(seed);
  const blur = intensity === "mini" ? "blur(38px)" : "blur(60px)";
  const scale = intensity === "mini" ? 1.35 : 1.25;
  const imageOpacity = intensity === "mini" ? 0.55 : 0.75;

  return (
    <div className={clsx("pointer-events-none overflow-hidden", className ?? "absolute inset-0")} aria-hidden>
      {/* layer 1: enlarged, blurred, saturated cover. Deliberately a single
          always-mounted motion.div (no AnimatePresence/key remount) — nesting
          AnimatePresence here previously broke the parent player overlay's
          own exit-unmount tracking, leaving it stuck on screen after close. */}
      <motion.div
        animate={{ opacity: imageOpacity }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute -inset-[20%]"
        style={
          src
            ? {
                backgroundImage: `url(${src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: `${blur} saturate(1.4)`,
                transform: `scale(${scale})`,
              }
            : {
                backgroundImage: `linear-gradient(135deg, ${variant.hex[0]}, ${variant.hex[1]}, ${variant.hex[2]})`,
                filter: `${blur} saturate(1.3)`,
                transform: `scale(${scale})`,
              }
        }
      />

      {/* layer 2: color halo sampled from the cover — plain style (not framer
          motion's animate prop) since gradient strings aren't interpolatable
          the way colors/numbers are; the CSS transition below still eases it */}
      <div
        className="absolute inset-0 transition-[background] duration-700 ease-out"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 30% 35%, ${color}, transparent 70%)`,
          mixBlendMode: "screen",
          opacity: intensity === "mini" ? 0.6 : 0.7,
        }}
      />

      {/* layer 3: dark gradient for legibility */}
      <div
        className={clsx(
          "absolute inset-0",
          intensity === "mini"
            ? "bg-gradient-to-r from-black/40 via-black/55 to-black/75"
            : "bg-gradient-to-b from-black/45 via-background/85 to-background"
        )}
      />
    </div>
  );
}
