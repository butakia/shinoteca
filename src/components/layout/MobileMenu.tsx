"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Menu,
  X,
  Home,
  ListMusic,
  Download,
  Heart,
  History,
  Disc3,
  Mic2,
  Settings,
  Info,
  Plus,
  Compass,
  Music2,
} from "lucide-react";
import { useArtistFilter } from "@/context/ArtistFilterContext";
import { usePlayer } from "@/context/PlayerContext";

function OnlyShinoflowToggle() {
  const { onlyShinoflow, toggleOnlyShinoflow } = useArtistFilter();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={onlyShinoflow}
      onClick={toggleOnlyShinoflow}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground-muted transition-colors hover:bg-white/10 hover:text-foreground"
    >
      <Music2 className="h-4.5 w-4.5 shrink-0" strokeWidth={1.8} />
      <span className="min-w-0 flex-1 truncate">Solo Shinoflow</span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full shadow-inner transition-colors ${
          onlyShinoflow ? "bg-accent" : "bg-white/25"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
            onlyShinoflow ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

const ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/explorar", label: "Biblioteca", icon: Compass },
  { href: "/descargas", label: "Mis descargas", icon: Download },
  { href: "/playlists", label: "Mis playlists", icon: ListMusic },
  { href: "/playlists", label: "Crear playlist", icon: Plus },
  { href: "/favoritos", label: "Canciones favoritas", icon: Heart },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/albumes", label: "Álbumes", icon: Disc3 },
  { href: "/artistas", label: "Artistas", icon: Mic2 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
  { href: "/creditos", label: "Información y créditos", icon: Info },
];

export default function MobileMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setExpanded } = usePlayer();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const panel = mounted && createPortal(
    // Portaled to <body> — this menu is opened from inside the expanded
    // player overlay too, which has its own CSS transform, and a `fixed`
    // element nested inside a transformed ancestor stops covering the real
    // viewport (same root cause the search dropdown had).
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-200 ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <nav
        className={`glass absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col overflow-y-auto p-3 transition-transform duration-250 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Menú principal"
      >
        <div className="mb-2 flex items-center justify-between px-2 py-2">
          <span className="text-sm font-semibold text-foreground">Menú</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="rounded-full p-1.5 text-foreground-muted hover:bg-white/10 hover:text-foreground"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        {ITEMS.map((item) => (
          <div key={item.label}>
            <Link
              href={item.href}
              onClick={() => {
                setOpen(false);
                setExpanded(false);
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-white/10 hover:text-foreground"
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.8} />
              {item.label}
            </Link>
            {/* Sits directly under "Mis descargas", per the archive's focus:
                on by default so the catalogue reads as Shinoflow's, with
                third-party uploads one tap away rather than mixed in. */}
            {item.label === "Mis descargas" && <OnlyShinoflowToggle />}
          </div>
        ))}
      </nav>
    </div>,
    document.body
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className={className ?? "rounded-full border border-white/10 bg-white/5 p-2 text-foreground hover:bg-white/10"}
      >
        <Menu className="h-4.5 w-4.5" strokeWidth={1.8} />
      </button>
      {panel}
    </>
  );
}
