"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { STORAGE_KEYS } from "@/lib/storage";
import { defaultNotices, type Notice, type NoticeKey } from "@/lib/notices";
import { saveNoticeOverrideAction, resetNoticeOverrideAction } from "@/lib/notice-actions";

type NoticesMap = Record<NoticeKey, Notice>;
type NoticePatchMap = Partial<Record<NoticeKey, Partial<Notice>>>;

type NoticesContextValue = {
  notices: NoticesMap;
  getNotice: (key: NoticeKey) => Notice;
  getNoticeText: (key: NoticeKey) => string | null; // null when disabled/empty — callers should render nothing
  updateNotice: (key: NoticeKey, patch: Partial<Notice>) => void;
  resetNotice: (key: NoticeKey) => void;
  dismissedOnce: string[];
  dismissOnce: (key: NoticeKey) => void;
};

const NoticesContext = createContext<NoticesContextValue | null>(null);
const DISMISSED_KEY = "shinoflow:notices-dismissed:v1";

export function NoticesProvider({ children }: { children: React.ReactNode }) {
  // Local overrides give the editing admin instant feedback; the server
  // copy (fetched below) is what every OTHER visitor actually sees — local
  // wins when both exist, same merge order as SongsContext uses for songs.
  const [localOverrides, setLocalOverrides] = usePersistentState<NoticePatchMap>(STORAGE_KEYS.notices, {});
  const [dismissedOnce, setDismissedOnce] = usePersistentState<string[]>(DISMISSED_KEY, []);
  const [serverOverrides, setServerOverrides] = useState<NoticePatchMap>({});

  const refreshNoticeOverrides = useCallback(async () => {
    try {
      const res = await fetch("/api/notice-overrides", { cache: "no-store" });
      if (!res.ok) return;
      const data: { overrides: NoticePatchMap } = await res.json();
      setServerOverrides(data.overrides);
    } catch {
      // offline / API unavailable — falls back to whatever's cached locally
    }
  }, []);

  useEffect(() => {
    refreshNoticeOverrides();
  }, [refreshNoticeOverrides]);

  const getNotice = useCallback(
    (key: NoticeKey): Notice => ({
      ...defaultNotices[key],
      ...serverOverrides[key],
      ...localOverrides[key],
    }),
    [serverOverrides, localOverrides]
  );

  const getNoticeText = useCallback(
    (key: NoticeKey) => {
      const notice = getNotice(key);
      if (!notice.enabled || !notice.text.trim()) return null;
      if (notice.visibility === "once" && dismissedOnce.includes(key)) return null;
      return notice.text;
    },
    [getNotice, dismissedOnce]
  );

  const updateNotice = useCallback(
    (key: NoticeKey, patch: Partial<Notice>) => {
      const full = { ...serverOverrides[key], ...localOverrides[key], ...patch, updatedAt: new Date().toISOString() };
      setLocalOverrides((prev) => ({ ...prev, [key]: { ...prev[key], ...patch, updatedAt: full.updatedAt } }));
      saveNoticeOverrideAction(key, full).then((result) => {
        if (result.error) console.error("No se pudo guardar el aviso en el servidor:", result.error);
        else refreshNoticeOverrides();
      });
    },
    [setLocalOverrides, serverOverrides, localOverrides, refreshNoticeOverrides]
  );

  const resetNotice = useCallback(
    (key: NoticeKey) => {
      setLocalOverrides((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      resetNoticeOverrideAction(key).then((result) => {
        if (result.error) console.error("No se pudo restaurar el aviso en el servidor:", result.error);
        else refreshNoticeOverrides();
      });
    },
    [setLocalOverrides, refreshNoticeOverrides]
  );

  const dismissOnce = useCallback(
    (key: NoticeKey) => setDismissedOnce((prev) => (prev.includes(key) ? prev : [...prev, key])),
    [setDismissedOnce]
  );

  const notices = Object.fromEntries(
    (Object.keys(defaultNotices) as NoticeKey[]).map((key) => [key, getNotice(key)])
  ) as NoticesMap;

  return (
    <NoticesContext.Provider
      value={{ notices, getNotice, getNoticeText, updateNotice, resetNotice, dismissedOnce, dismissOnce }}
    >
      {children}
    </NoticesContext.Provider>
  );
}

export function useNotices() {
  const ctx = useContext(NoticesContext);
  if (!ctx) throw new Error("useNotices must be used within NoticesProvider");
  return ctx;
}
