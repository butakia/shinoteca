"use client";

import { useRef, useState } from "react";
import { X, Upload, Music, ImagePlus, AlertTriangle, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { useSongs } from "@/context/SongsContext";
import { uploadSongAction } from "@/lib/upload-actions";
import { releaseTypeLabels } from "@/lib/format";
import { suggestTitleFromFilename } from "@/lib/title-suggest";
import type { ReleaseType } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Reads real playback duration in the browser (an <audio> element handles any
// format the browser can play) instead of parsing file headers server-side.
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

export default function UploadSongModal({ onClose }: { onClose: () => void }) {
  const { refreshUploadedSongs } = useSongs();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [alias, setAlias] = useState("");
  const [releaseType, setReleaseType] = useState<ReleaseType>("single");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [isThirdParty, setIsThirdParty] = useState(false);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [titleWasSuggested, setTitleWasSuggested] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // A clean guess at the real song title from the raw filename — shown
  // directly in the editable "Título" field, never applied silently. The
  // admin can freely overwrite it; picking a new file only re-suggests if
  // the title field hasn't been hand-edited away from the previous guess.
  function handlePickAudioFile(file: File) {
    setAudioFile(file);
    if (!title.trim() || titleWasSuggested) {
      const suggestion = suggestTitleFromFilename(file.name);
      setTitle(suggestion.title);
      setTitleWasSuggested(true);
      if (suggestion.artist && !artist.trim()) setArtist(suggestion.artist);
      if (suggestion.feat) setTitle((t) => `${t} (feat. ${suggestion.feat})`);
    }
  }

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState(false);

  function pickCover(file: File) {
    setCoverFile(file);
    fileToDataUrl(file).then(setCoverPreview);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("El título no puede estar vacío.");
    if (!artist.trim()) return setError("El artista no puede estar vacío.");
    if (!audioFile) return setError("Selecciona un archivo de audio.");

    setSubmitting(true);
    try {
      const duration = await readAudioDuration(audioFile);
      const audioBase64 = await fileToDataUrl(audioFile);
      const coverBase64 = coverFile ? await fileToDataUrl(coverFile) : undefined;

      const result = await uploadSongAction({
        title,
        artist,
        alias: alias || undefined,
        releaseType,
        year: year ? Number(year) : undefined,
        genre: genre || undefined,
        duration,
        lyrics: lyrics || undefined,
        description: description || undefined,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        isThirdParty,
        audioBase64,
        audioFileName: audioFile.name,
        audioMimeType: audioFile.type,
        coverBase64,
        coverFileName: coverFile?.name,
      });

      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      await refreshUploadedSongs();
      if (result.pending) {
        setSubmitting(false);
        setPendingNotice(true);
      } else {
        onClose();
      }
    } catch {
      setError("No se pudo subir la canción. Intenta de nuevo.");
      setSubmitting(false);
    }
  }

  if (pendingNotice) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="glass flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl p-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" />
          <p className="text-sm font-semibold text-foreground">Canción enviada</p>
          <p className="text-sm text-foreground-muted">
            Tu canción quedó pendiente de aprobación. Se publicará en el archivo en cuanto un
            administrador la revise.
          </p>
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
      <form onSubmit={handleSubmit} className="glass flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-sm font-semibold text-foreground">Subir canción</p>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-foreground-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-muted">Archivo de audio</h3>
            <div
              onClick={() => audioInputRef.current?.click()}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border px-4 py-4 text-sm text-foreground-muted hover:border-accent/50"
            >
              <Music className="h-5 w-5 shrink-0" />
              {audioFile ? (
                <span className="truncate text-foreground">{audioFile.name}</span>
              ) : (
                <span>Haz clic para seleccionar un archivo (MP3, WAV, OGG, FLAC — máx. 40MB)</span>
              )}
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/flac,audio/mp4"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePickAudioFile(file);
                }}
              />
            </div>
            {titleWasSuggested && audioFile && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-foreground-muted">
                <Sparkles className="h-3 w-3 shrink-0 text-accent" />
                Título sugerido a partir de &ldquo;{audioFile.name}&rdquo; — revísalo antes de guardar.
              </p>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-muted">Carátula (opcional)</h3>
            <div className="flex items-center gap-4">
              <div
                onClick={() => coverInputRef.current?.click()}
                className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-surface hover:border-accent/50"
              >
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-5 w-5 text-foreground-muted" />
                )}
              </div>
              <p className="text-xs text-foreground-muted">JPG, PNG, WebP o AVIF — máx. 8MB. Sin carátula se usa el diseño predeterminado.</p>
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
          </section>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Título">
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleWasSuggested(false);
                }}
                className={inputClass}
                required
              />
            </Field>
            <Field label="Artista">
              <input value={artist} onChange={(e) => setArtist(e.target.value)} className={inputClass} required />
            </Field>
            <Field label="Alias artístico">
              <input value={alias} onChange={(e) => setAlias(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Tipo de lanzamiento">
              <select value={releaseType} onChange={(e) => setReleaseType(e.target.value as ReleaseType)} className={inputClass}>
                {Object.entries(releaseTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Año">
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Género">
              <input value={genre} onChange={(e) => setGenre(e.target.value)} className={inputClass} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Etiquetas (separadas por coma)">
                <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
              </Field>
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
              Esta canción pertenece a <strong className="text-foreground">otro artista</strong>, no a Shinoflow.
              El archivo está centrado en Shinoflow, pero quienes quieran escuchar solo eso podrán filtrar estas
              canciones aparte.
            </span>
          </label>

          <Field label="Descripción">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
          </Field>

          <Field label="Letra">
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={4}
              placeholder="Sin letra cargada — se mostrará “Letra no disponible”."
              className={`${inputClass} resize-none`}
            />
          </Field>

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
            disabled={submitting}
            className="flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {submitting ? "Subiendo…" : "Subir canción"}
          </button>
        </div>
      </form>
    </div>
  );
}
