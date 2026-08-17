"use client";

import { Download, CheckCircle2, X, Loader2 } from "lucide-react";
import clsx from "clsx";
import type { Song } from "@/lib/types";
import { useDownloads } from "@/context/DownloadsContext";

export default function OfflineDownloadButton({ song, compact = true }: { song: Song; compact?: boolean }) {
  const { downloads, isDownloaded, startDownload, cancelDownload, removeDownload } = useDownloads();
  const state = downloads[song.id];
  const downloaded = isDownloaded(song.id);

  if (downloaded) {
    return (
      <button
        type="button"
        onClick={() => removeDownload(song.id)}
        title="Disponible sin conexión — quitar descarga"
        className={clsx(
          "flex items-center gap-2 rounded-full px-2.5 py-2 text-sm font-medium text-success transition-colors hover:bg-danger/10 hover:text-danger sm:px-3.5 sm:py-2.5",
        )}
      >
        <CheckCircle2 className="h-5 w-5" strokeWidth={1.8} />
        {!compact && <span>Disponible sin conexión</span>}
      </button>
    );
  }

  if (state?.status === "downloading") {
    return (
      <button
        type="button"
        onClick={() => cancelDownload(song.id)}
        title={`Descargando… ${state.progress}% — cancelar`}
        className="flex items-center gap-2 rounded-full px-2.5 py-2 text-sm font-medium text-accent sm:px-3.5 sm:py-2.5"
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.8} />
        </span>
        {!compact && <span>{state.progress}% — cancelar</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => startDownload(song)}
      title={state?.status === "error" ? state.error : "Descargar para escuchar sin conexión"}
      className={clsx(
        "flex items-center gap-2 rounded-full px-2.5 py-2 text-sm font-medium transition-colors hover:bg-white/5 sm:px-3.5 sm:py-2.5",
        state?.status === "error" ? "text-danger" : "text-foreground-muted hover:text-foreground"
      )}
    >
      {state?.status === "error" ? <X className="h-5 w-5" strokeWidth={1.8} /> : <Download className="h-5 w-5" strokeWidth={1.8} />}
      {!compact && <span>{state?.status === "error" ? "Reintentar" : "Sin conexión"}</span>}
    </button>
  );
}
