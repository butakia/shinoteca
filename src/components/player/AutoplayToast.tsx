"use client";

import { Sparkles } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";

export default function AutoplayToast() {
  const { autoplayNotice } = usePlayer();
  if (!autoplayNotice) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4"
      style={{ bottom: "calc(var(--player-height, 96px) + var(--mobile-nav-height, 0px) + 16px)" }}
    >
      <div className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-foreground shadow-2xl">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        {autoplayNotice}
      </div>
    </div>
  );
}
