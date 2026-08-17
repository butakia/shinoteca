"use client";

import { useEffect, useState } from "react";
import { averageColorFromImage, vividGlowColor, rgbToCss, type RGB } from "@/lib/color";
import { pickCoverVariant } from "@/lib/coverVariants";

const cache = new Map<string, RGB>();

function variantFallback(seed: string): RGB {
  const variant = pickCoverVariant(seed);
  const [, , brightest] = variant.hex;
  const hex = brightest.replace("#", "");
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

// Samples the actual pixels of the current cover (or falls back to the
// DefaultCover variant's own color when there's no cover, or when a
// cross-origin image can't be read) so the ambient glow always matches what
// the user is actually looking at.
export function useAmbientColor(src: string | null | undefined, seed: string): string {
  const [color, setColor] = useState<RGB>(() => cache.get(src ?? seed) ?? variantFallback(seed));

  useEffect(() => {
    const cacheKey = src ?? seed;
    const cached = cache.get(cacheKey);
    if (cached) {
      setColor(cached);
      return;
    }
    if (!src) {
      const fallback = variantFallback(seed);
      cache.set(cacheKey, fallback);
      setColor(fallback);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const avg = averageColorFromImage(img);
      const resolved = avg ? vividGlowColor(avg) : variantFallback(seed);
      cache.set(cacheKey, resolved);
      setColor(resolved);
    };
    img.onerror = () => {
      if (cancelled) return;
      const fallback = variantFallback(seed);
      cache.set(cacheKey, fallback);
      setColor(fallback);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, seed]);

  return rgbToCss(color, 1);
}
