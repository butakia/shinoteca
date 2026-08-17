"use client";

import Link from "next/link";
import { ListMusic } from "lucide-react";
import type { Song, Album } from "@/lib/types";
import SongRow from "@/components/song/SongRow";
import EmptyState from "@/components/common/EmptyState";
import { usePlayer } from "@/context/PlayerContext";

export default function RelatedTab({
  song,
  album,
  albumTracks,
  related,
  relatedTitle = "También te puede interesar",
}: {
  song: Song;
  album?: Album;
  albumTracks: Song[];
  related: Song[];
  relatedTitle?: string;
}) {
  const { setExpanded } = usePlayer();

  return (
    <div className="h-full overflow-y-auto px-3 py-3">
      {album && albumTracks.length > 0 && (
        <section className="mb-6">
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
              Más de {album.title}
            </h3>
            <Link
              href={`/albumes/${album.id}`}
              onClick={() => setExpanded(false)}
              className="text-[11px] text-foreground-muted hover:text-foreground"
            >
              Ver álbum
            </Link>
          </div>
          <div className="space-y-0.5">
            {albumTracks.slice(0, 8).map((s, i) => (
              <SongRow key={s.id} song={s} index={i} queue={[song, ...albumTracks]} showAlbum={false} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          {relatedTitle}
        </h3>
        {related.length === 0 ? (
          <EmptyState icon={ListMusic} title="Sin recomendaciones por ahora" />
        ) : (
          <div className="space-y-0.5">
            {related.slice(0, 8).map((s, i) => (
              <SongRow key={s.id} song={s} index={i} queue={related} showAlbum={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
