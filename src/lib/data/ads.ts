// Placeholder ad-card content — plain data so it's easy to hand-edit for now.
// A future pass can move this into an admin-editable table; the AdBanner
// component itself doesn't care where the cards come from.
export type AdCard = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  gradient: string;
};

export const adCards: AdCard[] = [
  {
    id: "ad-demo-1",
    title: "Apoya el archivo",
    description: "SHINOTECA se mantiene gracias a la comunidad. Considera colaborar para seguir preservando este material.",
    ctaLabel: "Ver cómo ayudar",
    ctaHref: "/donaciones",
    gradient: "linear-gradient(135deg, #7c1d2f, #1a0a12)",
  },
  {
    id: "ad-demo-2",
    title: "Espacio publicitario",
    description: "Este es un espacio de banner de ejemplo — el contenido y el diseño se podrán configurar más adelante.",
    ctaLabel: "Más información",
    ctaHref: "/premium",
    gradient: "linear-gradient(135deg, #1d3a7c, #0a0e1a)",
  },
];
