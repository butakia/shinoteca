"use client";

import Link from "next/link";
import { Mic2 } from "lucide-react";
import { useSongs } from "@/context/SongsContext";
import PageHeader from "@/components/common/PageHeader";

export default function ArtistasPage() {
  const { getAllSongs } = useSongs();
  const songs = getAllSongs();

  const artists = new Map<string, { name: string; count: number }>();
  songs.forEach((song) => {
    const key = song.artist.trim().toLowerCase();
    const existing = artists.get(key);
    if (existing) existing.count += 1;
    else artists.set(key, { name: song.alias ?? song.artist, count: 1 });
  });
  const sorted = Array.from(artists.values()).sort((a, b) => b.count - a.count);

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <PageHeader title="Artistas" subtitle={`${sorted.length} artistas en el archivo`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {sorted.map((artist) => (
          <Link
            key={artist.name}
            href={`/buscar?q=${encodeURIComponent(artist.name)}`}
            className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center transition-colors hover:bg-surface-hover"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
              <Mic2 className="h-6 w-6 text-accent" />
            </div>
            <p className="truncate text-sm font-medium text-foreground">{artist.name}</p>
            <p className="text-xs text-foreground-muted">{artist.count} canciones</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
