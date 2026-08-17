import clsx from "clsx";
import { AudioLines } from "lucide-react";
import { pickCoverVariant } from "@/lib/coverVariants";
import type { InstitutionalPage } from "@/lib/institutional";

export default function InstitutionalHero({ page }: { page: InstitutionalPage }) {
  const variant = pickCoverVariant(page.slug);
  const hasImage = !!page.imageUrl;
  const positionClass =
    page.imagePosition === "top" ? "object-top" : page.imagePosition === "bottom" ? "object-bottom" : "object-center";

  if (page.imageMode === "card" && hasImage) {
    return (
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="glass w-full max-w-xs shrink-0 overflow-hidden rounded-2xl sm:w-64">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={page.imageUrl} alt={page.imageAlt} className={clsx("aspect-square w-full", positionClass, "object-cover")} />
        </div>
        <div>
          {page.subtitle && (
            <p className="text-xs font-medium uppercase tracking-widest text-accent">{page.subtitle}</p>
          )}
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-4xl">{page.title}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border">
      <div className="absolute inset-0 -z-10">
        {hasImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={page.imageUrl}
              alt={page.imageAlt}
              className={clsx("h-full w-full scale-110 blur-2xl", positionClass, "object-cover")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          </>
        ) : (
          <>
            <div className={clsx("h-full w-full bg-gradient-to-br", variant.gradient)} />
            <div aria-hidden className={clsx("absolute -left-10 -top-10 h-2/3 w-2/3 rounded-full blur-3xl", variant.glow)} />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </>
        )}
      </div>

      <div className="flex min-h-[220px] flex-col justify-end gap-2 px-6 py-10 sm:min-h-[280px] sm:px-10">
        {!hasImage && <AudioLines className="mb-2 h-8 w-8 text-white/70" strokeWidth={1.6} />}
        {page.subtitle && (
          <p className="text-xs font-medium uppercase tracking-widest text-accent">{page.subtitle}</p>
        )}
        <h1 className="max-w-2xl text-2xl font-bold text-foreground sm:text-4xl">{page.title}</h1>
      </div>
    </div>
  );
}
