import { Music2, Play, Disc3, AudioLines, type LucideIcon } from "lucide-react";
import { stableHash } from "@/lib/hash";

export type CoverVariantKey = "dark" | "night" | "warm" | "mono";

export type CoverVariant = {
  key: CoverVariantKey;
  gradient: string; // Tailwind bg-gradient-to-br "from-* via-* to-*" classes
  glow: string; // Tailwind background-color class for the ambient glow blob
  hex: [string, string, string]; // raw hex stops, for non-Tailwind contexts (e.g. inline background-image)
  Icon: LucideIcon;
};

export const COVER_VARIANTS: CoverVariant[] = [
  {
    key: "dark",
    gradient: "from-[#000000] via-[#2a0a0f] to-[#7a1420]",
    glow: "bg-red-600/25",
    hex: ["#000000", "#2a0a0f", "#7a1420"],
    Icon: Music2,
  },
  {
    key: "night",
    gradient: "from-[#000000] via-[#1a0608] to-[#4a0f18]",
    glow: "bg-red-500/20",
    hex: ["#000000", "#1a0608", "#4a0f18"],
    Icon: Play,
  },
  {
    key: "warm",
    gradient: "from-[#000000] via-[#4a1210] to-[#c22a1e]",
    glow: "bg-orange-500/20",
    hex: ["#000000", "#4a1210", "#c22a1e"],
    Icon: Disc3,
  },
  {
    key: "mono",
    gradient: "from-[#0a0a0a] via-[#161616] to-[#262626]",
    glow: "bg-red-500/15",
    hex: ["#0a0a0a", "#161616", "#262626"],
    Icon: AudioLines,
  },
];

export function pickCoverVariant(seed: string, variant?: CoverVariantKey | "auto"): CoverVariant {
  if (variant && variant !== "auto") {
    return COVER_VARIANTS.find((v) => v.key === variant) ?? COVER_VARIANTS[0];
  }
  const index = stableHash(seed || "shinoteca") % COVER_VARIANTS.length;
  return COVER_VARIANTS[index];
}
