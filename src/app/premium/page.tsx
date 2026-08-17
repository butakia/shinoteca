"use client";

import { Check, Sparkles } from "lucide-react";
import clsx from "clsx";
import { usePremium } from "@/context/PremiumContext";
import PageHeader from "@/components/common/PageHeader";

const benefits = [
  "Sin banners publicitarios en el archivo",
  "Prioridad para futuras funciones",
  "Apoyas directamente el mantenimiento de SHINOTECA",
];

export default function PremiumPage() {
  const { isPremium, setPremium } = usePremium();

  return (
    <div className="mx-auto max-w-lg px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <PageHeader title="Premium" subtitle="Una forma opcional de apoyar el archivo y quitar los anuncios visuales" />

      <div className="glass mt-6 rounded-2xl p-6 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-accent" strokeWidth={1.6} />
        <p className="mt-3 text-sm text-foreground-muted">
          Esta es una demostración: activar Premium aquí no procesa ningún pago real, solo oculta los banners
          publicitarios de ejemplo en este navegador.
        </p>

        <ul className="mt-5 space-y-2 text-left text-sm text-foreground">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              {b}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setPremium(!isPremium)}
          className={clsx(
            "mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold transition-colors",
            isPremium ? "border border-border text-foreground hover:bg-surface-hover" : "bg-accent text-white hover:bg-accent/90"
          )}
        >
          {isPremium ? "Desactivar Premium (demo)" : "Activar Premium (demo)"}
        </button>
      </div>
    </div>
  );
}
