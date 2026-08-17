"use client";

import { useRef, useState } from "react";
import { ImagePlus, RotateCcw } from "lucide-react";
import clsx from "clsx";
import { useNotices } from "@/context/NoticesContext";
import { noticeLabels, type NoticeKey, type NoticeVisibility } from "@/lib/notices";
import { uploadCoverImageAction } from "@/lib/upload-actions";

const KEYS = Object.keys(noticeLabels) as NoticeKey[];

const visibilityLabels: Record<NoticeVisibility, string> = {
  always: "Mostrar siempre",
  once: "Mostrar una sola vez",
  unregistered: "Solo usuarios no registrados",
  admin: "Solo en el panel administrativo",
};

export default function AdminNotices() {
  const { notices, updateNotice, resetNotice } = useNotices();
  const [openKey, setOpenKey] = useState<NoticeKey | null>(null);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function uploadAnnouncementImage(file: File) {
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await uploadCoverImageAction(dataUrl, file.name);
      if (result.url) updateNotice("welcome", { imageUrl: result.url });
      else window.alert(result.error ?? "No se pudo subir la imagen.");
    } catch {
      window.alert("No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-4 text-xs text-foreground-muted">
        Controla todos los avisos, disclaimers y mensajes informativos de la plataforma desde un
        solo lugar. Desactiva los que resulten repetitivos sin tener que tocar código.
      </p>

      <div className="space-y-2">
        {KEYS.map((key) => {
          const notice = notices[key];
          const open = openKey === key;
          return (
            <div key={key} className="rounded-xl border border-border">
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{noticeLabels[key]}</p>
                  <p className="truncate text-[11px] text-foreground-muted">{notice.location}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notice.enabled}
                    onClick={() => updateNotice(key, { enabled: !notice.enabled })}
                    className="flex items-center gap-2 rounded-full text-xs font-medium text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                  >
                    <span
                      className={clsx(
                        "relative h-7 w-12 rounded-full border shadow-inner transition-all",
                        notice.enabled ? "border-accent bg-accent" : "border-white/20 bg-white/10"
                      )}
                    >
                      <span
                        className={clsx(
                          "absolute left-0.5 top-0.5 h-5.5 w-5.5 rounded-full bg-white shadow-md transition-transform",
                          notice.enabled ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </span>
                    {notice.enabled ? "Visible" : "Oculto"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenKey(open ? null : key)}
                    className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover"
                  >
                    {open ? "Cerrar" : "Editar"}
                  </button>
                </div>
              </div>

              {open && (
                <div className="space-y-3 border-t border-border p-3">
                  {key === "welcome" && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-foreground">Título del anuncio</label>
                        <input
                          value={notice.title ?? ""}
                          onChange={(e) => updateNotice(key, { title: e.target.value })}
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-foreground">Imagen del anuncio</label>
                          <input
                            value={notice.imageUrl ?? ""}
                            onChange={(e) => updateNotice(key, { imageUrl: e.target.value })}
                            placeholder="/agradecimiento.jpg o https://…"
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                          />
                        </div>
                        <div className="self-end">
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadAnnouncementImage(file);
                            }}
                          />
                          <button
                            type="button"
                            disabled={uploading}
                            onClick={() => imageInputRef.current?.click()}
                            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-surface-hover disabled:opacity-60"
                          >
                            <ImagePlus className="h-4 w-4" /> {uploading ? "Subiendo…" : "Subir imagen"}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-foreground">Texto del botón</label>
                          <input
                            value={notice.buttonLabel ?? ""}
                            onChange={(e) => updateNotice(key, { buttonLabel: e.target.value })}
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-foreground">Mostrar después de (segundos)</label>
                          <input
                            type="number"
                            min={0}
                            max={300}
                            value={notice.delaySeconds ?? 10}
                            onChange={(e) => updateNotice(key, { delaySeconds: Number(e.target.value) })}
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">Texto visible</label>
                    <textarea
                      value={notice.text}
                      onChange={(e) => updateNotice(key, { text: e.target.value })}
                      rows={3}
                      className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground">Visibilidad</label>
                      <select
                        value={notice.visibility}
                        onChange={(e) => updateNotice(key, { visibility: e.target.value as NoticeVisibility })}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                      >
                        {Object.entries(visibilityLabels).map(([v, label]) => (
                          <option key={v} value={v}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground">Prioridad</label>
                      <input
                        type="number"
                        value={notice.priority}
                        onChange={(e) => updateNotice(key, { priority: Number(e.target.value) })}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border border-dashed border-border p-3 text-xs text-foreground-muted">
                    <span className="mb-1 block font-medium text-foreground">Vista previa</span>
                    {notice.text.trim() ? notice.text : <em>Sin texto — no se mostrará nada.</em>}
                  </div>
                  <button
                    type="button"
                    onClick={() => resetNotice(key)}
                    className="flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restaurar texto predeterminado
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
