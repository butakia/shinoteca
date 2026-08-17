"use client";

import { useParams } from "next/navigation";
import { useSongs } from "@/context/SongsContext";
import SongRow from "@/components/song/SongRow";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import PageDisabledNotice from "@/components/institutional/PageDisabledNotice";
import { releaseTypeLabels } from "@/lib/format";
import { Disc3 } from "lucide-react";
import type { ReleaseType } from "@/lib/types";

const validTypes = Object.keys(releaseTypeLabels);

export default function ReleaseTypePage() {
  const params = useParams<{ type: string }>();
  const { getSongsByReleaseType } = useSongs();

  if (!validTypes.includes(params.type)) return <PageDisabledNotice />;

  const songs = getSongsByReleaseType(params.type as ReleaseType);
  const label = releaseTypeLabels[params.type];

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <PageHeader title={label} subtitle={`${songs.length} canciones`} />
      {songs.length === 0 ? (
        <EmptyState icon={Disc3} title={`Todavía no hay canciones en ${label.toLowerCase()}`} />
      ) : (
        <div className="space-y-0.5">
          {songs.map((song, index) => (
            <SongRow key={song.id} song={song} index={index} queue={songs} />
          ))}
        </div>
      )}
    </div>
  );
}
