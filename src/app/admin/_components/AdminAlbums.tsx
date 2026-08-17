"use client";

import { useRef, useState } from "react";
import { Pencil, Trash2, RotateCcw, Plus, X, Upload, Link2, ImageOff, Eye } from "lucide-react";
import { useSongs } from "@/context/SongsContext";
import { uploadCoverImageAction } from "@/lib/upload-actions";
import CoverImage from "@/components/media/CoverImage";
import { releaseTypeLabels } from "@/lib/format";
import type { Album } from "@/lib/types";
import Link from "next/link";

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

export default function AdminAlbums() {
  const { allAlbums, getSongsByAlbum, updateAlbum, createAlbum, deleteAlbum, isAlbumEdited, isCustomAlbum } =
    useSongs();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const editingAlbum = allAlbums.find((a) => a.id === editingId) ?? null;

  async function handleDelete(album: Album) {
    const custom = isCustomAlbum(album.id);
    if (
      !window.confirm(
        custom
          ? `¿Eliminar el álbum "${album.title}"? Las canciones que tenía asignadas quedarán sin álbum.`
          : `¿Restaurar "${album.title}" a sus datos originales? Se perderán los cambios hechos desde el panel.`
      )
    ) {
      return;
    }
    const result = await deleteAlbum(album.id);
    if (result.error) window.alert(result.error);
  }

  return (
    <div>
      <p className="mb-4 text-xs text-foreground-muted">
        Edita la carátula, el título y otros datos de cualquier álbum — el cambio de carátula se
        aplica automáticamente a todas las canciones que contiene. También puedes crear álbumes
        nuevos (por ejemplo, un álbum &quot;Inéditos&quot;) para agrupar canciones sueltas.
      </p>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface/60 text-xs uppercase tracking-wide text-foreground-muted">
            <tr>
              <th className="px-4 py-3">Álbum</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Año</th>
              <th className="px-4 py-3">Canciones</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {allAlbums.map((album) => {
              const custom = isCustomAlbum(album.id);
              const edited = isAlbumEdited(album.id);
              const trackCount = getSongsByAlbum(album.id).length;
              return (
                <tr key={album.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0">
                        <CoverImage src={album.coverUrl} title={album.title} size="xs" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{album.title}</p>
                        {edited && !custom && <p className="truncate text-[11px] text-accent">editado</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">{releaseTypeLabels[album.releaseType]}</td>
                  <td className="px-4 py-3 text-foreground-muted">{album.year ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground-muted">{trackCount}</td>
                  <td className="px-4 py-3">
                    {custom ? (
                      <span className="text-accent">Creado en admin</span>
                    ) : (
                      <span className="text-foreground-muted">Del catálogo</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/albumes/${album.id}`}
                        target="_blank"
                        aria-label={`Ver ${album.title} públicamente`}
                        title="Ver públicamente"
                        className="rounded-full p-1.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setEditingId(album.id)}
                        aria-label={`Editar ${album.title}`}
                        title="Editar álbum"
                        className="rounded-full p-1.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {(edited || custom) && (
                        <button
                          type="button"
                          onClick={() => handleDelete(album)}
                          aria-label={custom ? `Eliminar ${album.title}` : `Restaurar ${album.title}`}
                          title={custom ? "Eliminar álbum" : "Restaurar datos originales"}
                          className={
                            custom
                              ? "rounded-full p-1.5 text-foreground-muted hover:bg-danger/10 hover:text-danger"
                              : "rounded-full p-1.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                          }
                        >
                          {custom ? <Trash2 className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
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
        onClick={() => setCreating(true)}
        className="mt-4 flex items-center gap-2 rounded-full border border-dashed border-accent/50 px-4 py-2.5 text-sm font-medium text-accent hover:bg-accent-soft"
      >
        <Plus className="h-4 w-4" /> Crear álbum
      </button>

      {editingAlbum && (
        <AlbumModal
          album={editingAlbum}
          title="Editar álbum"
          onClose={() => setEditingId(null)}
          onSave={async (patch) => {
            const result = await updateAlbum(editingAlbum.id, patch);
            if (result.error) {
              window.alert(result.error);
              return;
            }
            setEditingId(null);
          }}
        />
      )}

      {creating && (
        <AlbumModal
          album={{
            id: "",
            title: "",
            artistId: allAlbums[0]?.artistId ?? "shino-flow",
            releaseType: "lp",
          }}
          title="Crear álbum"
          onClose={() => setCreating(false)}
          onSave={async (patch) => {
            const { id: _unused, ...rest } = patch as Album;
            const result = await createAlbum(rest);
            if (result.error) {
              window.alert(result.error);
              return;
            }
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function AlbumModal({
  album,
  title,
  onClose,
  onSave,
}: {
  album: Album;
  title: string;
  onClose: () => void;
  onSave: (patch: Partial<Album>) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Album>(album);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverMode, setCoverMode] = useState<"url" | "upload">("url");
  const [dragOver, setDragOver] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function patch<K extends keyof Album>(key: K, value: Album[K]) {
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
    await onSave(draft);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="glass flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-foreground-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Título">
              <input value={draft.title} onChange={(e) => patch("title", e.target.value)} className={inputClass} />
              {errors.title && <p className="mt-1 text-[11px] text-danger">{errors.title}</p>}
            </Field>
            <Field label="Tipo de lanzamiento">
              <select
                value={draft.releaseType}
                onChange={(e) => patch("releaseType", e.target.value as Album["releaseType"])}
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
          </div>

          <div>
            <Field label="Descripción">
              <textarea
                value={draft.description ?? ""}
                onChange={(e) => patch("description", e.target.value)}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </Field>
          </div>

          <div>
            <Field label="Créditos">
              <textarea
                value={draft.credits ?? ""}
                onChange={(e) => patch("credits", e.target.value)}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </Field>
          </div>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">Carátula</h3>
            <p className="mb-3 text-[11px] text-foreground-muted">
              Cambiar la carátula del álbum la actualiza en todas las canciones que contiene.
            </p>
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
                        patch("coverSource", undefined);
                      }}
                      className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-danger"
                    >
                      <ImageOff className="h-3.5 w-3.5" /> Quitar
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
              </div>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
