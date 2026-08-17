"use client";

import { Mail, Info } from "lucide-react";
import { useInstitutionalPages } from "@/context/InstitutionalPagesContext";
import InstitutionalHero from "@/components/institutional/InstitutionalHero";
import InstitutionalBody from "@/components/institutional/InstitutionalBody";
import { contactEmail } from "@/lib/institutional";
import PageDisabledNotice from "@/components/institutional/PageDisabledNotice";

export default function MensajeParaElClubPage() {
  const { getPage } = useInstitutionalPages();
  const page = getPage("mensaje-para-el-club");

  if (!page.enabled) return <PageDisabledNotice />;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <InstitutionalHero page={page} />

      <div className="mt-8">
        <InstitutionalBody body={page.body} />
      </div>

      <div className="mt-8 flex items-center gap-2 rounded-xl border border-border bg-surface/60 p-4 text-xs text-foreground-muted">
        <Info className="h-4 w-4 shrink-0 text-accent" />
        Este proyecto es independiente y no representa oficialmente al artista.
      </div>

      <div className="mt-10 flex flex-col items-start gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Con cariño, el club de fans del archivo.</p>
          <p className="text-xs text-foreground-muted">Shinoteca — un proyecto hecho por y para quienes todavía buscan esa canción perdida.</p>
        </div>
        <a
          href={`mailto:${contactEmail}`}
          className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
        >
          <Mail className="h-4 w-4" /> Escríbenos
        </a>
      </div>
    </div>
  );
}
