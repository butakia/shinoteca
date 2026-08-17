"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import DefaultCover, { DefaultCoverSize, DefaultCoverVariant } from "./DefaultCover";

type CoverImageProps = {
  src?: string | null;
  title: string;
  subtitle?: string;
  seed?: string;
  alt?: string;
  size?: DefaultCoverSize;
  variant?: DefaultCoverVariant;
  showLabel?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

function isLikelyValidUrl(src?: string | null): src is string {
  if (!src) return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  return /^https?:\/\//.test(trimmed) || trimmed.startsWith("/") || trimmed.startsWith("data:image/");
}

// Local paths (served by this app) go through next/image for real
// optimization. Admin-provided external URLs and uploaded data: URLs can
// point anywhere, so they skip the optimizer — otherwise next/image throws a
// hard runtime error for any hostname not pre-listed in next.config.ts, which
// isn't workable for cover URLs an admin pastes in at any time.
function needsUnoptimized(src: string): boolean {
  return src.startsWith("http") || src.startsWith("data:");
}

export default function CoverImage({
  src,
  title,
  subtitle,
  seed,
  alt,
  size = "medium",
  variant = "auto",
  showLabel = false,
  sizes = "(max-width: 640px) 50vw, 200px",
  priority = false,
  className,
}: CoverImageProps) {
  const valid = isLikelyValidUrl(src);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    valid ? "loading" : "error"
  );
  // Reset status during render when `src` changes, rather than in an effect —
  // this is React's documented pattern for "adjusting state when a prop
  // changes" (avoids an extra commit/flash of the previous image's state).
  const [trackedSrc, setTrackedSrc] = useState(src);
  if (src !== trackedSrc) {
    setTrackedSrc(src);
    setStatus(valid ? "loading" : "error");
  }

  if (!valid || status === "error") {
    return (
      <DefaultCover
        title={title}
        subtitle={subtitle}
        seed={seed ?? title}
        variant={variant}
        size={size}
        showLabel={showLabel}
        className={className}
      />
    );
  }

  return (
    <div className={clsx("relative aspect-square w-full overflow-hidden rounded-xl bg-white/5", className)}>
      {status === "loading" && (
        <div className="absolute inset-0 z-10">
          <DefaultCover title={title} seed={seed ?? title} size={size} className="blur-md scale-105" />
          <div className="absolute inset-0 animate-pulse bg-black/20" />
        </div>
      )}
      <Image
        src={src as string}
        alt={alt ?? `Carátula de ${title}`}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={needsUnoptimized(src as string)}
        className={clsx(
          "object-cover transition-opacity duration-500 ease-out",
          status === "loaded" ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </div>
  );
}
