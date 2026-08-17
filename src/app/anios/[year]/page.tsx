"use client";

import { useParams } from "next/navigation";
import { useSongs } from "@/context/SongsContext";
import SongRow from "@/components/song/SongRow";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import PageDisabledNotice from "@/components/institutional/PageDisabledNotice";
import { CalendarDays } from "lucide-react";

export default function YearPage() {
  const params = useParams<{ year: string }>();
  const { getSongsByYear, getAvailableYears } = useSongs();
  const year = Number(params.year);

  if (!Number.isFinite(year) || !getAvailableYears().includes(year)) return <PageDisabledNotice />;

  const songs = getSongsByYear(year);

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <PageHeader title={String(year)} subtitle={`${songs.length} canciones de ${year}`} />
      {songs.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No hay canciones de este año" />
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
