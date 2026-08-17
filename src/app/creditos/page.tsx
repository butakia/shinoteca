"use client";

import Link from "next/link";
import { useCredits } from "@/context/CreditsContext";
import { collaboratorCategoryLabels, type CollaboratorCategory } from "@/lib/credits";
import { contactEmail } from "@/lib/institutional";
import PageHeader from "@/components/common/PageHeader";

const CATEGORY_ORDER = Object.keys(collaboratorCategoryLabels) as CollaboratorCategory[];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function CreditsPage() {
  const { collaborators } = useCredits();
  const visible = collaborators.filter((c) => c.visible);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <PageHeader title="Créditos" subtitle="Quién hace posible este archivo" />

      <p className="mb-8 text-sm leading-relaxed text-foreground-muted">
        Shinoteca es un proyecto independiente, mantenido por personas voluntarias del archivo. No
        representa oficialmente al artista ni a su equipo, salvo que se indique explícitamente lo
        contrario en una publicación concreta. El contenido musical se comparte únicamente cuando
        existe autorización, consentimiento o una base legítima para hacerlo; los créditos de
        autoría, composición e interpretación pertenecen a sus respectivos titulares. Si eres
        titular de algún contenido y quieres solicitar una aclaración o su retiro, visita{" "}
        <Link href="/derechos" className="text-accent hover:underline">
          Derechos y solicitudes
        </Link>
        .
      </p>

      {CATEGORY_ORDER.map((category) => {
        const people = visible
          .filter((c) => c.category === category)
          .sort((a, b) => a.order - b.order);
        if (people.length === 0) return null;
        return (
          <div key={category} className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">
              {collaboratorCategoryLabels[category]}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {people.map((person) => (
                <div key={person.id} className="glass flex items-center gap-3 rounded-xl p-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-red-600 to-red-900 text-sm font-semibold text-white">
                    {person.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={person.avatarUrl} alt={person.name} className="h-full w-full object-cover" />
                    ) : (
                      initials(person.name)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {person.name}
                      {person.username && (
                        <span className="ml-1 text-xs font-normal text-foreground-muted">@{person.username}</span>
                      )}
                    </p>
                    {person.description && (
                      <p className="truncate text-xs text-foreground-muted">{person.description}</p>
                    )}
                    {person.socialUrl && (
                      <a href={person.socialUrl} className="text-xs text-accent hover:underline">
                        Ver perfil
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <p className="mt-10 text-xs text-foreground-muted">
        ¿Colaboraste identificando una canción, aportando una carátula o transcribiendo una letra?
        Escríbenos a{" "}
        <a href={`mailto:${contactEmail}`} className="text-accent hover:underline">
          {contactEmail}
        </a>{" "}
        para aparecer aquí.
      </p>
    </div>
  );
}
