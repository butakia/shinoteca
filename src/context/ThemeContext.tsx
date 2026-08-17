"use client";

import { createContext, useCallback, useContext, useEffect } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";

type ThemeColors = {
  accent: string;
  background: string;
};

const DEFAULT_THEME: ThemeColors = { accent: "#e11d2f", background: "#000000" };
const THEME_KEY = "shinoflow:theme:v1";

type ThemeContextValue = {
  theme: ThemeColors;
  setTheme: (patch: Partial<ThemeColors>) => void;
  resetTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = usePersistentState<ThemeColors>(THEME_KEY, DEFAULT_THEME);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", theme.accent);
    const { r, g, b } = hexToRgb(theme.accent);
    root.style.setProperty("--accent-soft", `rgba(${r}, ${g}, ${b}, 0.18)`);
    root.style.setProperty("--background", theme.background);
  }, [theme]);

  const setTheme = useCallback(
    (patch: Partial<ThemeColors>) => {
      setThemeState((prev) => ({ ...prev, ...patch }));
    },
    [setThemeState]
  );

  const resetTheme = useCallback(() => setThemeState(DEFAULT_THEME), [setThemeState]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
