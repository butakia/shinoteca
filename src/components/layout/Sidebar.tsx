"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListMusic, Plus, ChevronDown, Sparkles, UploadCloud, LogIn, LogOut, ShieldCheck, Download, Music2 } from "lucide-react";
import clsx from "clsx";
import { primaryNavItems, donationNavItem } from "./nav-items";
import { usePlaylists } from "@/context/PlaylistsContext";
import { useSongs } from "@/context/SongsContext";
import { useAuth } from "@/context/AuthContext";
import { useArtistFilter } from "@/context/ArtistFilterContext";
import CoverImage from "@/components/media/CoverImage";
import Logo from "./Logo";

function OnlyShinoflowToggle() {
  const { onlyShinoflow, toggleOnlyShinoflow } = useArtistFilter();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={onlyShinoflow}
      onClick={toggleOnlyShinoflow}
      title="Muestra únicamente canciones de Shinoflow, ocultando las de otros artistas"
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground"
    >
      <Music2 className="h-4.5 w-4.5 shrink-0" strokeWidth={1.8} />
      <span className="min-w-0 flex-1 truncate">Solo Shinoflow</span>
      <span
        className={clsx(
          "relative h-5 w-9 shrink-0 rounded-full shadow-inner transition-colors",
          onlyShinoflow ? "bg-accent" : "bg-white/25"
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform",
            onlyShinoflow ? "translate-x-[18px]" : "translate-x-0.5"
          )}
        />
      </span>
    </button>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-background-elevated/80 backdrop-blur-xl lg:flex">
      <div className="px-6 py-6">
        <Logo height={44} />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {primaryNavItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent-soft text-white"
                  : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}

        <PlaylistsNavItem active={pathname?.startsWith("/playlists") ?? false} />
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/descargas"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <Download className="h-4.5 w-4.5" strokeWidth={1.8} />
          Mis descargas
        </Link>
        <OnlyShinoflowToggle />
        <Link
          href="/subir"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <UploadCloud className="h-4.5 w-4.5" strokeWidth={1.8} />
          Subir canción
        </Link>
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <ShieldCheck className="h-4.5 w-4.5" strokeWidth={1.8} />
            Administración
          </Link>
        )}
        {user ? (
          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <LogOut className="h-4.5 w-4.5" strokeWidth={1.8} />
            <span className="min-w-0 flex-1 truncate">{user.displayName}</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <LogIn className="h-4.5 w-4.5" strokeWidth={1.8} />
            Iniciar sesión
          </Link>
        )}
        <Link
          href="/premium"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <Sparkles className="h-4.5 w-4.5" strokeWidth={1.8} />
          Premium
        </Link>
        <Link
          href={donationNavItem.href}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <donationNavItem.icon className="h-4.5 w-4.5" strokeWidth={1.8} />
          {donationNavItem.label}
        </Link>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 px-3 text-[11px] text-foreground-muted/70">
          <Link href="/biodata" className="hover:text-foreground-muted">Biodata</Link>
          <Link href="/mision" className="hover:text-foreground-muted">Misión</Link>
          <Link href="/mensaje-para-el-club" className="hover:text-foreground-muted">Mensaje para el club</Link>
          <Link href="/creditos" className="hover:text-foreground-muted">Créditos</Link>
          <Link href="/derechos" className="hover:text-foreground-muted">Derechos</Link>
          <Link href="/terminos" className="hover:text-foreground-muted">Términos</Link>
          <Link href="/privacidad" className="hover:text-foreground-muted">Privacidad</Link>
        </div>
      </div>
    </aside>
  );
}

// "Mis playlists" as a click-to-expand accordion — a hover flyout doesn't work
// at all on touch devices (nothing to hover), and even with a mouse a quick
// click on the row navigated away before the flyout had a chance to show. A
// real expand/collapse list works identically for mouse and touch.
function PlaylistsNavItem({ active }: { active: boolean }) {
  const { playlists } = usePlaylists();
  const { getSongById } = useSongs();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={clsx(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          active ? "bg-accent-soft text-white" : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
        )}
      >
        <ListMusic className="h-4.5 w-4.5 shrink-0" strokeWidth={1.8} />
        <span className="min-w-0 flex-1 truncate text-left">Mis playlists</span>
        {playlists.length > 0 && (
          <span className="shrink-0 text-xs text-foreground-muted/70">{playlists.length}</span>
        )}
        <ChevronDown className={clsx("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="ml-3 mt-1 rounded-xl border border-border bg-background-elevated/60">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
              Mis playlists
            </span>
            <Link
              href="/playlists"
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-accent hover:bg-accent-soft"
            >
              <Plus className="h-3.5 w-3.5" /> Nueva
            </Link>
          </div>

          {playlists.length === 0 ? (
            <p className="px-3 py-4 text-xs text-foreground-muted">Todavía no tienes playlists.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto p-1.5">
              {playlists.map((p) => {
                const firstSong = p.songIds.length ? getSongById(p.songIds[0]) : undefined;
                return (
                  <li key={p.id}>
                    <Link
                      href={`/playlists/${p.id}`}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-surface-hover"
                    >
                      <div className="h-9 w-9 shrink-0">
                        <CoverImage src={firstSong?.coverUrl} title={p.name} size="xs" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{p.name}</p>
                        <p className="truncate text-[11px] text-foreground-muted">{p.songIds.length} canciones</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
