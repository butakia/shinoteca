"use client";

import clsx from "clsx";
import { useSongs } from "@/context/SongsContext";
import { useArtistFilter } from "@/context/ArtistFilterContext";
import SongRow from "@/components/song/SongRow";
import PageHeader from "@/components/common/PageHeader";

export default function SongsPage() {
  const { getAllSongs } = useSongs();
  // The filter itself now lives in ArtistFilterContext and is applied inside
  // getAllSongs, so this page shows the already-filtered list; these buttons
  // just drive the same site-wide switch that's in the menu.
  const { onlyShinoflow, setOnlyShinoflow } = useArtistFilter();
  const songs = getAllSongs();

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <PageHeader title="Todas las canciones" subtitle={`${songs.length} canciones publicadas`} />

      <div className="mb-4 flex w-fit rounded-full border border-border bg-surface p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setOnlyShinoflow(true)}
          className={clsx(
            "rounded-full px-3.5 py-1.5 transition-colors",
            onlyShinoflow ? "bg-accent text-white" : "text-foreground-muted hover:text-foreground"
          )}
        >
          Solo Shinoflow
        </button>
        <button
          type="button"
          onClick={() => setOnlyShinoflow(false)}
          className={clsx(
            "rounded-full px-3.5 py-1.5 transition-colors",
            !onlyShinoflow ? "bg-accent text-white" : "text-foreground-muted hover:text-foreground"
          )}
        >
          Todos los artistas
        </button>
      </div>

      <div className="space-y-0.5">
        {songs.map((song, index) => (
          <SongRow key={song.id} song={song} index={index} queue={songs} />
        ))}
      </div>
    </div>
  );
}
