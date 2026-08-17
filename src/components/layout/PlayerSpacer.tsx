"use client";

import { usePathname } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";

// Reserves scroll space at the bottom of the page content so the fixed
// MiniPlayer + mobile tab bar never overlap the last row of content.
export default function PlayerSpacer() {
  const { currentSong, error } = usePlayer();
  const pathname = usePathname();
  if (!currentSong || pathname?.startsWith("/play/")) return null;
  const extra = error ? 28 : 0;
  return (
    <div
      aria-hidden
      style={{ height: `calc(var(--player-height) + ${extra}px)` }}
    />
  );
}
