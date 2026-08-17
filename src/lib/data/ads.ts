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
    id: "ad-donations",
    title: "Espacio publicitario",
    description: "Puedes hacer una donación desde US$0.10 para quitar este anuncio.",
    ctaLabel: "Donar desde US$0.10",
    ctaHref: "/donaciones",
    gradient: "linear-gradient(135deg, #7c1d2f, #1a0a12)",
  },
];
