"use client";

import Link from "next/link";
import { UploadCloud, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";

export default function MobileHeader() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur-xl lg:hidden">
      <div className="flex items-center gap-2">
        <MobileMenu />
        <Logo height={42} />
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={isAuthenticated ? "/subir" : "/login"}
          aria-label="Subir canción"
          className="rounded-full border border-border p-2 text-foreground-muted"
        >
          {isAuthenticated ? <UploadCloud className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
        </Link>
        <Link
          href="/donaciones"
          className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground-muted"
        >
          Donar
        </Link>
      </div>
    </header>
  );
}
