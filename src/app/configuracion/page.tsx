"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, LogOut, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/common/PageHeader";

export default function ConfiguracionPage() {
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [cleared, setCleared] = useState(false);

  function handleClearLocalData() {
    if (!window.confirm("Esto borra tus favoritos, playlists, historial y preferencias guardadas en este navegador. ¿Continuar?")) {
      return;
    }
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith("shinoflow:"))
      .forEach((k) => window.localStorage.removeItem(k));
    setCleared(true);
    setTimeout(() => window.location.reload(), 800);
  }

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <PageHeader title="Configuración" />

      <div className="max-w-lg space-y-4">
        <section className="rounded-xl border border-border p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <User className="h-4 w-4" /> Cuenta
          </h2>
          {user ? (
            <div className="space-y-2 text-sm text-foreground-muted">
              <p>
                Sesión iniciada como <span className="text-foreground">{user.displayName}</span> ({user.email})
              </p>
              {isAdmin && (
                <p className="flex items-center gap-1.5 text-accent">
                  <ShieldCheck className="h-3.5 w-3.5" /> Cuenta de administrador
                </p>
              )}
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="mt-2 flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover"
              >
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </div>
          ) : (
            <p className="text-sm text-foreground-muted">No has iniciado sesión.</p>
          )}
        </section>

        <section className="rounded-xl border border-border p-4">
          <h2 className="mb-2 text-sm font-semibold text-foreground">Datos guardados en este navegador</h2>
          <p className="mb-3 text-xs text-foreground-muted">
            Tus favoritos, playlists, historial de reproducción y preferencias del reproductor se guardan
            únicamente en este navegador, no en una cuenta en la nube. Borrarlos aquí los elimina de forma
            permanente en este dispositivo.
          </p>
          <button
            type="button"
            onClick={handleClearLocalData}
            className="flex items-center gap-2 rounded-full border border-danger/40 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10"
          >
            <Trash2 className="h-4 w-4" /> {cleared ? "Datos borrados, recargando…" : "Borrar datos locales"}
          </button>
        </section>
      </div>
    </div>
  );
}
