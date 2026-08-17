"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, ListChecks } from "lucide-react";
import clsx from "clsx";
import { useSongs, getAlbumById } from "@/context/SongsContext";
import { releaseTypeLabels } from "@/lib/format";
import type { Song } from "@/lib/types";

const inputClass =
  "w-full rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-foreground outline-none focus:border-accent/50";

function missingFields(song: Song): string[] {
  const missing: string[] = [];
  if (!song.genre?.trim()) missing.push("género");
  if (!song.year) missing.push("año");
  if (song.tags.length === 0) missing.push("etiquetas");
  if (!song.description?.trim()) missing.push("descripción");
  return missing;
}

// A dedicated metadata pass — the "editar canción" modal already covers every
// field, but going through it one song at a time isn't realistic when most of
// a freshly-imported catalog is missing the same field (genre, in practice —
// scripts/import-music.mjs never populates it). This view surfaces exactly
// what's incomplete and lets an admin fix many songs' genre/tags at once.
export default function AdminMetadata() {
  const { allSongsIncludingUnpublished, updateSong } = useSongs();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkGenre, setBulkGenre] = useState("");
  const [bulkTag, setBulkTag] = useState("");
  const [onlyIncomplete, setOnlyIncomplete] = useState(true);

  const songs = allSongsIncludingUnpublished;

  const { genreOptions, tagOptions } = useMemo(() => {
    const genres = new Set<string>();
    const tags = new Set<string>();
    songs.forEach((s) => {
      if (s.genre?.trim()) genres.add(s.genre.trim());
      s.tags.forEach((t) => tags.add(t));
    });
    return { genreOptions: Array.from(genres).sort(), tagOptions: Array.from(tags).sort() };
  }, [songs]);

  const rows = useMemo(() => {
    return songs
      .map((song) => ({ song, missing: missingFields(song) }))
      .filter((r) => !onlyIncomplete || r.missing.length > 0)
      .sort((a, b) => b.missing.length - a.missing.length);
  }, [songs, onlyIncomplete]);

  const incompleteCount = songs.filter((s) => missingFields(s).length > 0).length;
  const missingGenreCount = songs.filter((s) => !s.genre?.trim()).length;

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.song.id))));
  }

  function applyBulkGenre() {
    if (!bulkGenre.trim() || selected.size === 0) return;
    selected.forEach((id) => updateSong(id, { genre: bulkGenre.trim() }));
    setBulkGenre("");
    setSelected(new Set());
  }

  function applyBulkTag() {
    if (!bulkTag.trim() || selected.size === 0) return;
    const tag = bulkTag.trim();
    selected.forEach((id) => {
      const song = songs.find((s) => s.id === id);
      if (!song || song.tags.includes(tag)) return;
      updateSong(id, { tags: [...song.tags, tag] });
    });
    setBulkTag("");
    setSelected(new Set());
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Canciones totales" value={songs.length} />
        <StatCard label="Con metadatos incompletos" value={incompleteCount} warn={incompleteCount > 0} />
        <StatCard label="Sin género" value={missingGenreCount} warn={missingGenreCount > 0} />
        <StatCard label="Géneros distintos en uso" value={genreOptions.length} />
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-foreground-muted">
          <input
            type="checkbox"
            checked={onlyIncomplete}
            onChange={(e) => setOnlyIncomplete(e.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--accent)]"
          />
          Mostrar solo canciones con metadatos incompletos
        </label>
        <span className="text-xs text-foreground-muted">{selected.size} seleccionadas</span>
      </div>

      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-accent/30 bg-accent-soft/40 p-3">
          <ListChecks className="h-4 w-4 shrink-0 text-accent" />
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <input
              list="genre-options"
              value={bulkGenre}
              onChange={(e) => setBulkGenre(e.target.value)}
              placeholder="Asignar género a la selección…"
              className={`${inputClass} max-w-[220px]`}
            />
            <button
              type="button"
              onClick={applyBulkGenre}
              disabled={!bulkGenre.trim()}
              className="rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90 disabled:opacity-40"
            >
              Aplicar género
            </button>
            <input
              list="tag-options"
              value={bulkTag}
              onChange={(e) => setBulkTag(e.target.value)}
              placeholder="Añadir etiqueta a la selección…"
              className={`${inputClass} max-w-[220px]`}
            />
            <button
              type="button"
              onClick={applyBulkTag}
              disabled={!bulkTag.trim()}
              className="rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90 disabled:opacity-40"
            >
              Añadir etiqueta
            </button>
          </div>
        </div>
      )}

      <datalist id="genre-options">
        {genreOptions.map((g) => (
          <option key={g} value={g} />
        ))}
      </datalist>
      <datalist id="tag-options">
        {tagOptions.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-surface/60 text-xs uppercase tracking-wide text-foreground-muted">
            <tr>
              <th className="w-8 px-3 py-3">
                <input
                  type="checkbox"
                  checked={rows.length > 0 && selected.size === rows.length}
                  onChange={toggleSelectAll}
                  className="h-3.5 w-3.5 accent-[var(--accent)]"
                />
              </th>
              <th className="px-3 py-3">Canción</th>
              <th className="px-3 py-3">Año</th>
              <th className="px-3 py-3">Género</th>
              <th className="px-3 py-3">Etiquetas</th>
              <th className="px-3 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ song, missing }) => {
              const album = song.albumId ? getAlbumById(song.albumId) : undefined;
              return (
                <tr key={song.id} className="border-t border-border align-top">
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(song.id)}
                      onChange={() => toggleSelected(song.id)}
                      className="h-3.5 w-3.5 accent-[var(--accent)]"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="truncate font-medium text-foreground">{song.title}</p>
                    <p className="truncate text-[11px] text-foreground-muted">
                      {song.artist} {album ? `· ${album.title}` : `· ${releaseTypeLabels[song.releaseType]}`}
                    </p>
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      defaultValue={song.year ?? ""}
                      onBlur={(e) => {
                        const value = e.target.value ? Number(e.target.value) : undefined;
                        if (value !== song.year) updateSong(song.id, { year: value });
                      }}
                      className={`${inputClass} w-20`}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      list="genre-options"
                      defaultValue={song.genre ?? ""}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value !== (song.genre ?? "")) updateSong(song.id, { genre: value || undefined });
                      }}
                      placeholder="Sin género"
                      className={`${inputClass} w-32`}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      defaultValue={song.tags.join(", ")}
                      onBlur={(e) => {
                        const value = e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean);
                        if (value.join(",") !== song.tags.join(",")) updateSong(song.id, { tags: value });
                      }}
                      placeholder="Sin etiquetas"
                      className={`${inputClass} w-40`}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    {missing.length === 0 ? (
                      <span className="flex items-center gap-1 text-[11px] text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Completo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-amber-400" title={`Falta: ${missing.join(", ")}`}>
                        <AlertCircle className="h-3.5 w-3.5" /> Falta {missing.join(", ")}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-sm text-foreground-muted">
                  {onlyIncomplete ? "Todas las canciones tienen los metadatos completos." : "No hay canciones."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className={clsx("rounded-xl border p-3", warn ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-surface/40")}>
      <p className={clsx("text-2xl font-bold", warn ? "text-amber-400" : "text-foreground")}>{value}</p>
      <p className="text-[11px] text-foreground-muted">{label}</p>
    </div>
  );
}
