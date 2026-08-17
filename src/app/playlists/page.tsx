"use client";

import { useState } from "react";
import Link from "next/link";
import { ListMusic, Plus } from "lucide-react";
import { usePlaylists } from "@/context/PlaylistsContext";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import CoverImage from "@/components/media/CoverImage";
import { useSongs } from "@/context/SongsContext";

export default function PlaylistsPage() {
  const { playlists, createPlaylist } = usePlaylists();
  const { getSongById } = useSongs();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createPlaylist(name.trim());
    setName("");
    setCreating(false);
  }

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <PageHeader title="Mis playlists" subtitle={`${playlists.length} playlists`} />
        <button
          type="button"
          onClick={() => setCreating((c) => !c)}
          className="flex h-fit items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" /> Nueva playlist
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="mb-6 flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la playlist"
            className="w-full max-w-sm rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
          />
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">
            Crear
          </button>
        </form>
      )}

      {playlists.length === 0 ? (
        <EmptyState icon={ListMusic} title="No tienes playlists" description="Crea tu primera playlist para empezar a organizar canciones." />
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {playlists.map((p) => {
            const firstSong = p.songIds.length ? getSongById(p.songIds[0]) : undefined;
            return (
              <Link key={p.id} href={`/playlists/${p.id}`} className="group">
                <CoverImage src={firstSong?.coverUrl} title={p.name} size="medium" className="shadow-lg" />
                <p className="mt-2 truncate text-sm font-medium text-foreground group-hover:underline">{p.name}</p>
                <p className="truncate text-xs text-foreground-muted">{p.songIds.length} canciones</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
