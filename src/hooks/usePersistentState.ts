"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import { readStorage, writeStorage } from "@/lib/storage";

// Module-level cache + subscriber list, keyed by storage key, shared across
// every usePersistentState instance using that key (so e.g. two SearchBar
// instances stay in sync). useSyncExternalStore is the SSR-safe way to read
// an external store (localStorage) without a hydration-mismatch flash and
// without setState-in-effect, since the server snapshot and the first client
// snapshot can differ safely by design.
const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

function getCached<T>(key: string, initial: T): T {
  if (!cache.has(key)) cache.set(key, readStorage<T>(key, initial));
  return cache.get(key) as T;
}

function emit(key: string) {
  listeners.get(key)?.forEach((cb) => cb());
}

export function usePersistentState<T>(
  key: string,
  initial: T
): [T, (updater: T | ((prev: T) => T)) => void] {
  const initialRef = useRef(initial);

  const subscribe = useCallback(
    (callback: () => void) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(callback);
      return () => listeners.get(key)!.delete(callback);
    },
    [key]
  );

  const getSnapshot = useCallback(() => getCached(key, initialRef.current), [key]);
  const getServerSnapshot = useCallback(() => initialRef.current, []);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (updater: T | ((prev: T) => T)) => {
      const prev = getCached(key, initialRef.current);
      const next = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
      cache.set(key, next);
      writeStorage(key, next);
      emit(key);
    },
    [key]
  );

  return [value, setValue];
}
