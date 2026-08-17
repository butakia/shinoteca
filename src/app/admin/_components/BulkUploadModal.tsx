"use client";

import { useRef, useState } from "react";
import { X, Upload, Music, ImagePlus, AlertTriangle, Loader2, CheckCircle2, Trash2, Sparkles } from "lucide-react";
import clsx from "clsx";
import { useSongs } from "@/context/SongsContext";
import { uploadSongAction } from "@/lib/upload-actions";
import { releaseTypeLabels } from "@/lib/format";
import { suggestTitleFromFilename } from "@/lib/title-suggest";
import type { ReleaseType } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50";
const smallInputClass =
  "w-full rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-foreground outline-none focus:border-accent/50";

type TrackDraft = {
  file: File;
  title: string;
  trackNumber?: number;
  originalName: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      resolve(Number.isFinite(audio.duration) ? audio.duration : 0);
      URL.revokeObjectURL(url);
    });
    audio.addEventListener("error", () => {
      resolve(0);
      URL.revokeObjectURL(url);
    });
  });
}

// Album/multi-track upload: pick many audio files at once, review every
// auto-suggested title in an editable table, then publish them together.
// Uses the same per-song server action as the single upload, one call per
// track, so moderation/third-party/storage behaviour stays identical.
export default function BulkUploadModal({ onClose }: { onClose: () => void }) {
  const { refreshUploadedSongs } = useSongs();
  const [artist, setArtist] = useState("");
  const [albumName, setAlbumName] = useState("");
  const [releaseType, setReleaseType] = useState<ReleaseType>("lp");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [isThirdParty, setIsThirdParty] = useState(false);
  const [tracks, setTracks] = useState<TrackDraft[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState<{ ok: number; failed: number; pending: boolean } | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList) {
    const incoming = Array.from(fileList);
    const drafts: TrackDraft[] = incoming.map((file) => {
      const suggestion = suggestTitleFromFilename(file.name);
      return {
        file,
        title: suggestion.feat ? `${suggestion.title} (feat. ${suggestion.feat})` : suggestion.title,
        trackNumber: suggestion.trackNumber,
        originalName: file.name,
        status: "pending",
      };
    });
    // Sort by detected track number when present, so an album lands in its
    // real running order instead of the OS's alphabetical file order.
    drafts.sort((a, b) => (a.trackNumber ?? 999) - (b.trackNumber ?? 999));
    setTracks((prev) => [...prev, ...drafts]);

    // Infer the album-wide artist from the filenames if it wasn't typed yet.
    if (!artist.trim()) {
      const firstWithArtist = incoming
        .map((f) => suggestTitleFromFilename(f.name).artist)
        .find((a): a is string => !!a);
      if (firstWithArtist) setArtist(firstWithArtist);
    }
  }

  function pickCover(file: File) {
    setCoverFile(file);
    fileToDataUrl(file).then(setCoverPreview);
  }

  function updateTrack(index: number, patch: Partial<TrackDraft>) {
    setTracks((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function removeTrack(index: number) {
    setTracks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!artist.trim()) return setError("Indica el artista del álbum.");
    if (tracks.length === 0) return setError("Selecciona al menos un archivo de audio.");
    if (tracks.some((t) => !t.title.trim())) return setError("Todas las canciones necesitan un título.");

    setSubmitting(true);
    const coverBase64 = coverFile ? await fileToDataUrl(coverFile) : undefined;
    let ok = 0;
    let failed = 0;
    let anyPending = false;

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      if (track.status === "done") continue;
      updateTrack(i, { status: "uploading", error: undefined });
      try {
        const duration = await readAudioDuration(track.file);
        const audioBase64 = await fileToDataUrl(track.file);
        const result = await uploadSongAction({
          title: track.title.trim(),
          artist: artist.trim(),
          releaseType,
          year: year ? Number(year) : undefined,
          genre: genre || undefined,
          duration,
          tags: albumName.trim() ? [albumName.trim()] : [],
          isThirdParty,
          audioBase64,
          audioFileName: track.file.name,
          audioMimeType: track.file.type,
          coverBase64,
          coverFileName: coverFile?.name,
        });
        if (result.error) {
          failed++;
          updateTrack(i, { status: "error", error: result.error });
        } else {
          ok++;
          if (result.pending) anyPending = true;
          updateTrack(i, { status: "done" });
        }
      } catch {
        failed++;
        updateTrack(i, { status: "error", error: "No se pudo subir esta canción." });
      }
    }

    await refreshUploadedSongs();
    setSubmitting(false);
    setFinished({ ok, failed, pending: anyPending });
  }

  if (finished) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="glass flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl p-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" />
          <p className="text-sm font-semibold text-foreground">
            {finished.ok} canción{finished.ok === 1 ? "" : "es"} subida{finished.ok === 1 ? "" : "s"}
          </p>
          {finished.failed > 0 && (
            <p className="text-sm text-danger">{finished.failed} no se pudieron subir. Revisa la lista.</p>
          )}
          {finished.pending && (
            <p className="text-sm text-foreground-muted">
              Quedaron pendientes de aprobación. Se publicarán cuando un administrador las revise.
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="mt-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent/90"
          >
            Listo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="glass flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Subir álbum o varias canciones</p>
            <p className="text-[11px] text-foreground-muted">
              Los títulos se sugieren automáticamente desde el nombre del archivo — revísalos antes de publicar.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-foreground-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-foreground">Artista</label>
              <input value={artist} onChange={(e) => setArtist(e.target.value)} className={inputClass} required />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-foreground">Álbum (opcional)</label>
              <input value={albumName} onChange={(e) => setAlbumName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Tipo</label>
              <select value={releaseType} onChange={(e) => setReleaseType(e.target.value as ReleaseType)} className={inputClass}>
                {Object.entries(releaseTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Año</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Género</label>
              <input value={genre} onChange={(e) => setGenre(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Carátula del álbum</label>
              <div className="flex items-center gap-2">
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-surface hover:border-accent/50"
                >
                  {coverPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="h-4 w-4 text-foreground-muted" />
                  )}
                </div>
                <span className="truncate text-[11px] text-foreground-muted">
                  {coverFile ? coverFile.name : "Se aplica a todas"}
                </span>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) pickCover(file);
                  }}
                />
              </div>
            </div>
          </section>

          <label className="flex items-start gap-2.5 rounded-lg border border-border bg-surface/50 p-3 text-xs text-foreground-muted">
            <input
              type="checkbox"
              checked={isThirdParty}
              onChange={(e) => setIsThirdParty(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--accent)]"
            />
            <span>
              Estas canciones pertenecen a <strong className="text-foreground">otro artista</strong>, no a Shinoflow.
            </span>
          </label>

          <section>
            <div
              onClick={() => audioInputRef.current?.click()}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border px-4 py-4 text-sm text-foreground-muted hover:border-accent/50"
            >
              <Music className="h-5 w-5 shrink-0" />
              <span>Haz clic para seleccionar varios archivos de audio (MP3, WAV, OGG, FLAC — máx. 40MB c/u)</span>
              <input
                ref={audioInputRef}
                type="file"
                multiple
                accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/flac,audio/mp4"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
          </section>

          {tracks.length > 0 && (
            <section>
              <p className="mb-2 flex items-center gap-1.5 text-xs text-foreground-muted">
                <Sparkles className="h-3 w-3 shrink-0 text-accent" />
                {tracks.length} canciones — los títulos son sugerencias editables
              </p>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-surface/60 text-[11px] uppercase tracking-wide text-foreground-muted">
                    <tr>
                      <th className="w-14 px-3 py-2">Nº</th>
                      <th className="px-3 py-2">Título sugerido</th>
                      <th className="px-3 py-2">Archivo original</th>
                      <th className="w-24 px-3 py-2">Estado</th>
                      <th className="w-10 px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {tracks.map((track, i) => (
                      <tr key={`${track.originalName}-${i}`} className="border-t border-border">
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={track.trackNumber ?? ""}
                            onChange={(e) =>
                              updateTrack(i, { trackNumber: e.target.value ? Number(e.target.value) : undefined })
                            }
                            className={smallInputClass}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={track.title}
                            onChange={(e) => updateTrack(i, { title: e.target.value })}
                            className={smallInputClass}
                          />
                        </td>
                        <td className="max-w-[220px] px-3 py-2">
                          <span className="block truncate text-[11px] text-foreground-muted" title={track.originalName}>
                            {track.originalName}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {track.status === "uploading" && (
                            <span className="flex items-center gap-1 text-[11px] text-accent">
                              <Loader2 className="h-3 w-3 animate-spin" /> Subiendo
                            </span>
                          )}
                          {track.status === "done" && (
                            <span className="flex items-center gap-1 text-[11px] text-success">
                              <CheckCircle2 className="h-3 w-3" /> Lista
                            </span>
                          )}
                          {track.status === "error" && (
                            <span className="flex items-center gap-1 text-[11px] text-danger" title={track.error}>
                              <AlertTriangle className="h-3 w-3" /> Error
                            </span>
                          )}
                          {track.status === "pending" && (
                            <span className="text-[11px] text-foreground-muted">Pendiente</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => removeTrack(i)}
                            disabled={submitting}
                            aria-label={`Quitar ${track.title}`}
                            className="rounded-full p-1.5 text-foreground-muted hover:bg-danger/10 hover:text-danger disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-danger">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || tracks.length === 0}
            className={clsx(
              "flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent/90",
              (submitting || tracks.length === 0) && "opacity-60"
            )}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {submitting ? "Subiendo…" : `Publicar ${tracks.length || ""} canciones`}
          </button>
        </div>
      </form>
    </div>
  );
}
