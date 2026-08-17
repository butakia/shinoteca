"use client";

import { useState } from "react";
import { Eye, EyeOff, RotateCcw, Image as ImageIcon } from "lucide-react";
import { useInstitutionalPages } from "@/context/InstitutionalPagesContext";
import { institutionalNavLabels, type InstitutionalSlug } from "@/lib/institutional";
import CoverImage from "@/components/media/CoverImage";

const SLUGS = Object.keys(institutionalNavLabels) as InstitutionalSlug[];

export default function AdminInstitutional() {
  const { pages, updatePage, resetPage } = useInstitutionalPages();
  const [openSlug, setOpenSlug] = useState<InstitutionalSlug | null>(null);

  return (
    <div>
      <p className="mb-4 flex items-start gap-2 rounded-xl border border-border bg-surface/60 p-3 text-xs text-foreground-muted">
        <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Edición básica de texto e imagen por ahora (título, subtítulo, cuerpo, imagen). El editor
        de texto enriquecido, las galerías y el historial de versiones llegarán en una fase
        posterior.
      </p>

      <div className="space-y-3">
        {SLUGS.sort((a, b) => pages[a].order - pages[b].order).map((slug) => {
          const page = pages[slug];
          const open = openSlug === slug;
          return (
            <div key={slug} className="rounded-xl border border-border">
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0">
                    <CoverImage src={page.imageUrl} title={page.title} size="xs" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{institutionalNavLabels[slug]}</p>
                    <p className="text-xs text-foreground-muted">{page.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updatePage(slug, { enabled: !page.enabled })}
                    className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-foreground-muted hover:bg-surface-hover"
                  >
                    {page.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {page.enabled ? "Visible" : "Oculta"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenSlug(open ? null : slug)}
                    className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover"
                  >
                    {open ? "Cerrar" : "Editar"}
                  </button>
                </div>
              </div>

              {open && (
                <div className="space-y-3 border-t border-border p-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">Título</label>
                    <input
                      value={page.title}
                      onChange={(e) => updatePage(slug, { title: e.target.value })}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">Subtítulo</label>
                    <input
                      value={page.subtitle ?? ""}
                      onChange={(e) => updatePage(slug, { subtitle: e.target.value })}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">
                      Contenido (separa párrafos con una línea en blanco)
                    </label>
                    <textarea
                      value={page.body}
                      onChange={(e) => updatePage(slug, { body: e.target.value })}
                      rows={8}
                      className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground">URL de imagen</label>
                      <input
                        value={page.imageUrl ?? ""}
                        onChange={(e) => updatePage(slug, { imageUrl: e.target.value })}
                        placeholder="https://…"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                      />
                      {page.imageUrl && (
                        <button
                          type="button"
                          onClick={() => updatePage(slug, { imageUrl: undefined })}
                          className="mt-1 text-[11px] text-danger hover:underline"
                        >
                          Quitar imagen (usar diseño predeterminado)
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground">Texto alternativo</label>
                      <input
                        value={page.imageAlt}
                        onChange={(e) => updatePage(slug, { imageAlt: e.target.value })}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground">Modo de imagen</label>
                      <select
                        value={page.imageMode}
                        onChange={(e) => updatePage(slug, { imageMode: e.target.value as "background" | "card" })}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                      >
                        <option value="background">Fondo de portada</option>
                        <option value="card">Dentro de una tarjeta</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground">Posición</label>
                      <select
                        value={page.imagePosition}
                        onChange={(e) => updatePage(slug, { imagePosition: e.target.value as "center" | "top" | "bottom" })}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                      >
                        <option value="center">Centro</option>
                        <option value="top">Arriba</option>
                        <option value="bottom">Abajo</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => resetPage(slug)}
                    className="flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restaurar contenido original
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
