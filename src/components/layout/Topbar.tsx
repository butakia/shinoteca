"use client";

import Link from "next/link";
import { LogIn, LogOut, ShieldCheck, UploadCloud } from "lucide-react";
import SearchBar from "@/components/search/SearchBar";
import { useAuth } from "@/context/AuthContext";

export default function Topbar() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 hidden items-center justify-between gap-4 border-b border-border bg-background/80 px-8 py-4 backdrop-blur-xl lg:flex">
      <SearchBar />
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground-muted hover:bg-surface-hover hover:text-foreground"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Admin
          </Link>
        )}
        {user ? (
          <>
            <Link
              href="/subir"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground-muted hover:bg-surface-hover hover:text-foreground"
            >
              <UploadCloud className="h-3.5 w-3.5" /> Subir canción
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover"
            >
              <LogOut className="h-3.5 w-3.5" /> {user.displayName}
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover"
          >
            <LogIn className="h-3.5 w-3.5" /> Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
}
