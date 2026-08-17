"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clock3, ExternalLink, HeartHandshake, X } from "lucide-react";
import ProsePage from "@/components/common/ProsePage";
import { useNotices } from "@/context/NoticesContext";
import { usePremium } from "@/context/PremiumContext";

const PAYPAL_EMAIL = "rosangela03647004@gmail.com";

const benefits = [
  { label: "Reconocimiento como colaborador del proyecto", available: true },
  { label: "Descargas y reproducción en alta calidad", available: true },
  { label: "Reproducción sin conexión", available: true },
  { label: "Opciones adicionales de edición", available: false },
  { label: "APK de SHINOTECA", available: false },
  { label: "Subir canciones propias a una biblioteca personal", available: false },
];

export default function DonationsPage() {
  const { getNoticeText } = useNotices();
  const donationsNotice = getNoticeText("donations");
  const { setPremium } = usePremium();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("0.10");

  const paypalHref = useMemo(() => {
    const parsed = Math.max(0.1, Number.parseFloat(amount) || 0.1).toFixed(2);
    const params = new URLSearchParams({
      cmd: "_donations",
      business: PAYPAL_EMAIL,
      currency_code: "USD",
      amount: parsed,
      item_name: "Donación para SHINOTECA",
    });
    return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
  }, [amount]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <ProsePage
        title="Apoyar el proyecto"
        subtitle="Una pequeña donación ayuda a mantener este archivo musical comunitario en línea"
      >
        {donationsNotice && (
          <div className="not-prose mb-6 flex items-center gap-3 rounded-xl border border-border bg-surface/60 p-4">
            <HeartHandshake className="h-6 w-6 shrink-0 text-accent" />
            <p className="text-sm text-foreground-muted">{donationsNotice}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="not-prose group flex w-full items-center justify-between rounded-2xl border border-[#0070ba]/40 bg-gradient-to-br from-[#003087]/25 to-[#0070ba]/10 p-5 text-left transition hover:border-[#009cde]/70 hover:from-[#003087]/35 sm:max-w-xl"
        >
          <span>
            <span className="block text-xl font-bold text-foreground">PayPal</span>
            <span className="mt-1 block text-sm text-foreground-muted">Dona de forma segura desde US$0.10</span>
          </span>
          <span className="rounded-full bg-[#0070ba] px-4 py-2 text-sm font-semibold text-white transition-transform group-hover:scale-105">
            Donar
          </span>
        </button>

        <section className="not-prose mt-8 sm:max-w-xl">
          <h2 className="text-lg font-bold text-foreground">Beneficios para colaboradores</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Tu apoyo ayuda a sostener el archivo y a desarrollar nuevas funciones. Distinguimos lo que ya está disponible de lo que está en camino.
          </p>
          <ul className="mt-4 grid gap-2">
            {benefits.map((benefit) => (
              <li key={benefit.label} className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 px-4 py-3">
                {benefit.available ? (
                  <Check className="h-4 w-4 shrink-0 text-success" />
                ) : (
                  <Clock3 className="h-4 w-4 shrink-0 text-accent" />
                )}
                <span className="min-w-0 flex-1 text-sm text-foreground">{benefit.label}</span>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                  {benefit.available ? "Disponible" : "Próximamente"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </ProsePage>

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="paypal-dialog-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="glass relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar donación"
              className="absolute right-4 top-4 rounded-full p-2 text-foreground-muted hover:bg-white/10 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0070ba] text-xl font-black italic text-white">
              P
            </div>
            <h2 id="paypal-dialog-title" className="pr-10 text-2xl font-bold text-foreground">Donar con PayPal</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
              Tu aporte ayuda a mantener SHINOTECA disponible. La donación se enviará a {PAYPAL_EMAIL}.
            </p>
            <label className="mt-6 block text-xs font-semibold uppercase tracking-wider text-foreground-muted" htmlFor="donation-amount">
              Importe en dólares
            </label>
            <div className="mt-2 flex items-center rounded-xl border border-border bg-black/20 px-4 focus-within:border-[#009cde]">
              <span className="text-foreground-muted">US$</span>
              <input
                id="donation-amount"
                type="number"
                min="0.10"
                step="0.10"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full bg-transparent px-2 py-3 text-lg font-semibold text-foreground outline-none"
              />
            </div>
            <a
              href={paypalHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setPremium(true)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#0070ba] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#009cde]"
            >
              Continuar a PayPal <ExternalLink className="h-4 w-4" />
            </a>
            <p className="mt-3 text-center text-[11px] text-foreground-muted">
              El mínimo es US$0.10. Al continuar, los anuncios se ocultarán en este dispositivo y PayPal procesará el pago fuera de SHINOTECA.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
