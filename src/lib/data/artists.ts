import type { Artist } from "@/lib/types";

// Demo artist entry. All biographical text here is placeholder copy —
// in production this must be reviewed/edited by the admin before publishing,
// since AGENTS.md forbids presenting unverified identity claims as fact.
export const artists: Artist[] = [
  {
    id: "shino-flow",
    name: "Shino Flow",
    alias: "Shino",
    description:
      "Texto de ejemplo. Reemplazar con una descripción verificada por el administrador del archivo.",
    activeYears: "2006–2012 (demo)",
  },
];
