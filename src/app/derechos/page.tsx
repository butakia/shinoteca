"use client";

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { useInstitutionalPages } from "@/context/InstitutionalPagesContext";
import InstitutionalHero from "@/components/institutional/InstitutionalHero";
import InstitutionalBody from "@/components/institutional/InstitutionalBody";
import { contactEmail } from "@/lib/institutional";
import PageDisabledNotice from "@/components/institutional/PageDisabledNotice";

const requestTypes = [
  "Retiro de una canción",
  "Retiro de una imagen",
  "Modificación de un crédito",
  "Corrección de información",
  "Eliminación de una letra",
  "Revisión de una autorización",
  "Actualización de un enlace",
];

export default function DerechosPage() {
  const { getPage } = useInstitutionalPages();
  const page = getPage("derechos");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: requestTypes[0],
    link: "",
    message: "",
    confirmed: false,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim() || !form.confirmed) return;
    // Demo mode: no backend yet — ver README para conectar esto a un endpoint real.
    setSubmitted(true);
  }

  if (!page.enabled) return <PageDisabledNotice />;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <InstitutionalHero page={page} />

      <div className="mt-8">
        <InstitutionalBody body={page.body} />
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-foreground-muted">
        <Mail className="h-3.5 w-3.5" /> También puedes escribir directamente a{" "}
        <a href={`mailto:${contactEmail}`} className="text-accent hover:underline">
          {contactEmail}
        </a>
      </p>

      <h2 className="mb-4 mt-10 text-lg font-semibold text-foreground">Formulario de solicitud</h2>

      {submitted ? (
        <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-foreground">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="text-sm font-medium">Solicitud registrada</p>
            <p className="mt-1 text-xs text-foreground-muted">
              Gracias, hemos registrado tu solicitud en esta demostración. En producción, este
              formulario debe enviarse también al correo de contacto del archivo para su revisión.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Nombre completo</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Correo de contacto</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Tipo de solicitud</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
            >
              {requestTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Enlace del contenido</label>
            <input
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              placeholder="https://shinoteca.example/canciones/..."
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Mensaje</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              required
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Archivo adjunto (opcional)</label>
            <input
              type="file"
              className="block w-full text-xs text-foreground-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-xs file:text-foreground"
            />
          </div>
          <label className="flex items-start gap-2 text-xs text-foreground-muted">
            <input
              type="checkbox"
              checked={form.confirmed}
              onChange={(e) => setForm((f) => ({ ...f, confirmed: e.target.checked }))}
              required
              className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
            />
            Confirmo que la información proporcionada es correcta y que tengo relación con el
            material o los derechos indicados.
          </label>
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
          >
            Enviar solicitud
          </button>
        </form>
      )}
    </div>
  );
}
