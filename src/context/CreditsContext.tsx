"use client";

import { createContext, useCallback, useContext } from "react";
import { STORAGE_KEYS } from "@/lib/storage";
import { usePersistentState } from "@/hooks/usePersistentState";
import { defaultCollaborators, type Collaborator } from "@/lib/credits";

type CreditsContextValue = {
  collaborators: Collaborator[];
  addCollaborator: (c: Omit<Collaborator, "id">) => void;
  updateCollaborator: (id: string, patch: Partial<Collaborator>) => void;
  removeCollaborator: (id: string) => void;
  reorderCollaborator: (id: string, direction: "up" | "down") => void;
};

const CreditsContext = createContext<CreditsContextValue | null>(null);

function makeId() {
  return `col-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const [collaborators, setCollaborators] = usePersistentState<Collaborator[]>(
    STORAGE_KEYS.collaborators,
    defaultCollaborators
  );

  const addCollaborator = useCallback(
    (c: Omit<Collaborator, "id">) => {
      setCollaborators((prev) => [...prev, { ...c, id: makeId() }]);
    },
    [setCollaborators]
  );

  const updateCollaborator = useCallback(
    (id: string, patch: Partial<Collaborator>) => {
      setCollaborators((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    },
    [setCollaborators]
  );

  const removeCollaborator = useCallback(
    (id: string) => {
      setCollaborators((prev) => prev.filter((c) => c.id !== id));
    },
    [setCollaborators]
  );

  const reorderCollaborator = useCallback(
    (id: string, direction: "up" | "down") => {
      setCollaborators((prev) => {
        const sameCategory = prev.filter((c) => c.category === prev.find((p) => p.id === id)?.category);
        const idx = sameCategory.findIndex((c) => c.id === id);
        const swapWith = direction === "up" ? idx - 1 : idx + 1;
        if (idx < 0 || swapWith < 0 || swapWith >= sameCategory.length) return prev;
        const a = sameCategory[idx];
        const b = sameCategory[swapWith];
        return prev.map((c) => {
          if (c.id === a.id) return { ...c, order: b.order };
          if (c.id === b.id) return { ...c, order: a.order };
          return c;
        });
      });
    },
    [setCollaborators]
  );

  return (
    <CreditsContext.Provider
      value={{ collaborators, addCollaborator, updateCollaborator, removeCollaborator, reorderCollaborator }}
    >
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error("useCredits must be used within CreditsProvider");
  return ctx;
}
