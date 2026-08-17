"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useSongs } from "@/context/SongsContext";
import { useNotices } from "@/context/NoticesContext";
import CoverImage from "@/components/media/CoverImage";
import SongDetailActions from "@/components/song/SongDetailActions";
import DownloadPanel from "@/components/song/DownloadPanel";
import CommentsSection from "@/components/song/CommentsSection";
import SongRow from "@/components/song/SongRow";
import PageDisabledNotice from "@/components/institutional/PageDisabledNotice";
import { releaseTypeLabels } from "@/lib/format";
import { getRelatedSection } from "@/lib/related";
import { ShieldAlert } from "lucide-react";

export default function SongDetailPage() {
  const params = useParams<{ id: string }>();
  const { getSongById, getSongsByAlbum, getAllSongs, getAlbumById } = useSongs();
  const { getNoticeText } = useNotices();
  const song = getSongById(params.id);
  if (!song) return <PageDisabledNotice />;

  const album = song.albumId ? getAlbumById(song.albumId) : undefined;
  const albumTracks = album ? getSongsByAlbum(album.id).filter((s) => s.id !== song.id) : [];
  const relatedSection = album ? null : getRelatedSection(song, getAllSongs());
  const related = album ? albumTracks : (relatedSection?.songs ?? []);
  const relatedTitle = album ? "Más de este álbum" : (relatedSection?.title ?? "También te puede interesar");
  const lyricsNotice = getNoticeText("lyrics");

  return (
    <div className="px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start gap-6 sm:flex-row">
        <div className="w-40 shrink-0 sm:w-56">
          <CoverImage src={song.coverUrl} title={song.title} size="large" priority />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            {releaseTypeLabels[song.releaseType]}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-4xl">{song.title}</h1>
          <p className="mt-2 text-sm text-foreground-muted">
            {song.alias ?? song.artist}
            {song.year ? ` · ${song.year}` : ""}
            {song.genre ? ` · ${song.genre}` : ""}
            {album && (
              <>
                {" · "}
                <Link href={`/albumes/${album.id}`} className="hover:text-foreground">
                  {album.title}
                </Link>
              </>
            )}
          </p>

          {song.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {song.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-surface px-2.5 py-1 text-[11px] text-foreground-muted">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {song.description && <p className="mt-4 max-w-xl text-sm text-foreground-muted">{song.description}</p>}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <SongDetailActions song={song} />
            <DownloadPanel song={song} />
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Letra</h2>
          {song.lyrics ? (
            <>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{song.lyrics}</p>
              {lyricsNotice && (
                <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-surface/60 p-3 text-xs text-foreground-muted">
                  <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p>{lyricsNotice}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-foreground-muted">Letra no disponible.</p>
          )}

          <h2 className="mb-3 mt-10 text-lg font-semibold text-foreground">Comentarios</h2>
          <CommentsSection songId={song.id} enabled={song.commentsEnabled} />
        </div>

        {related.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">{relatedTitle}</h2>
            <div className="space-y-0.5">
              {related.map((s, i) => (
                <SongRow key={s.id} song={s} index={i} queue={related} showAlbum={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
