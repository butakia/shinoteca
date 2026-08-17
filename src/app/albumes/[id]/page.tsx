"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getArtistById } from "@/lib/data";
import { useSongs } from "@/context/SongsContext";
import CoverImage from "@/components/media/CoverImage";
import SongRow from "@/components/song/SongRow";
import AlbumActions from "@/components/song/AlbumActions";
import EmptyState from "@/components/common/EmptyState";
import PageDisabledNotice from "@/components/institutional/PageDisabledNotice";
import { releaseTypeLabels, formatDuration } from "@/lib/format";
import { Disc3 } from "lucide-react";

export default function AlbumPage() {
  const params = useParams<{ id: string }>();
  const { getSongsByAlbum, getAlbumById } = useSongs();
  const album = getAlbumById(params.id);
  if (!album) return <PageDisabledNotice />;

  const songs = getSongsByAlbum(album.id);
  const artist = getArtistById(album.artistId);
  const totalSeconds = songs.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end">
        <div className="w-40 shrink-0 sm:w-56">
          <CoverImage src={album.coverUrl} title={album.title} size="large" priority />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            {releaseTypeLabels[album.releaseType]}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-4xl">{album.title}</h1>
          <p className="mt-2 text-sm text-foreground-muted">
            {artist && (
              <Link href={`/explorar`} className="hover:text-foreground">
                {artist.name}
              </Link>
            )}
            {album.year ? ` · ${album.year}` : ""} · {songs.length} canciones ·{" "}
            {formatDuration(totalSeconds)}
          </p>
          {album.description && <p className="mt-3 max-w-xl text-sm text-foreground-muted">{album.description}</p>}
        </div>
      </div>

      <div className="mt-6">
        <AlbumActions songs={songs} />
      </div>

      <div className="mt-8">
        {songs.length === 0 ? (
          <EmptyState icon={Disc3} title="Este álbum todavía no tiene canciones" />
        ) : (
          <div className="space-y-0.5">
            {songs.map((song, index) => (
              <SongRow key={song.id} song={song} index={index} queue={songs} showAlbum={false} />
            ))}
          </div>
        )}
      </div>

      {album.credits && (
        <div className="mt-10 border-t border-border pt-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">Créditos</h2>
          <p className="text-sm text-foreground-muted">{album.credits}</p>
        </div>
      )}
    </div>
  );
}
