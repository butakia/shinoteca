"use client";

import { Archive, FolderTree, Share2, XCircle, CheckCircle2 } from "lucide-react";
import { useInstitutionalPages } from "@/context/InstitutionalPagesContext";
import InstitutionalHero from "@/components/institutional/InstitutionalHero";
import InstitutionalBody from "@/components/institutional/InstitutionalBody";
import PageDisabledNotice from "@/components/institutional/PageDisabledNotice";

const cards = [
  { icon: Archive, title: "Preservar", text: "Conservar canciones, maquetas y carátulas que dejaron de estar disponibles fácilmente." },
  { icon: FolderTree, title: "Organizar", text: "Catalogar por álbum, año y tipo de lanzamiento para facilitar la consulta." },
  { icon: Share2, title: "Compartir responsablemente", text: "Publicar solo con autorización o base legítima, con crédito a sus titulares." },
];

const notList = [
  "No es un canal oficial del artista ni de sus representantes.",
  "No vende ni monetiza el material publicado.",
  "No reclama la propiedad de ninguna canción, imagen o letra.",
];

const doList = [
  "Reunir en un solo lugar material disperso entre foros y carpetas.",
  "Catalogar de forma clara por álbum, año y tipo de lanzamiento.",
  "Facilitar el retiro o la corrección de contenido a quien tenga derechos sobre él.",
];

export default function MisionPage() {
  const { getPage } = useInstitutionalPages();
  const page = getPage("mision");

  if (!page.enabled) return <PageDisabledNotice />;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <InstitutionalHero page={page} />

      <div className="mt-8">
        <InstitutionalBody body={page.body} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.title} className="glass rounded-xl p-5">
            <c.icon className="mb-3 h-6 w-6 text-accent" strokeWidth={1.6} />
            <p className="text-sm font-semibold text-foreground">{c.title}</p>
            <p className="mt-1 text-xs text-foreground-muted">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <XCircle className="h-4 w-4 text-danger" /> Lo que este proyecto no es
          </h2>
          <ul className="space-y-2">
            {notList.map((item) => (
              <li key={item} className="text-xs text-foreground-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" /> Lo que este proyecto sí busca hacer
          </h2>
          <ul className="space-y-2">
            {doList.map((item) => (
              <li key={item} className="text-xs text-foreground-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
