"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import UploadSongModal from "@/app/admin/_components/UploadSongModal";

export default function SubirPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) return null;

  if (!open) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center px-4 pb-16 pt-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
          <UploadCloud className="h-6 w-6 text-accent" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Subir canción</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Sesión iniciada como {user?.displayName}. Cada canción se revisa antes de publicarse en
          el archivo.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-6 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
        >
          Subir otra canción
        </button>
      </div>
    );
  }

  return <UploadSongModal onClose={() => setOpen(false)} />;
}
