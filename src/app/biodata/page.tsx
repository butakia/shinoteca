"use client";

import { ExternalLink, Info, ShieldAlert } from "lucide-react";
import { useInstitutionalPages } from "@/context/InstitutionalPagesContext";
import InstitutionalHero from "@/components/institutional/InstitutionalHero";
import InstitutionalBody from "@/components/institutional/InstitutionalBody";
import EmptyState from "@/components/common/EmptyState";
import SongRow from "@/components/song/SongRow";
import PageDisabledNotice from "@/components/institutional/PageDisabledNotice";
import { useSongs } from "@/context/SongsContext";

const stages = [
  { label: "Escena underground", note: "Circulación de canciones y maquetas por Internet." },
  { label: "Maquetas y colaboraciones", note: "Etapa vinculada a la comunidad de hip-hop independiente." },
  { label: "Transición artística", note: "El proyecto evoluciona hacia lo que luego sería Carlos Sadness." },
];

export default function BiodataPage() {
  const { getPage } = useInstitutionalPages();
  const { getSongsByReleaseType } = useSongs();
  const page = getPage("biodata");
  const relatedTracks = [...getSongsByReleaseType("maqueta"), ...getSongsByReleaseType("demo")];

  if (!page.enabled) return <PageDisabledNotice />;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <InstitutionalHero page={page} />

      <div className="mt-8">
        <InstitutionalBody body={page.body} />
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-xl border border-border bg-surface/60 p-4 text-xs text-foreground-muted">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p>
          Esta información debe revisarse con fuentes oficiales. Este proyecto no representa al
          artista ni a sus representantes; el administrador puede corregir o ampliar este contenido
          en cualquier momento.
        </p>
      </div>

      <h2 className="mb-4 mt-10 text-lg font-semibold text-foreground">Etapas artísticas</h2>
      <ol className="space-y-4 border-l border-border pl-5">
        {stages.map((stage) => (
          <li key={stage.label} className="relative">
            <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full bg-accent" />
            <p className="text-sm font-medium text-foreground">{stage.label}</p>
            <p className="text-xs text-foreground-muted">{stage.note}</p>
          </li>
        ))}
      </ol>

      <h2 className="mb-4 mt-10 text-lg font-semibold text-foreground">Maquetas y trabajos relacionados</h2>
      {relatedTracks.length === 0 ? (
        <EmptyState icon={Info} title="Todavía no hay maquetas catalogadas en esta etapa" />
      ) : (
        <div className="space-y-0.5">
          {relatedTracks.map((song, i) => (
            <SongRow key={song.id} song={song} index={i} queue={relatedTracks} />
          ))}
        </div>
      )}

      <h2 className="mb-4 mt-10 text-lg font-semibold text-foreground">Enlaces externos</h2>
      <EmptyState
        icon={ExternalLink}
        title="El administrador todavía no ha añadido enlaces externos"
        description="Aquí aparecerán referencias, entrevistas o fuentes verificadas cuando se agreguen desde el panel."
      />
    </div>
  );
}
