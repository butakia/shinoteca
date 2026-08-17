"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNotices } from "@/context/NoticesContext";

const links = [
  { href: "/biodata", label: "Biodata" },
  { href: "/mision", label: "Misión" },
  { href: "/mensaje-para-el-club", label: "Mensaje para el club" },
  { href: "/creditos", label: "Créditos" },
  { href: "/derechos", label: "Derechos y solicitudes" },
  { href: "/terminos", label: "Términos" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/donaciones", label: "Apoyar el proyecto" },
];

export default function SiteFooter() {
  const { getNoticeText } = useNotices();
  const pathname = usePathname();
  const footerNotice = getNoticeText("footer");

  // The standalone player page is a focused full-viewport tool, not a
  // catalog page — it shouldn't scroll into a site footer.
  if (pathname?.startsWith("/play/")) return null;

  return (
    <footer className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-foreground-muted">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-foreground">
            {l.label}
          </Link>
        ))}
      </div>
      {footerNotice && <p className="mt-4 text-[11px] text-foreground-muted/70">{footerNotice}</p>}
    </footer>
  );
}
