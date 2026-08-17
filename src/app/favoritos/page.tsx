"use client";

import { Heart, Play, Shuffle } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { usePlayer } from "@/context/PlayerContext";
import { useSongs } from "@/context/SongsContext";
import SongRow from "@/components/song/SongRow";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const { playQueueAt } = usePlayer();
  const { getSongById } = useSongs();
  const songs = favorites.map((id) => getSongById(id)).filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <PageHeader title="Favoritos" subtitle={`${songs.length} canciones guardadas`} />

      {songs.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No tienes canciones favoritas todavía"
          description="Toca el corazón en cualquier canción para guardarla aquí."
          actionLabel="Explorar canciones"
          actionHref="/canciones"
        />
      ) : (
        <>
          <div className="mb-6 flex gap-3">
            <button
              type="button"
              onClick={() => playQueueAt(songs, 0)}
              className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
            >
              <Play className="h-4 w-4" fill="currentColor" strokeWidth={0} /> Reproducir todo
            </button>
            <button
              type="button"
              onClick={() => playQueueAt([...songs].sort(() => Math.random() - 0.5), 0)}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover"
            >
              <Shuffle className="h-4 w-4" /> Aleatorio
            </button>
          </div>
          <div className="space-y-0.5">
            {songs.map((song, index) => (
              <SongRow key={song.id} song={song} index={index} queue={songs} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
