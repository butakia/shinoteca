"use client";

import { History, Play } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { useSongs } from "@/context/SongsContext";
import SongRow from "@/components/song/SongRow";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

export default function HistorialPage() {
  const { history, playQueueAt } = usePlayer();
  const { getSongById } = useSongs();
  const songs = history.map((id) => getSongById(id)).filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <PageHeader title="Historial" subtitle={`${songs.length} canciones escuchadas recientemente`} />

      {songs.length === 0 ? (
        <EmptyState
          icon={History}
          title="Todavía no has escuchado nada"
          description="Las canciones que reproduzcas aparecerán aquí para que continúes fácilmente."
          actionLabel="Explorar canciones"
          actionHref="/canciones"
        />
      ) : (
        <>
          <button
            type="button"
            onClick={() => playQueueAt(songs, 0)}
            className="mb-6 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
          >
            <Play className="h-4 w-4" fill="currentColor" strokeWidth={0} /> Reproducir todo
          </button>
          <div className="space-y-0.5">
            {songs.map((song, index) => (
              <SongRow key={`${song.id}-${index}`} song={song} index={index} queue={songs} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
