"use client";

import { useRef, useState } from "react";
import {
  Pencil,
  Trash2,
  RotateCcw,
  Plus,
  X,
  Upload,
  Link2,
  ImageOff,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Music,
  Check,
} from "lucide-react";
import { useSongs } from "@/context/SongsContext";
import { deleteUploadedSongAction, approveUploadedSongAction, uploadCoverImageAction } from "@/lib/upload-actions";
import CoverImage from "@/components/media/CoverImage";
import { releaseTypeLabels, formatDuration } from "@/lib/format";
import type { Song, AudioSource } from "@/lib/types";
import Link from "next/link";
import UploadSongModal from "./UploadSongModal";
import BulkUploadModal from "./BulkUploadModal";

export default function AdminSongs() {
  const {
    allSongsIncludingUnpublished,
    updateSong,
    deleteSong,
    restoreSong,
    resetSong,
    isEdited,
    isDeleted,
    lastEditedAt,
    refreshUploadedSongs,
    allAlbums,
  } = useSongs();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const songs = allSongsIncludingUnpublished;
  const editingSong = songs.find((s) => s.id === editingId) ?? null;

  // Songs uploaded through the admin panel live in the real database (id
  // prefixed "up-") — deleting those has to hit the server, not the
  // localStorage soft-delete used for the static demo catalog, or the "delete"
  // would only be visible in the admin's own browser.
  async function handleDelete(song: Song) {
    if (!window.confirm(`¿Eliminar "${song.title}"? ${song.id.startsWith("up-") ? "Esto no se puede deshacer." : "Se ocultará del sitio pero podrás restaurarla."}`)) {
      return;
    }
    if (song.id.startsWith("up-")) {
      await deleteUploadedSongAction(song.id.slice(3));
      await refreshUploadedSongs();
    } else {
      deleteSong(song.id);
    }
  }

  async function handleApprove(song: Song) {
    await approveUploadedSongAction(song.id.slice(3));
    await refreshUploadedSongs();
  }

  const pendingSongs = songs.filter((s) => s.id.startsWith("up-") && !s.isPublished);

  return (
    <div>
      {pendingSongs.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">
            {pendingSongs.length} canción{pendingSongs.length === 1 ? "" : "es"} pendiente
            {pendingSongs.length === 1 ? "" : "s"} de aprobación
          </p>
          <ul className="space-y-2">
            {pendingSongs.map((song) => (
              <li key={song.id} className="flex items-center gap-3 rounded-lg bg-surface/60 px-3 py-2">
                <div className="h-9 w-9 shrink-0">
                  <CoverImage src={song.coverUrl} title={song.title} size="xs" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{song.title}</p>
                  <p className="truncate text-xs text-foreground-muted">{song.artist}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleApprove(song)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-success/15 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/25"
                >
                  <Check className="h-3.5 w-3.5" /> Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(song)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-danger/15 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/25"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Rechazar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-surface/60 text-xs uppercase tracking-wide text-foreground-muted">
            <tr>
              <th className="px-4 py-3">Canción</th>
              <th className="px-4 py-3">Álbum</th>
              <th className="px-4 py-3">Año</th>
              <th className="px-4 py-3">Duración</th>
              <th className="px-4 py-3">Descarga</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => {
              const deleted = isDeleted(song.id);
              const album = song.albumId ? allAlbums.find((a) => a.id === song.albumId) : undefined;
              return (
                <tr key={song.id} className={`border-t border-border ${deleted ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0">
                        <CoverImage src={song.coverUrl} title={song.title} size="xs" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{song.title}</p>
                        <p className="truncate text-[11px] text-foreground-muted">
                          {song.artist}
                          {isEdited(song.id) && <span className="ml-1.5 text-accent">· editado</span>}
                          {song.needsReview && <span className="ml-1.5 text-amber-400">· revisión</span>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">{album?.title ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground-muted">{song.year ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground-muted">{formatDuration(song.duration)}</td>
                  <td className="px-4 py-3">
                    <span className={song.isDownloadable ? "text-success" : "text-foreground-muted"}>
                      {song.isDownloadable ? "Activada" : "Desactivada"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {deleted ? (
                      <span className="text-danger">Eliminada</span>
                    ) : song.isPublished ? (
                      <span className="text-success">Publicada</span>
                    ) : (
                      <span className="text-foreground-muted">Borrador</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/canciones/${song.id}`}
                        target="_blank"
                        aria-label={`Ver ${song.title} públicamente`}
                        title="Ver públicamente"
                        className="rounded-full p-1.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setEditingId(song.id)}
                        aria-label={`Editar ${song.title}`}
                        title="Editar canción"
                        className="rounded-full p-1.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {isEdited(song.id) && (
                        <button
                          type="button"
                          onClick={() => resetSong(song.id)}
                          aria-label={`Deshacer ediciones de ${song.title}`}
                          title="Deshacer ediciones"
                          className="rounded-full p-1.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      {deleted ? (
                        <button
                          type="button"
                          onClick={() => restoreSong(song.id)}
                          aria-label={`Restaurar ${song.title}`}
                          title="Restaurar"
                          className="rounded-full p-1.5 text-foreground-muted hover:bg-success/10 hover:text-success"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDelete(song)}
                          aria-label={`Eliminar ${song.title}`}
                          title="Eliminar"
                          className="rounded-full p-1.5 text-foreground-muted hover:bg-danger/10 hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => setUploadOpen(true)}
        className="mt-4 flex items-center gap-2 rounded-full border border-dashed border-accent/50 px-4 py-2.5 text-sm font-medium text-accent hover:bg-accent-soft"
      >
        <Plus className="h-4 w-4" /> Añadir canción
      </button>
      <button
        type="button"
        onClick={() => setBulkOpen(true)}
        className="ml-2 mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-accent/50 px-4 py-2.5 text-sm font-medium text-accent hover:bg-accent-soft"
      >
        <Upload className="h-4 w-4" /> Subir álbum (varias canciones)
      </button>

      {uploadOpen && <UploadSongModal onClose={() => setUploadOpen(false)} />}
      {bulkOpen && <BulkUploadModal onClose={() => setBulkOpen(false)} />}

      {editingSong && (
        <EditSongModal
          song={editingSong}
          lastEditedAt={lastEditedAt(editingSong.id)}
          onClose={() => setEditingId(null)}
          onSave={async (patch) => {
            const result = await updateSong(editingSong.id, patch);
            if (!result.error) setEditingId(null);
            return result;
          }}
        />
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50";

function EditSongModal({
  song,
  lastEditedAt,
  onClose,
  onSave,
}: {
  song: Song;
  lastEditedAt?: string;
  onClose: () => void;
  onSave: (patch: Partial<Song>) => Promise<{ error?: string }>;
}) {
  const [draft, setDraft] = useState<Song>(song);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverMode, setCoverMode] = useState<"url" | "upload">("url");
  const [dragOver, setDragOver] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { allAlbums: albums } = useSongs();

  function patch<K extends keyof Song>(key: K, value: Song[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function handleCoverFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, cover: "El archivo debe ser una imagen (JPG, PNG, WebP o AVIF)." }));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrors((e) => ({ ...e, cover: "La imagen es demasiado grande (máx. 8 MB)." }));
      return;
    }
    setCoverUploading(true);
    setErrors((e) => ({ ...e, cover: "" }));
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await uploadCoverImageAction(dataUrl, file.name);
      if (result.error || !result.url) {
        setErrors((e) => ({ ...e, cover: result.error ?? "No se pudo subir la carátula." }));
        return;
      }
      patch("coverUrl", result.url);
      patch("coverSource", "uploaded");
    } catch {
      setErrors((e) => ({ ...e, cover: "No se pudo subir la carátula. Intenta de nuevo." }));
    } finally {
      setCoverUploading(false);
    }
  }

  function updateSource(index: number, patchSource: Partial<AudioSource>) {
    setDraft((d) => ({
      ...d,
      audioSources: d.audioSources.map((s, i) => (i === index ? { ...s, ...patchSource } : s)),
    }));
  }
  function removeSource(index: number) {
    setDraft((d) => ({ ...d, audioSources: d.audioSources.filter((_, i) => i !== index) }));
  }
  function addSource() {
    setDraft((d) => ({
      ...d,
      audioSources: [...d.audioSources, { type: "local", url: "", downloadable: true }],
    }));
  }
  function makePrimary(index: number) {
    setDraft((d) => {
      const sources = [...d.audioSources];
      const [chosen] = sources.splice(index, 1);
      return { ...d, audioSources: [chosen, ...sources] };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!draft.title.trim()) nextErrors.title = "El título no puede estar vacío.";
    if (draft.year !== undefined && (draft.year < 1900 || draft.year > 2100)) nextErrors.year = "Año inválido.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const result = await onSave(draft);
      if (result.error) setSaveError(result.error);
    } catch {
      setSaveError("No se pudo guardar la edición. Comprueba la conexión e inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="glass flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Editar canción</p>
            {lastEditedAt && (
              <p className="text-[11px] text-foreground-muted">
                Última edición: {new Date(lastEditedAt).toLocaleString("es")}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-foreground-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-5 lg:grid-cols-[1fr_280px]">
          {/* form */}
          <div className="space-y-6">
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                Información general
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Título">
                  <input value={draft.title} onChange={(e) => patch("title", e.target.value)} className={inputClass} />
                  {errors.title && <p className="mt-1 text-[11px] text-danger">{errors.title}</p>}
                </Field>
                <Field label="Nombre original del archivo">
                  <input
                    value={draft.originalFileName ?? ""}
                    onChange={(e) => patch("originalFileName", e.target.value)}
                    className={inputClass}
                    disabled
                  />
                </Field>
                <Field label="Artista">
                  <input value={draft.artist} onChange={(e) => patch("artist", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Alias artístico">
                  <input value={draft.alias ?? ""} onChange={(e) => patch("alias", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Álbum">
                  <select
                    value={draft.albumId ?? ""}
                    onChange={(e) => patch("albumId", e.target.value || undefined)}
                    className={inputClass}
                  >
                    <option value="">Sin álbum (single)</option>
                    {albums.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Tipo de lanzamiento">
                  <select
                    value={draft.releaseType}
                    onChange={(e) => patch("releaseType", e.target.value as Song["releaseType"])}
                    className={inputClass}
                  >
                    {Object.entries(releaseTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Año">
                  <input
                    type="number"
                    value={draft.year ?? ""}
                    onChange={(e) => patch("year", e.target.value ? Number(e.target.value) : undefined)}
                    className={inputClass}
                  />
                  {errors.year && <p className="mt-1 text-[11px] text-danger">{errors.year}</p>}
                </Field>
                <Field label="Número de pista">
                  <input
                    type="number"
                    value={draft.trackNumber ?? ""}
                    onChange={(e) => patch("trackNumber", e.target.value ? Number(e.target.value) : undefined)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Género">
                  <input value={draft.genre ?? ""} onChange={(e) => patch("genre", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Etiquetas (separadas por coma)">
                  <input
                    value={draft.tags.join(", ")}
                    onChange={(e) =>
                      patch(
                        "tags",
                        e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                      )
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Descripción">
                  <textarea
                    value={draft.description ?? ""}
                    onChange={(e) => patch("description", e.target.value)}
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Créditos">
                  <textarea
                    value={draft.credits ?? ""}
                    onChange={(e) => patch("credits", e.target.value)}
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Notas internas del administrador (no se muestran públicamente)">
                  <textarea
                    value={draft.notes ?? ""}
                    onChange={(e) => patch("notes", e.target.value)}
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </Field>
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">Carátula</h3>
              <div className="flex gap-4">
                <div className="h-24 w-24 shrink-0">
                  <CoverImage src={draft.coverUrl} title={draft.title} size="small" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCoverMode("upload")}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${coverMode === "upload" ? "border-accent bg-accent-soft text-white" : "border-border text-foreground-muted"}`}
                    >
                      <Upload className="h-3.5 w-3.5" /> Subir imagen
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverMode("url")}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${coverMode === "url" ? "border-accent bg-accent-soft text-white" : "border-border text-foreground-muted"}`}
                    >
                      <Link2 className="h-3.5 w-3.5" /> URL externa
                    </button>
                    {draft.coverUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          patch("coverUrl", undefined);
                          patch("coverSource", "fallback");
                        }}
                        className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-danger"
                      >
                        <ImageOff className="h-3.5 w-3.5" /> Quitar (usar predeterminada)
                      </button>
                    )}
                  </div>

                  {coverMode === "upload" ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleCoverFile(file);
                      }}
                      onClick={() => !coverUploading && fileInputRef.current?.click()}
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center text-xs text-foreground-muted transition-colors ${dragOver ? "border-accent bg-accent-soft/30" : "border-border"} ${coverUploading ? "pointer-events-none opacity-60" : ""}`}
                    >
                      <Upload className={`mb-1 h-5 w-5 ${coverUploading ? "animate-pulse" : ""}`} />
                      {coverUploading ? "Subiendo…" : "Arrastra una imagen o haz clic para seleccionarla"}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCoverFile(file);
                        }}
                      />
                    </div>
                  ) : (
                    <input
                      value={draft.coverUrl && draft.coverUrl.startsWith("http") ? draft.coverUrl : ""}
                      onChange={(e) => {
                        patch("coverUrl", e.target.value || undefined);
                        patch("coverSource", "external");
                      }}
                      placeholder="https://…"
                      className={inputClass}
                    />
                  )}
                  {errors.cover && <p className="text-[11px] text-danger">{errors.cover}</p>}
                  <p className="text-[11px] text-foreground-muted">
                    Formatos permitidos: JPG, PNG, WebP, AVIF. Sin carátula se usa el diseño predeterminado.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">Letra</h3>
              <textarea
                value={draft.lyrics ?? ""}
                onChange={(e) => patch("lyrics", e.target.value)}
                rows={6}
                placeholder="Sin letra cargada — se mostrará “Letra no disponible”."
                className={`${inputClass} resize-none`}
              />
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                  Fuentes de audio y calidades
                </h3>
                <button
                  type="button"
                  onClick={addSource}
                  className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-foreground-muted hover:bg-surface-hover"
                >
                  <Plus className="h-3.5 w-3.5" /> Añadir fuente
                </button>
              </div>
              <div className="space-y-3">
                {draft.audioSources.map((source, i) => (
                  <div key={i} className="rounded-lg border border-border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-foreground-muted">
                        {i === 0 ? "Fuente principal" : `Calidad alternativa ${i}`}
                      </span>
                      <div className="flex items-center gap-2">
                        {i !== 0 && (
                          <button type="button" onClick={() => makePrimary(i)} className="text-[11px] text-accent hover:underline">
                            Usar como principal
                          </button>
                        )}
                        <button type="button" onClick={() => removeSource(i)} aria-label="Eliminar fuente" className="text-foreground-muted hover:text-danger">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <input
                        value={source.url}
                        onChange={(e) => updateSource(i, { url: e.target.value })}
                        placeholder="URL o ruta"
                        className={`${inputClass} col-span-2 sm:col-span-2`}
                      />
                      <select
                        value={source.type}
                        onChange={(e) => updateSource(i, { type: e.target.value as AudioSource["type"] })}
                        className={inputClass}
                      >
                        <option value="local">Local</option>
                        <option value="external">Externa</option>
                        <option value="storage">Almacenamiento</option>
                      </select>
                      <input
                        value={source.format ?? ""}
                        onChange={(e) => updateSource(i, { format: e.target.value })}
                        placeholder="Formato (MP3…)"
                        className={inputClass}
                      />
                      <input
                        type="number"
                        value={source.bitrate ?? ""}
                        onChange={(e) => updateSource(i, { bitrate: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="Bitrate (kbps)"
                        className={inputClass}
                      />
                      <input
                        value={source.qualityLabel ?? ""}
                        onChange={(e) => updateSource(i, { qualityLabel: e.target.value })}
                        placeholder="Etiqueta de calidad"
                        className={inputClass}
                      />
                      <label className="flex items-center gap-1.5 text-xs text-foreground-muted">
                        <input
                          type="checkbox"
                          checked={source.downloadable !== false}
                          onChange={(e) => updateSource(i, { downloadable: e.target.checked })}
                          className="h-3.5 w-3.5 accent-[var(--accent)]"
                        />
                        Descargable
                      </label>
                    </div>
                  </div>
                ))}
                {draft.audioSources.length === 0 && (
                  <p className="flex items-center gap-2 text-xs text-danger">
                    <AlertTriangle className="h-3.5 w-3.5" /> Sin fuentes de audio, esta canción no se podrá reproducir.
                  </p>
                )}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                Estado y comportamiento
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(
                  [
                    ["isPublished", "Publicada"],
                    ["isDownloadable", "Descarga activada"],
                    ["commentsEnabled", "Comentarios activados"],
                    ["isFeatured", "Destacada"],
                    ["includeInRecommendations", "En recomendaciones"],
                    ["includeInMixes", "En mixes automáticos"],
                  ] as [keyof Song, string][]
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-xs text-foreground">
                    <input
                      type="checkbox"
                      checked={!!draft[key]}
                      onChange={(e) => patch(key, e.target.checked as Song[typeof key])}
                      className="h-4 w-4 accent-[var(--accent)]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* live preview */}
          <div className="space-y-4 lg:sticky lg:top-0 lg:self-start">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Vista previa</h3>
            <div className="w-32">
              <CoverImage src={draft.coverUrl} title={draft.title} size="medium" />
              <p className="mt-1.5 truncate text-xs font-medium text-foreground">{draft.title || "Sin título"}</p>
              <p className="truncate text-[11px] text-foreground-muted">{draft.alias || draft.artist}</p>
            </div>
            <div className="glass flex items-center gap-2 rounded-xl p-2">
              <div className="h-10 w-10 shrink-0">
                <CoverImage src={draft.coverUrl} title={draft.title} size="xs" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">{draft.title || "Sin título"}</p>
                <p className="truncate text-[10px] text-foreground-muted">{draft.alias || draft.artist}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-foreground-muted">
              <Music className="h-3.5 w-3.5" />
              {draft.audioSources.length} fuente(s) · {formatDuration(draft.duration)}
            </div>
            {draft.metadataStatus && (
              <div className="flex items-center gap-1.5 text-[11px] text-foreground-muted">
                <CheckCircle2 className="h-3.5 w-3.5" /> Metadatos: {draft.metadataStatus}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          {saveError && <p className="mr-auto text-xs text-danger">{saveError}</p>}
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || coverUploading}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
