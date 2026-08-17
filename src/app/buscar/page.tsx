"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { useSongs } from "@/context/SongsContext";
import SongRow from "@/components/song/SongRow";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import SearchBar from "@/components/search/SearchBar";

function SearchResults() {
  const { searchSongs } = useSongs();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const results = q ? searchSongs(q) : [];

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <PageHeader title="Buscar" subtitle={q ? `Resultados para "${q}"` : "Escribe algo para empezar"} />
      <div className="mb-6 lg:hidden">
        <SearchBar className="max-w-full" />
      </div>
      {q && results.length === 0 && (
        <EmptyState icon={Search} title={`Sin resultados para "${q}"`} description="Prueba con otro título, álbum, año o etiqueta." />
      )}
      {results.length > 0 && (
        <div className="space-y-0.5">
          {results.map((song, index) => (
            <SongRow key={song.id} song={song} index={index} queue={results} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}
