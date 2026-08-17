"use client";

import { RotateCcw } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useBranding } from "@/context/BrandingContext";
import Logo from "@/components/layout/Logo";

const PRESETS = [
  { label: "Rojo sobre negro", accent: "#e11d2f", background: "#000000" },
  { label: "Violeta sobre negro", accent: "#8b5cf6", background: "#07070c" },
  { label: "Ámbar sobre negro", accent: "#f59e0b", background: "#0a0705" },
  { label: "Verde sobre negro", accent: "#22c55e", background: "#040a06" },
];

export default function AdminAppearance() {
  const { theme, setTheme, resetTheme } = useTheme();
  const { branding, setBranding, resetBranding } = useBranding();

  return (
    <div className="max-w-lg">
      <p className="mb-2 text-xs font-medium text-foreground">Logotipo</p>
      <div className="mb-6 rounded-xl border border-border p-4">
        <div className="mb-3 flex items-center gap-4">
          <Logo height={28} linkToHome={false} />
          <Logo variant="icon" height={28} linkToHome={false} />
        </div>
        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Nombre del sitio</label>
            <input
              value={branding.siteName}
              onChange={(e) => setBranding({ siteName: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface px-2 py-2 text-xs text-foreground outline-none focus:border-accent/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">URL del logotipo completo</label>
            <input
              value={branding.logoFullSrc}
              onChange={(e) => setBranding({ logoFullSrc: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface px-2 py-2 text-xs text-foreground outline-none focus:border-accent/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">URL del símbolo (versión compacta / favicon)</label>
            <input
              value={branding.logoIconSrc}
              onChange={(e) => setBranding({ logoIconSrc: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface px-2 py-2 text-xs text-foreground outline-none focus:border-accent/50"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={resetBranding}
          className="mt-3 flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Restaurar logotipo predeterminado
        </button>
      </div>

      <p className="mb-4 text-xs text-foreground-muted">
        Cambia el color de resaltado (logo, botones, barra de progreso) y el color de fondo. Los
        cambios se aplican de inmediato y se guardan en este navegador.
      </p>

      <div className="mb-5 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Color de resaltado</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.accent}
              onChange={(e) => setTheme({ accent: e.target.value })}
              className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-surface"
            />
            <input
              value={theme.accent}
              onChange={(e) => setTheme({ accent: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface px-2 py-2 text-xs text-foreground outline-none focus:border-accent/50"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Color de fondo</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.background}
              onChange={(e) => setTheme({ background: e.target.value })}
              className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-surface"
            />
            <input
              value={theme.background}
              onChange={(e) => setTheme({ background: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface px-2 py-2 text-xs text-foreground outline-none focus:border-accent/50"
            />
          </div>
        </div>
      </div>

      <p className="mb-2 text-xs font-medium text-foreground">Combinaciones sugeridas</p>
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setTheme({ accent: preset.accent, background: preset.background })}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-2 hover:bg-surface-hover"
          >
            <span
              className="flex h-8 w-full items-center justify-center rounded-md"
              style={{ backgroundColor: preset.background }}
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: preset.accent }} />
            </span>
            <span className="text-[10px] text-foreground-muted">{preset.label}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={resetTheme}
        className="flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Restaurar colores predeterminados
      </button>
    </div>
  );
}
