"use client";

import Link from "next/link";
import { Megaphone } from "lucide-react";
import { usePremium } from "@/context/PremiumContext";
import { adCards } from "@/lib/data/ads";

// Picks a card deterministically from the given seed so the same slot shows
// a stable card per page load instead of flashing between renders.
function pickCard(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return adCards[hash % adCards.length];
}

export default function AdBanner({ slot, padded = true }: { slot: string; padded?: boolean }) {
  const { isPremium } = usePremium();
  if (isPremium || adCards.length === 0) return null;

  const card = pickCard(slot);

  return (
    <div className={padded ? "mb-8 px-4 sm:px-6 lg:px-8" : "mb-8"}>
      <div
        className="flex flex-col items-start gap-3 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between"
        style={{ background: card.gradient }}
      >
        <div className="flex items-start gap-2 text-white">
          <Megaphone className="mt-0.5 h-4 w-4 shrink-0 opacity-70" strokeWidth={1.8} />
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/60">Publicidad</span>
            <h3 className="text-base font-semibold">{card.title}</h3>
            <p className="mt-0.5 max-w-md text-sm text-white/80">{card.description}</p>
          </div>
        </div>
        <Link
          href={card.ctaHref}
          className="shrink-0 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/25"
        >
          {card.ctaLabel}
        </Link>
      </div>
    </div>
  );
}
