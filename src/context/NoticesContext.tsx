"use client";

import { createContext, useCallback, useContext } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { STORAGE_KEYS } from "@/lib/storage";
import { defaultNotices, type Notice, type NoticeKey } from "@/lib/notices";

type NoticesMap = Record<NoticeKey, Notice>;

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
  const [notices, setNotices] = usePersistentState<NoticesMap>(STORAGE_KEYS.notices, defaultNotices);
  const [dismissedOnce, setDismissedOnce] = usePersistentState<string[]>(DISMISSED_KEY, []);

  const getNotice = useCallback((key: NoticeKey) => notices[key] ?? defaultNotices[key], [notices]);

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
      setNotices((prev) => ({ ...prev, [key]: { ...prev[key], ...patch, updatedAt: new Date().toISOString() } }));
    },
    [setNotices]
  );

  const resetNotice = useCallback((key: NoticeKey) => setNotices((prev) => ({ ...prev, [key]: defaultNotices[key] })), [setNotices]);

  const dismissOnce = useCallback(
    (key: NoticeKey) => setDismissedOnce((prev) => (prev.includes(key) ? prev : [...prev, key])),
    [setDismissedOnce]
  );

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
