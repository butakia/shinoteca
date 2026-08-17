"use client";

import { createContext, useCallback, useContext } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { DEFAULT_BRANDING } from "@/lib/branding";

type Branding = typeof DEFAULT_BRANDING;

type BrandingContextValue = {
  branding: Branding;
  setBranding: (patch: Partial<Branding>) => void;
  resetBranding: () => void;
};

const BrandingContext = createContext<BrandingContextValue | null>(null);
const BRANDING_KEY = "shinoflow:branding:v1";

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBrandingState] = usePersistentState<Branding>(BRANDING_KEY, DEFAULT_BRANDING);

  const setBranding = useCallback(
    (patch: Partial<Branding>) => setBrandingState((prev) => ({ ...prev, ...patch })),
    [setBrandingState]
  );
  const resetBranding = useCallback(() => setBrandingState(DEFAULT_BRANDING), [setBrandingState]);

  return (
    <BrandingContext.Provider value={{ branding, setBranding, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error("useBranding must be used within BrandingProvider");
  return ctx;
}
