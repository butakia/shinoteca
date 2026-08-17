"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, X, Clock, Disc3, ListMusic, ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { useSongs } from "@/context/SongsContext";
import { usePlaylists } from "@/context/PlaylistsContext";
import { usePlayer } from "@/context/PlayerContext";
import { STORAGE_KEYS } from "@/lib/storage";
import { usePersistentState } from "@/hooks/usePersistentState";
import CoverImage from "@/components/media/CoverImage";

const MAX_HISTORY = 8;

type Rect = { top: number; left: number; width: number; maxHeight: number };

export default function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [history, setHistory] = usePersistentState<string[]>(STORAGE_KEYS.searchHistory, []);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { searchSongs, getVisibleAlbums, getAlbumById } = useSongs();
  const { playlists } = usePlaylists();
  const { playSong } = usePlayer();

  useEffect(() => setMounted(true), []);

  // On a phone there simply isn't room for an inline search field: in the
  // player header it shares 375px with the menu, back and queue buttons and
  // ends up ~96px wide, too cramped to type in and impossible to anchor a
  // results list under without it running off-screen. Below `sm` the search
  // therefore opens as a full-screen sheet instead — the same pattern
  // Spotify and YouTube Music use — which removes the overflow problem by
  // construction rather than trying to squeeze a popover into the gap.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Focus the full-screen field as soon as it opens so the keyboard comes up
  // without a second tap.
  useEffect(() => {
    if (open && isMobile) mobileInputRef.current?.focus();
  }, [open, isMobile]);

  useEffect(() => {
    if (!open || !isMobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, isMobile]);

  // The dropdown/backdrop are portaled to <body> (see below) so they always
  // cover the real viewport — but that means their position can no longer
  // come from CSS alone (they're no longer DOM-nested under the search box).
  // Measuring the box on open/resize/scroll keeps the portaled dropdown
  // visually anchored under the input everywhere this component is used,
  // including inside the expanded player overlay.
  useEffect(() => {
    if (!open) return;
    function measure() {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // window.innerHeight doesn't shrink when a mobile keyboard opens, but
      // visualViewport.height does — using the wrong one let the dropdown
      // render at a "top" that was fine before the keyboard appeared but
      // then sat underneath it, overlapping the keyboard and the browser's
      // autofill bar instead of being clipped to the space actually visible.
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      const top = r.bottom;
      const maxHeight = Math.max(120, viewportHeight - top - 12);

      // Clamp to the viewport instead of blindly inheriting the input's
      // left/width. Inside the expanded player header the search box is
      // narrow and pushed right (it shares the row with the menu/back/logo
      // buttons), so a dropdown anchored at its left edge with a 280px
      // minimum width ran straight off the right side of a phone screen,
      // clipping every result title. Now it takes at most the space
      // actually available, shifting left as needed to stay fully on screen.
      const margin = 8;
      const maxWidth = viewportWidth - margin * 2;
      const width = Math.min(Math.max(r.width, 280), maxWidth);
      const left = Math.min(Math.max(margin, r.left), viewportWidth - width - margin);

      setRect({ top, left, width, maxHeight });
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      window.visualViewport?.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("scroll", measure);
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        const container = containerRef.current;
        const input = inputRef.current;
        if (!container || !input) return;
        const rect = input.getBoundingClientRect();
        const topElement = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        if (rect.width === 0 || rect.height === 0 || !topElement || !container.contains(topElement)) return;
        e.preventDefault();
        input.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        setOpen(false);
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // The dropdown is portaled to <body>, so it's no longer a DOM
      // descendant of containerRef — it needs its own ref checked here too,
      // or every click inside a result row would look like an "outside"
      // click and close the dropdown before the row's own onClick could fire.
      const insideBox = containerRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideBox && !insideDropdown) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  const trimmedQuery = query.trim();
  const results = trimmedQuery ? searchSongs(query).slice(0, 6) : [];
  const albumResults = trimmedQuery
    ? getVisibleAlbums()
        .filter((a) => a.title.toLowerCase().includes(trimmedQuery.toLowerCase()))
        .slice(0, 3)
    : [];
  const playlistResults = trimmedQuery
    ? playlists.filter((p) => p.name.toLowerCase().includes(trimmedQuery.toLowerCase())).slice(0, 3)
    : [];

  function commitHistory(term: string) {
    if (!term.trim()) return;
    setHistory((prev) => [term, ...prev.filter((h) => h.toLowerCase() !== term.toLowerCase())].slice(0, MAX_HISTORY));
  }

  function goToResults(term: string) {
    commitHistory(term);
    setOpen(false);
    router.push(`/buscar?q=${encodeURIComponent(term)}`);
  }

  const resultsContent = (
      <>
        {!trimmedQuery && history.length === 0 && (
          <div className="flex flex-col items-center px-5 py-7 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Search className="h-5 w-5" strokeWidth={2} />
            </div>
            <p className="text-sm font-medium text-foreground">¿Qué quieres escuchar?</p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-foreground-muted">
              Busca canciones, álbumes, playlists o años del archivo.
            </p>
          </div>
        )}

        {!query.trim() && history.length > 0 && (
          <div>
            <p className="px-2.5 py-1.5 text-xs uppercase tracking-wide text-foreground-muted/70">
              Búsquedas recientes
            </p>
            {history.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setQuery(term);
                  goToResults(term);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              >
                <Clock className="h-4 w-4" /> {term}
              </button>
            ))}
          </div>
        )}

        {trimmedQuery && results.length === 0 && albumResults.length === 0 && playlistResults.length === 0 && (
          <p className="px-2.5 py-6 text-center text-sm text-foreground-muted">
            Sin resultados para &ldquo;{query}&rdquo;
          </p>
        )}

        {results.length > 0 && (
          <div>
            {trimmedQuery && (
              <p className="px-2.5 py-1.5 text-xs uppercase tracking-wide text-foreground-muted/70">Canciones</p>
            )}
            {results.map((song) => {
              const album = song.albumId ? getAlbumById(song.albumId) : undefined;
              return (
                <button
                  key={song.id}
                  type="button"
                  aria-label={`Reproducir ${song.title}`}
                  onClick={() => {
                    commitHistory(query);
                    setOpen(false);
                    playSong(song);
                  }}
                  className="flex w-full items-center gap-3.5 rounded-lg px-2.5 py-2.5 text-left hover:bg-surface-hover"
                >
                  <div className="h-14 w-14 shrink-0">
                    <CoverImage src={song.coverUrl} title={song.title} size="small" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-medium text-foreground">{song.title}</p>
                    <p className="truncate text-sm text-foreground-muted">
                      {song.alias ?? song.artist} {album ? `· ${album.title}` : ""}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {albumResults.length > 0 && (
          <div>
            <p className="px-2.5 py-1.5 text-xs uppercase tracking-wide text-foreground-muted/70">Álbumes</p>
            {albumResults.map((album) => (
              <button
                key={album.id}
                onClick={() => {
                  commitHistory(query);
                  setOpen(false);
                  router.push(`/albumes/${album.id}`);
                }}
                className="flex w-full items-center gap-3.5 rounded-lg px-2.5 py-2.5 text-left hover:bg-surface-hover"
              >
                <div className="h-14 w-14 shrink-0">
                  <CoverImage src={album.coverUrl} title={album.title} size="small" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-medium text-foreground">{album.title}</p>
                  <p className="flex items-center gap-1 truncate text-sm text-foreground-muted">
                    <Disc3 className="h-3.5 w-3.5 shrink-0" /> Álbum {album.year ? `· ${album.year}` : ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {playlistResults.length > 0 && (
          <div>
            <p className="px-2.5 py-1.5 text-xs uppercase tracking-wide text-foreground-muted/70">Playlists</p>
            {playlistResults.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => {
                  commitHistory(query);
                  setOpen(false);
                  router.push(`/playlists/${playlist.id}`);
                }}
                className="flex w-full items-center gap-3.5 rounded-lg px-2.5 py-2.5 text-left hover:bg-surface-hover"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
                  <ListMusic className="h-6 w-6 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-medium text-foreground">{playlist.name}</p>
                  <p className="truncate text-sm text-foreground-muted">{playlist.songIds.length} canciones</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {trimmedQuery && results.length > 0 && (
          <button
            onClick={() => goToResults(query)}
            className="mt-1 w-full rounded-lg px-2.5 py-2.5 text-center text-sm font-medium text-accent hover:bg-surface-hover"
          >
            Ver todos los resultados
          </button>
        )}
      </>
  );

  // Phones: a full-screen sheet (see the isMobile note above).
  const mobileSheet = open && mounted && isMobile && createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar búsqueda"
          className="shrink-0 rounded-full p-2 text-foreground hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-accent/60 bg-surface px-4 py-2.5">
          <Search className="h-5 w-5 shrink-0 text-foreground-muted" strokeWidth={2} />
          <input
            ref={mobileInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) goToResults(query);
            }}
            type="text"
            enterKeyHint="search"
            placeholder="Buscar canciones, álbumes…"
            aria-label="Buscar en el archivo"
            className="w-full bg-transparent text-base text-foreground placeholder:text-foreground-muted/60 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="shrink-0 text-foreground-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">{resultsContent}</div>
    </div>,
    document.body
  );

  // Desktop/tablet: the anchored popover.
  const dropdown = open && mounted && !isMobile && rect && createPortal(
    <>
      {/* A light dim keeps the results legible without making the page look
          frozen or broken. Portaled straight to
          <body> — this component sometimes renders inside containers that
          have their own CSS transform (e.g. the expanded player overlay),
          and a `fixed` element nested inside a transformed ancestor stops
          covering the real viewport and instead gets clipped to that
          ancestor's box, which is what caused the search dropdown to render
          tangled up with the player's own controls instead of over them. */}
      <div
        className="fixed inset-0 z-[100] bg-black/25 transition-opacity"
        aria-hidden
        onClick={() => setOpen(false)}
      />
      <div
        ref={dropdownRef}
        style={{
          position: "fixed",
          top: rect.top + 8,
          left: rect.left,
          width: rect.width,
          maxHeight: Math.min(448, rect.maxHeight),
        }}
        className="z-[101] overflow-y-auto rounded-2xl border border-border bg-background-elevated p-2.5 shadow-2xl"
      >
        {resultsContent}
      </div>
    </>,
    document.body
  );

  return (
    <>
      {dropdown}
      {mobileSheet}
      <div
        ref={containerRef}
        className={clsx(
          "relative z-40 w-full transition-[max-width] duration-200 ease-out",
          open ? "max-w-2xl" : "max-w-md",
          className
        )}
      >
        <div
          className={clsx(
            "flex items-center gap-2.5 rounded-full border bg-surface px-4 transition-all duration-200",
            open ? "border-accent/60 py-3 shadow-2xl" : "border-border py-2 focus-within:border-accent/50"
          )}
        >
          <Search className={clsx("shrink-0 text-foreground-muted transition-all", open ? "h-5 w-5" : "h-4 w-4")} strokeWidth={2} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            // On phones this compact field is only a trigger — tapping it
            // opens the full-screen sheet (which carries the real, roomy
            // input). readOnly keeps the on-screen keyboard from popping up
            // against a ~96px-wide box before the sheet takes over.
            readOnly={isMobile}
            onClick={() => isMobile && setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) goToResults(query);
            }}
            type="text"
            placeholder="Buscar canciones, álbumes, años…"
            aria-label="Buscar en el archivo"
            className={clsx(
              "w-full bg-transparent text-foreground placeholder:text-foreground-muted/60 outline-none transition-all",
              open ? "text-base" : "text-sm",
              isMobile && "cursor-pointer"
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="text-foreground-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-foreground-muted/70 sm:block">
            /
          </kbd>
        </div>
      </div>
    </>
  );
}
