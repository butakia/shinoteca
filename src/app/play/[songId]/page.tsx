"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ListMusic } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { useSongs } from "@/context/SongsContext";
import PlayerStage from "@/components/player/PlayerStage";
import SidePanel, { type SidePanelTab } from "@/components/player/SidePanel";
import PageDisabledNotice from "@/components/institutional/PageDisabledNotice";
import { getAlbumById } from "@/lib/data";
import { getRelatedSection } from "@/lib/related";

// The standalone reproduction experience — a real page (not the Home feed
// with a player overlaid on top). Reuses the exact same PlayerStage/SidePanel
// as the quick-expand overlay, and the same single PlayerContext instance, so
// there's never a second <audio> element and playback survives navigating
// here from anywhere else in the app.
export default function PlayPage() {
  const params = useParams<{ songId: string }>();
  const { currentSong, playSong } = usePlayer();
  const { getSongById, getSongsByAlbum, getAllSongs } = useSongs();
  const [sidePanelTab, setSidePanelTab] = useState<SidePanelTab>("queue");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const song = getSongById(params.songId);

  useEffect(() => {
    if (song && currentSong?.id !== song.id) {
      playSong(song);
    }
    // Only re-run when the requested song actually changes — playSong
    // itself changes currentSong, which must not retrigger this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id]);

  if (!song) return <PageDisabledNotice />;

  // Until the effect above kicks playback over to this song, show its own
  // data rather than whatever was previously playing.
  const displaySong = currentSong?.id === song.id ? currentSong : song;
  const album = displaySong.albumId ? getAlbumById(displaySong.albumId) : undefined;
  const albumTracks = album ? getSongsByAlbum(album.id).filter((s) => s.id !== displaySong.id) : [];
  const relatedSection = getRelatedSection(displaySong, getAllSongs());

  function openPanel(tab: SidePanelTab) {
    setSidePanelTab(tab);
    setMobilePanelOpen(true);
  }

  return (
    <div className="flex h-[calc(100vh-var(--player-height,96px))] flex-col lg:h-[100vh] lg:flex-row">
      <div className="flex items-center justify-end border-b border-border/60 px-3 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => openPanel("queue")}
          aria-label="Ver cola de reproducción"
          title="Cola"
          className="rounded-full p-2 text-foreground-muted transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <ListMusic className="h-5 w-5" />
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <PlayerStage activeTab={sidePanelTab} onOpenTab={openPanel} />
      </div>

      {/* persistent side panel on desktop */}
      <div className="hidden w-96 shrink-0 border-l border-border lg:block">
        <SidePanel
          tab={sidePanelTab}
          onTabChange={setSidePanelTab}
          song={displaySong}
          album={album}
          albumTracks={albumTracks}
          related={relatedSection.songs}
          relatedTitle={relatedSection.title}
        />
      </div>

      {/* side panel as a bottom sheet on mobile/tablet */}
      <div
        className={
          "glass fixed inset-x-0 bottom-0 z-10 h-[75vh] rounded-t-2xl border-t border-border transition-transform duration-[250ms] ease-out lg:hidden " +
          (mobilePanelOpen ? "translate-y-0" : "pointer-events-none translate-y-full")
        }
      >
        <SidePanel
          tab={sidePanelTab}
          onTabChange={setSidePanelTab}
          onClose={() => setMobilePanelOpen(false)}
          song={displaySong}
          album={album}
          albumTracks={albumTracks}
          related={relatedSection.songs}
          relatedTitle={relatedSection.title}
        />
      </div>
    </div>
  );
}
