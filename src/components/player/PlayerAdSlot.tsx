"use client";

import Link from "next/link";
import { usePremium } from "@/context/PremiumContext";

// A blank ad slot for the desktop/web player — deliberately no marketing copy
// inside it (just the reserved space an ad network would fill), separate from
// the small "remove ads" upsell line underneath. Hidden entirely for premium
// listeners.
export default function PlayerAdSlot() {
  const { isPremium } = usePremium();
  if (isPremium) return null;

  return (
    <div className="shrink-0 border-t border-border p-3">
      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-surface/60">
        <span className="text-[10px] font-medium uppercase tracking-widest text-foreground-muted/40">
          Publicidad
        </span>
      </div>
      <Link
        href="/premium"
        className="mt-1.5 block text-center text-[11px] text-foreground-muted hover:text-accent"
      >
        Actualiza desde 1 USD para eliminar los anuncios
      </Link>
    </div>
  );
}
