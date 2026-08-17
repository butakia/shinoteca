"use client";

import { useState } from "react";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import { useNotices } from "@/context/NoticesContext";
import { noticeLabels, type NoticeKey, type NoticeVisibility } from "@/lib/notices";

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
                    onClick={() => updateNotice(key, { enabled: !notice.enabled })}
                    className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-foreground-muted hover:bg-surface-hover"
                  >
                    {notice.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
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
