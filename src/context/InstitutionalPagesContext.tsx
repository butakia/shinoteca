"use client";

import { createContext, useCallback, useContext } from "react";
import { STORAGE_KEYS } from "@/lib/storage";
import { usePersistentState } from "@/hooks/usePersistentState";
import {
  defaultInstitutionalPages,
  type InstitutionalPage,
  type InstitutionalSlug,
} from "@/lib/institutional";

type InstitutionalPagesMap = Record<InstitutionalSlug, InstitutionalPage>;

type InstitutionalPagesContextValue = {
  pages: InstitutionalPagesMap;
  getPage: (slug: InstitutionalSlug) => InstitutionalPage;
  updatePage: (slug: InstitutionalSlug, patch: Partial<InstitutionalPage>) => void;
  resetPage: (slug: InstitutionalSlug) => void;
};

const InstitutionalPagesContext = createContext<InstitutionalPagesContextValue | null>(null);

export function InstitutionalPagesProvider({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = usePersistentState<InstitutionalPagesMap>(
    STORAGE_KEYS.institutionalPages,
    defaultInstitutionalPages
  );

  const getPage = useCallback((slug: InstitutionalSlug) => pages[slug] ?? defaultInstitutionalPages[slug], [pages]);

  const updatePage = useCallback(
    (slug: InstitutionalSlug, patch: Partial<InstitutionalPage>) => {
      setPages((prev) => ({
        ...prev,
        [slug]: { ...prev[slug], ...patch, updatedAt: new Date().toISOString() },
      }));
    },
    [setPages]
  );

  const resetPage = useCallback(
    (slug: InstitutionalSlug) => {
      setPages((prev) => ({ ...prev, [slug]: defaultInstitutionalPages[slug] }));
    },
    [setPages]
  );

  return (
    <InstitutionalPagesContext.Provider value={{ pages, getPage, updatePage, resetPage }}>
      {children}
    </InstitutionalPagesContext.Provider>
  );
}

export function useInstitutionalPages() {
  const ctx = useContext(InstitutionalPagesContext);
  if (!ctx) throw new Error("useInstitutionalPages must be used within InstitutionalPagesProvider");
  return ctx;
}
