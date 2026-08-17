"use client";

import { createContext, useCallback, useContext } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { STORAGE_KEYS } from "@/lib/storage";

type ArtistFilterContextValue = {
  onlyShinoflow: boolean;
  setOnlyShinoflow: (v: boolean) => void;
  toggleOnlyShinoflow: () => void;
};

const ArtistFilterContext = createContext<ArtistFilterContextValue | null>(null);

// Site-wide "Solo Shinoflow" switch. The archive is centred on Shinoflow, so
// this defaults to ON for everyone — including newly registered users, since
// the preference lives in this browser and starts `true` until someone turns
// it off themselves. Third-party uploads (Porta and anything else marked
// isThirdParty) stay hidden until then.
export function ArtistFilterProvider({ children }: { children: React.ReactNode }) {
  const [onlyShinoflow, setOnlyShinoflow] = usePersistentState<boolean>(STORAGE_KEYS.onlyShinoflow, true);

  const toggleOnlyShinoflow = useCallback(
    () => setOnlyShinoflow((prev) => !prev),
    [setOnlyShinoflow]
  );

  return (
    <ArtistFilterContext.Provider value={{ onlyShinoflow, setOnlyShinoflow, toggleOnlyShinoflow }}>
      {children}
    </ArtistFilterContext.Provider>
  );
}

export function useArtistFilter() {
  const ctx = useContext(ArtistFilterContext);
  if (!ctx) throw new Error("useArtistFilter must be used within ArtistFilterProvider");
  return ctx;
}
