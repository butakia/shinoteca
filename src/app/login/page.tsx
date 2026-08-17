"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, register, isAdmin } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const errorMessage =
      mode === "login" ? await login(email, password) : await register(email, password, displayName);
    setSubmitting(false);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    router.push(isAdmin ? "/admin" : "/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 pb-16 pt-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
        {mode === "login" ? <Lock className="h-6 w-6 text-accent" /> : <User className="h-6 w-6 text-accent" />}
      </div>
      <h1 className="text-xl font-bold text-foreground">
        {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
      </h1>
      <p className="mt-2 text-sm text-foreground-muted">
        Crea una cuenta para subir canciones al archivo. Cada canción subida se revisa antes de
        publicarse.
      </p>

      <div className="mt-6 flex w-full rounded-full border border-border bg-surface p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={clsx(
            "flex-1 rounded-full py-2 transition-colors",
            mode === "login" ? "bg-accent text-white" : "text-foreground-muted hover:text-foreground"
          )}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
          }}
          className={clsx(
            "flex-1 rounded-full py-2 transition-colors",
            mode === "register" ? "bg-accent text-white" : "text-foreground-muted hover:text-foreground"
          )}
        >
          Registrarme
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 w-full space-y-3 text-left">
        {mode === "register" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Nombre</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "register" ? 8 : undefined}
            required
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
          />
          {mode === "register" && (
            <p className="mt-1 text-[11px] text-foreground-muted">Mínimo 8 caracteres.</p>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-60"
        >
          {submitting ? "Un momento…" : mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
