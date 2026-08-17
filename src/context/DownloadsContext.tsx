"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Song } from "@/lib/types";
import {
  saveOfflineTrack,
  getOfflineTrack,
  deleteOfflineTrack,
  listOfflineTracks,
  estimateStorage,
  type OfflineTrackMeta,
} from "@/lib/offline-store";

type DownloadStatus = "downloading" | "downloaded" | "error";
type DownloadState = { status: DownloadStatus; progress: number; error?: string };

type DownloadsContextValue = {
  downloads: Record<string, DownloadState>;
  offlineMeta: Record<string, OfflineTrackMeta>;
  startDownload: (song: Song) => Promise<void>;
  cancelDownload: (songId: string) => void;
  removeDownload: (songId: string) => Promise<void>;
  isDownloaded: (songId: string) => boolean;
  getOfflineBlobUrl: (songId: string) => Promise<string | null>;
  storageEstimate: { usage: number; quota: number } | null;
  refreshOfflineList: () => Promise<void>;
};

const DownloadsContext = createContext<DownloadsContextValue | null>(null);

// Object URLs from IndexedDB blobs, cached per song so repeated plays of the
// same offline track don't re-read+re-blob it from IndexedDB every time.
const blobUrlCache = new Map<string, string>();

export function DownloadsProvider({ children }: { children: React.ReactNode }) {
  const [downloads, setDownloads] = useState<Record<string, DownloadState>>({});
  const [offlineMeta, setOfflineMeta] = useState<Record<string, OfflineTrackMeta>>({});
  const [storageEstimate, setStorageEstimate] = useState<{ usage: number; quota: number } | null>(null);
  const abortControllers = useRef<Record<string, AbortController>>({});

  const refreshOfflineList = useCallback(async () => {
    try {
      const rows = await listOfflineTracks();
      setOfflineMeta(Object.fromEntries(rows.map((r) => [r.songId, r])));
      setStorageEstimate(await estimateStorage());
    } catch {
      // IndexedDB unavailable (private browsing in some browsers, etc.) —
      // "Mis descargas" just reports nothing stored instead of crashing.
    }
  }, []);

  useEffect(() => {
    refreshOfflineList();
  }, [refreshOfflineList]);

  const isDownloaded = useCallback((songId: string) => !!offlineMeta[songId], [offlineMeta]);

  const startDownload = useCallback(
    async (song: Song) => {
      const source = song.audioSources.find((s) => s.type === "local") ?? song.audioSources[0];
      if (!source) {
        setDownloads((prev) => ({ ...prev, [song.id]: { status: "error", progress: 0, error: "Sin fuente de audio." } }));
        return;
      }

      const controller = new AbortController();
      abortControllers.current[song.id] = controller;
      setDownloads((prev) => ({ ...prev, [song.id]: { status: "downloading", progress: 0 } }));

      try {
        const res = await fetch(source.url, { signal: controller.signal });
        if (!res.ok || !res.body) throw new Error("No se pudo descargar el archivo.");
        const total = Number(res.headers.get("content-length")) || 0;
        const reader = res.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            received += value.length;
            const progress = total ? Math.round((received / total) * 100) : 0;
            setDownloads((prev) => ({ ...prev, [song.id]: { status: "downloading", progress } }));
          }
        }

        const blob = new Blob(chunks as BlobPart[], { type: `audio/${(source.format ?? "mpeg").toLowerCase()}` });
        await saveOfflineTrack({
          songId: song.id,
          title: song.title,
          artist: song.alias ?? song.artist,
          coverUrl: song.coverUrl,
          duration: song.duration,
          sizeBytes: blob.size,
          downloadedAt: new Date().toISOString(),
          blob,
        });

        setDownloads((prev) => ({ ...prev, [song.id]: { status: "downloaded", progress: 100 } }));
        await refreshOfflineList();
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          setDownloads((prev) => {
            const next = { ...prev };
            delete next[song.id];
            return next;
          });
          return;
        }
        // QuotaExceededError and friends land here too — the message from
        // the thrown error is usually specific enough to show directly.
        setDownloads((prev) => ({
          ...prev,
          [song.id]: { status: "error", progress: 0, error: (err as Error)?.message || "No se pudo guardar la descarga." },
        }));
      } finally {
        delete abortControllers.current[song.id];
      }
    },
    [refreshOfflineList]
  );

  const cancelDownload = useCallback((songId: string) => {
    abortControllers.current[songId]?.abort();
  }, []);

  const removeDownload = useCallback(
    async (songId: string) => {
      const url = blobUrlCache.get(songId);
      if (url) {
        URL.revokeObjectURL(url);
        blobUrlCache.delete(songId);
      }
      await deleteOfflineTrack(songId);
      setDownloads((prev) => {
        const next = { ...prev };
        delete next[songId];
        return next;
      });
      await refreshOfflineList();
    },
    [refreshOfflineList]
  );

  const getOfflineBlobUrl = useCallback(async (songId: string) => {
    const cached = blobUrlCache.get(songId);
    if (cached) return cached;
    const record = await getOfflineTrack(songId);
    if (!record) return null;
    const url = URL.createObjectURL(record.blob);
    blobUrlCache.set(songId, url);
    return url;
  }, []);

  return (
    <DownloadsContext.Provider
      value={{
        downloads,
        offlineMeta,
        startDownload,
        cancelDownload,
        removeDownload,
        isDownloaded,
        getOfflineBlobUrl,
        storageEstimate,
        refreshOfflineList,
      }}
    >
      {children}
    </DownloadsContext.Provider>
  );
}

export function useDownloads() {
  const ctx = useContext(DownloadsContext);
  if (!ctx) throw new Error("useDownloads must be used within DownloadsProvider");
  return ctx;
}
