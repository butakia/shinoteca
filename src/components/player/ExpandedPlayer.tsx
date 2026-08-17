"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ListMusic } from "lucide-react";
import clsx from "clsx";
import { usePlayer } from "@/context/PlayerContext";
import { useSongs } from "@/context/SongsContext";
import PlayerStage from "./PlayerStage";
import SidePanel, { type SidePanelTab } from "./SidePanel";
import PlayerAdSlot from "./PlayerAdSlot";
import Logo from "@/components/layout/Logo";
import SearchBar from "@/components/search/SearchBar";
import MobileMenu from "@/components/layout/MobileMenu";
import { getAlbumById } from "@/lib/data";
import { getRelatedSection } from "@/lib/related";
import { releaseTypeLabels } from "@/lib/format";

// The quick-expand overlay reachable from anywhere (mini player tap, "Ver
// cola", etc). Shares its central content with the standalone /play/[songId]
// page via PlayerStage + SidePanel — this file only owns the overlay chrome
// (header, mount/unmount, mobile bottom sheet).
export default function ExpandedPlayer() {
  const { currentSong, isExpanded, setExpanded } = usePlayer();
  const { getSongsByAlbum, getAllSongs } = useSongs();
  const pathname = usePathname();
  const [sidePanelTab, setSidePanelTab] = useState<SidePanelTab>("queue");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  // Framer Motion's AnimatePresence never calls its exit-complete callback in
  // this Next 16 / React 19 / Turbopack setup (verified with a minimal
  // reproduction outside this component too), so it can never unmount the
  // overlay on its own — clicking "Volver" would leave a dead, opacity-0,
  // pointer-events-blocking div stuck over the whole page. Mount/unmount is
  // driven manually instead: stay mounted while a CSS transition plays, then
  // unmount after it finishes.
  const [overlayMounted, setOverlayMounted] = useState(isExpanded);
  if (isExpanded && !overlayMounted) {
    setOverlayMounted(true);
  }

  useEffect(() => {
    if (isExpanded) return;
    const timeout = setTimeout(() => setOverlayMounted(false), 260);
    return () => clearTimeout(timeout);
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isExpanded, setExpanded]);

  // Links inside PlayerStage/SidePanel already close the overlay before
  // navigating, but the primary Sidebar/MobileNav links don't know this
  // overlay exists — clicking them while it's open changed the page
  // underneath without closing it, so the new page stayed invisible behind
  // this full-screen z-50 layer. Closing on every route change covers every
  // navigation source, not just the ones inside the player.
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setExpanded(false);
    }
  }, [pathname, setExpanded]);

  const relatedSection = useMemo(() => {
    if (!currentSong) return null;
    return getRelatedSection(currentSong, getAllSongs());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id, getAllSongs]);

  // /play/[songId] already renders the same stage+panel inline — showing the
  // overlay on top of it too would duplicate the whole player UI.
  const onOwnPlayPage = pathname?.startsWith("/play/");

  if (!currentSong || !overlayMounted || onOwnPlayPage) return null;

  const album = currentSong.albumId ? getAlbumById(currentSong.albumId) : undefined;
  const albumTracks = album ? getSongsByAlbum(album.id).filter((s) => s.id !== currentSong.id) : [];
  const related = relatedSection?.songs ?? [];
  const relatedTitle = relatedSection?.title ?? "También te puede interesar";

  function openPanel(tab: SidePanelTab) {
    setSidePanelTab(tab);
    setMobilePanelOpen(true);
  }

  return (
    <div
      // The bottom mobile nav bar (Inicio/Explorar/Buscar/Favoritos/Playlists)
      // must stay reachable even with the full player open — inset-0 used to
      // cover the whole screen including that bar. Stopping short of it via
      // the same --mobile-nav-height var the mini player already uses (0 on
      // desktop, where there's no bottom bar to begin with) leaves it visible
      // and tappable underneath.
      style={{ bottom: "var(--mobile-nav-height, 0px)" }}
      className={clsx(
        "fixed inset-x-0 top-0 z-50 flex flex-col bg-background transition-[opacity,transform] duration-[250ms] ease-out lg:left-64",
        isExpanded ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-10"
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-3 py-2.5 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <MobileMenu className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-foreground hover:bg-white/10 lg:hidden" />
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Volver"
            title="Volver"
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 py-2 pl-2.5 pr-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/10 sm:pr-3.5"
          >
            <ArrowLeft className="h-4.5 w-4.5" strokeWidth={2} />
            <span className="hidden sm:inline">Volver</span>
          </button>
          {/* Hidden on phones: the header already carries the menu, back and
              queue buttons, and squeezing the logo in too left the search box
              only ~150px wide — too narrow to type in or to anchor its
              results dropdown without it running off-screen. */}
          <Logo variant="icon" height={28} className="hidden shrink-0 sm:block" />
        </div>

        <div className="min-w-0 flex-1 px-1 sm:px-3">
          <SearchBar className="mx-auto max-w-md" />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => openPanel("queue")}
            aria-label="Ver cola de reproducción"
            title="Cola"
            className="rounded-full p-2 text-foreground-muted transition-colors hover:bg-white/5 hover:text-foreground lg:hidden"
          >
            <ListMusic className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="min-w-0 flex-1">
          <PlayerStage activeTab={sidePanelTab} onOpenTab={openPanel} onNavigate={() => setExpanded(false)} />
        </div>

        {/* persistent side panel on desktop */}
        <div className="hidden w-96 shrink-0 flex-col border-l border-border lg:flex">
          <div className="min-h-0 flex-1">
            <SidePanel
              tab={sidePanelTab}
              onTabChange={setSidePanelTab}
              song={currentSong}
              album={album}
              albumTracks={albumTracks}
              related={related}
              relatedTitle={relatedTitle}
            />
          </div>
          <PlayerAdSlot />
        </div>
      </div>

      {/* side panel as a bottom sheet on mobile/tablet */}
      <div
        className={clsx(
          "glass fixed inset-x-0 bottom-0 z-10 h-[75vh] rounded-t-2xl border-t border-border transition-transform duration-[250ms] ease-out lg:hidden",
          // `invisible` on top of the off-screen translate: this panel lives
          // inside the player's z-50 stacking context, so even the couple of
          // pixels of its rounded top edge that landed on the bottom nav bar
          // painted *over* it — which is what showed up as a stray red strip
          // (the autoplay switch) sitting on the navigation.
          mobilePanelOpen ? "translate-y-0" : "pointer-events-none invisible translate-y-full"
        )}
      >
        <SidePanel
          tab={sidePanelTab}
          onTabChange={setSidePanelTab}
          onClose={() => setMobilePanelOpen(false)}
          song={currentSong}
          album={album}
          albumTracks={albumTracks}
          related={related}
          relatedTitle={relatedTitle}
        />
      </div>
    </div>
  );
}
