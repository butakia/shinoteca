"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { useSongs } from "@/context/SongsContext";
import SongCard from "@/components/song/SongCard";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { Compass } from "lucide-react";
import AdBanner from "@/components/ads/AdBanner";
import { releaseTypeLabels } from "@/lib/format";
import type { ReleaseType } from "@/lib/types";

const releaseTypes = Object.keys(releaseTypeLabels) as ReleaseType[];

export default function ExplorePage() {
  const { getAllSongs, getAvailableYears } = useSongs();
  const allSongs = getAllSongs();
  const years = getAvailableYears();
  const genres = useMemo(
    () => Array.from(new Set(allSongs.map((s) => s.genre).filter((g): g is string => !!g))),
    [allSongs]
  );
  const [type, setType] = useState<ReleaseType | "all">("all");
  const [year, setYear] = useState<number | "all">("all");
  const [genre, setGenre] = useState<string | "all">("all");

  const filtered = useMemo(
    () =>
      allSongs.filter(
        (s) =>
          (type === "all" || s.releaseType === type) &&
          (year === "all" || s.year === year) &&
          (genre === "all" || s.genre === genre)
      ),
    [allSongs, type, year, genre]
  );

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <PageHeader title="Explorar" subtitle="Filtra el archivo por tipo, año o género" />

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip active={type === "all"} onClick={() => setType("all")}>
          Todos los tipos
        </FilterChip>
        {releaseTypes.map((t) => (
          <FilterChip key={t} active={type === t} onClick={() => setType(t)}>
            {releaseTypeLabels[t]}
          </FilterChip>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip active={year === "all"} onClick={() => setYear("all")}>
          Todos los años
        </FilterChip>
        {years.map((y) => (
          <FilterChip key={y} active={year === y} onClick={() => setYear(y)}>
            {y}
          </FilterChip>
        ))}
      </div>

      {genres.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <FilterChip active={genre === "all"} onClick={() => setGenre("all")}>
            Todos los géneros
          </FilterChip>
          {genres.map((g) => (
            <FilterChip key={g} active={genre === g} onClick={() => setGenre(g)}>
              {g}
            </FilterChip>
          ))}
        </div>
      )}

      <AdBanner slot="explorar-1" padded={false} />

      {filtered.length === 0 ? (
        <EmptyState icon={Compass} title="No hay canciones con estos filtros" description="Prueba con otra combinación." />
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((song) => (
            <SongCard key={song.id} song={song} queue={filtered} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-accent bg-accent-soft text-white"
          : "border-border text-foreground-muted hover:border-white/20 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
