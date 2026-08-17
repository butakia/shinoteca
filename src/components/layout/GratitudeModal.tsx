"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart, X } from "lucide-react";
import { useNotices } from "@/context/NoticesContext";

const EXCLUDED_PATHS = ["/admin", "/login", "/subir"];

export default function GratitudeModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const shown = useRef(false);
  const { getNotice } = useNotices();
  const announcement = getNotice("welcome");

  useEffect(() => {
    if (EXCLUDED_PATHS.some((path) => pathname.startsWith(path))) return;
    if (!announcement.enabled || !announcement.text.trim()) return;
    if (shown.current) return;
    const timer = window.setTimeout(() => {
      shown.current = true;
      setOpen(true);
    }, Math.max(0, announcement.delaySeconds ?? 10) * 1000);
    return () => window.clearTimeout(timer);
  }, [pathname, announcement.enabled, announcement.text, announcement.delaySeconds]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="gratitude-title"
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-background-elevated shadow-2xl"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar agradecimiento"
          className="absolute right-3 top-3 z-10 rounded-full bg-black/55 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/75"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative h-52 w-full overflow-hidden rounded-t-3xl bg-black sm:h-64">
          <Image
            src={announcement.imageUrl || "/agradecimiento.jpg"}
            alt="Imagen del anuncio de SHINOTECA"
            fill
            priority
            unoptimized
            className="object-contain"
          />
        </div>

        <div className="space-y-4 p-6 text-center sm:p-7">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Heart className="h-5 w-5" fill="currentColor" />
          </div>
          <div>
            <h2 id="gratitude-title" className="text-xl font-bold text-foreground">
              {announcement.title || "Aviso de SHINOTECA"}
            </h2>
          </div>
          <div className="whitespace-pre-line rounded-2xl border border-border bg-surface/70 px-4 py-4 text-sm leading-relaxed text-foreground-muted">
            {announcement.text}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
          >
            {announcement.buttonLabel || "Continuar"}
          </button>
        </div>
      </section>
    </div>
  );
}
