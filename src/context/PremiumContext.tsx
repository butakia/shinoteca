"use client";

import { createContext, useContext } from "react";
import { STORAGE_KEYS } from "@/lib/storage";
import { usePersistentState } from "@/hooks/usePersistentState";

type PremiumContextValue = {
  isPremium: boolean;
  setPremium: (v: boolean) => void;
};

const PremiumContext = createContext<PremiumContextValue | null>(null);

// Demo-mode flag only — no real payment/subscription backend exists yet.
// Hiding ads client-side is honest as long as it's presented that way.
export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setPremium] = usePersistentState<boolean>(STORAGE_KEYS.premium, false);

  return <PremiumContext.Provider value={{ isPremium, setPremium }}>{children}</PremiumContext.Provider>;
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be used within PremiumProvider");
  return ctx;
}
