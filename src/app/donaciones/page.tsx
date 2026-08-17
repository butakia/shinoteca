"use client";

import { HeartHandshake } from "lucide-react";
import ProsePage from "@/components/common/ProsePage";
import { useNotices } from "@/context/NoticesContext";

const channels = [
  { name: "PayPal", href: "#", note: "Enlace de ejemplo — reemplazar por el real" },
  { name: "Ko-fi", href: "#", note: "Enlace de ejemplo — reemplazar por el real" },
  { name: "Yape", href: "#", note: "Número/QR de ejemplo — reemplazar" },
  { name: "Plin", href: "#", note: "Número/QR de ejemplo — reemplazar" },
];

export default function DonationsPage() {
  const { getNoticeText } = useNotices();
  const donationsNotice = getNoticeText("donations");

  return (
    <ProsePage
      title="Apoyar el archivo"
      subtitle="Las donaciones ayudan a mantener este archivo musical comunitario en línea"
    >
      {donationsNotice && (
        <div className="not-prose mb-6 flex items-center gap-3 rounded-xl border border-border bg-surface/60 p-4">
          <HeartHandshake className="h-6 w-6 shrink-0 text-accent" />
          <p className="text-sm text-foreground-muted">{donationsNotice}</p>
        </div>
      )}

      <div className="not-prose grid grid-cols-1 gap-3 sm:grid-cols-2">
        {channels.map((c) => (
          <a
            key={c.name}
            href={c.href}
            className="rounded-xl border border-border bg-surface/50 p-4 transition-colors hover:bg-surface-hover"
          >
            <p className="text-sm font-semibold text-foreground">{c.name}</p>
            <p className="mt-1 text-xs text-foreground-muted">{c.note}</p>
          </a>
        ))}
      </div>
    </ProsePage>
  );
}
