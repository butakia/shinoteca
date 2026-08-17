"use client";

import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { useCredits } from "@/context/CreditsContext";
import { collaboratorCategoryLabels, type CollaboratorCategory } from "@/lib/credits";

const CATEGORIES = Object.keys(collaboratorCategoryLabels) as CollaboratorCategory[];

export default function AdminCredits() {
  const { collaborators, addCollaborator, updateCollaborator, removeCollaborator, reorderCollaborator } = useCredits();
  const [form, setForm] = useState({ name: "", username: "", category: CATEGORIES[0], description: "" });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addCollaborator({
      name: form.name.trim(),
      username: form.username.trim() || undefined,
      category: form.category,
      description: form.description.trim() || undefined,
      order: collaborators.filter((c) => c.category === form.category).length + 1,
      visible: true,
    });
    setForm({ name: "", username: "", category: form.category, description: "" });
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Nombre</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Usuario (opcional)</label>
          <input
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Categoría</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as CollaboratorCategory }))}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {collaboratorCategoryLabels[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Descripción</label>
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
          />
        </div>
        <button
          type="submit"
          className="flex w-fit items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 sm:col-span-2"
        >
          <Plus className="h-4 w-4" /> Añadir colaborador
        </button>
      </form>

      {CATEGORIES.map((category) => {
        const people = collaborators
          .filter((c) => c.category === category)
          .sort((a, b) => a.order - b.order);
        if (people.length === 0) return null;
        return (
          <div key={category} className="mb-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
              {collaboratorCategoryLabels[category]}
            </p>
            <div className="space-y-1.5">
              {people.map((person) => (
                <div key={person.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{person.name}</p>
                    {person.description && <p className="truncate text-xs text-foreground-muted">{person.description}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" onClick={() => reorderCollaborator(person.id, "up")} aria-label="Subir" className="rounded-full p-1.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => reorderCollaborator(person.id, "down")} aria-label="Bajar" className="rounded-full p-1.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateCollaborator(person.id, { visible: !person.visible })}
                      aria-label={person.visible ? "Ocultar" : "Mostrar"}
                      className="rounded-full p-1.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                    >
                      {person.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCollaborator(person.id)}
                      aria-label="Eliminar"
                      className="rounded-full p-1.5 text-foreground-muted hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
