"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Info } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import AdminSongs from "./_components/AdminSongs";
import AdminMetadata from "./_components/AdminMetadata";
import AdminInstitutional from "./_components/AdminInstitutional";
import AdminCredits from "./_components/AdminCredits";
import AdminAppearance from "./_components/AdminAppearance";
import AdminNotices from "./_components/AdminNotices";
import AdminAlbums from "./_components/AdminAlbums";

const TABS = [
  { key: "canciones", label: "Canciones" },
  { key: "albumes", label: "Álbumes" },
  { key: "metadatos", label: "Metadatos" },
  { key: "paginas", label: "Páginas institucionales" },
  { key: "creditos", label: "Créditos" },
  { key: "avisos", label: "Mensajes, avisos y disclaimers" },
  { key: "apariencia", label: "Apariencia" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AdminPage() {
  const { isAdmin, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("canciones");

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/login");
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) return null;

  return (
    <div className="px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel de administración</h1>
        </div>
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.push("/");
          }}
          className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-xl border border-border bg-surface/60 p-3 text-xs text-foreground-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          Las ediciones de canciones, álbumes y avisos se guardan en el servidor y se reflejan en
          todos los dispositivos. Las demás preferencias del panel se aplican de inmediato en el
          sitio. Los archivos de audio nuevos todavía se
          importan con <code className="text-foreground">scripts/import-music.mjs</code> — ver README.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={clsx(
              "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-accent text-foreground"
                : "border-transparent text-foreground-muted hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "canciones" && <AdminSongs />}
      {tab === "albumes" && <AdminAlbums />}
      {tab === "metadatos" && <AdminMetadata />}
      {tab === "paginas" && <AdminInstitutional />}
      {tab === "creditos" && <AdminCredits />}
      {tab === "avisos" && <AdminNotices />}
      {tab === "apariencia" && <AdminAppearance />}
    </div>
  );
}
