"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { STORAGE_KEYS } from "@/lib/storage";
import { usePersistentState } from "@/hooks/usePersistentState";

type Reaction = "like" | "dislike" | null;

type FavoritesContextValue = {
  favorites: string[];
  isFavorite: (songId: string) => boolean;
  toggleFavorite: (songId: string) => boolean; // returns new state
  reactions: Record<string, Reaction>;
  getReaction: (songId: string) => Reaction;
  setReaction: (songId: string, reaction: Reaction) => void;
  likeCounts: Record<string, number>;
  ensureLikeCount: (songId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = usePersistentState<string[]>(STORAGE_KEYS.favorites, []);
  const [reactions, setReactions] = usePersistentState<Record<string, Reaction>>(STORAGE_KEYS.likes, {});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const fetchedCounts = useRef<Set<string>>(new Set());

  const ensureLikeCount = useCallback((songId: string) => {
    if (fetchedCounts.current.has(songId)) return;
    fetchedCounts.current.add(songId);
    fetch(`/api/likes/${songId}`)
      .then((res) => res.json())
      .then((data: { count: number }) => {
        setLikeCounts((prev) => ({ ...prev, [songId]: data.count }));
      })
      .catch(() => {
        fetchedCounts.current.delete(songId);
      });
  }, []);

  const adjustLikeCount = useCallback((songId: string, delta: 1 | -1) => {
    setLikeCounts((prev) => ({ ...prev, [songId]: Math.max(0, (prev[songId] ?? 0) + delta) }));
    fetch(`/api/likes/${songId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta }),
    })
      .then((res) => res.json())
      .then((data: { count: number }) => {
        setLikeCounts((prev) => ({ ...prev, [songId]: data.count }));
      })
      .catch(() => {});
  }, []);

  const isFavorite = useCallback((songId: string) => favorites.includes(songId), [favorites]);

  const toggleFavorite = useCallback(
    (songId: string) => {
      let nowFavorite = false;
      setFavorites((prev) => {
        if (prev.includes(songId)) {
          nowFavorite = false;
          return prev.filter((id) => id !== songId);
        }
        nowFavorite = true;
        return [...prev, songId];
      });
      return nowFavorite;
    },
    [setFavorites]
  );

  const getReaction = useCallback((songId: string): Reaction => reactions[songId] ?? null, [reactions]);

  const setReaction = useCallback(
    (songId: string, reaction: Reaction) => {
      setReactions((prev) => {
        const wasLike = prev[songId] === "like";
        const next = { ...prev };
        let isLike = wasLike;
        if (reaction === null || prev[songId] === reaction) {
          delete next[songId];
          isLike = false;
        } else {
          next[songId] = reaction;
          isLike = reaction === "like";
        }
        if (wasLike !== isLike) adjustLikeCount(songId, isLike ? 1 : -1);
        return next;
      });
    },
    [setReactions, adjustLikeCount]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        reactions,
        getReaction,
        setReaction,
        likeCounts,
        ensureLikeCount,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
