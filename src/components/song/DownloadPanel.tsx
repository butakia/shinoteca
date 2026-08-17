"use client";

import { useState } from "react";
import { Download, X, CheckCircle2 } from "lucide-react";
import type { Song } from "@/lib/types";
import CoverImage from "@/components/media/CoverImage";
import { formatDuration } from "@/lib/format";
import { useNotices } from "@/context/NoticesContext";

function formatBytes(bytes?: number) {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function safeFileName(song: Song, extension: string) {
  const clean = `${song.alias ?? song.artist} - ${song.title}`.replace(/[\\/:*?"<>|]/g, "");
  return `${clean}.${extension.toLowerCase()}`;
}

export default function DownloadPanel({ song }: { song: Song }) {
  const { getNoticeText } = useNotices();
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const local = song.audioSources.find((s) => s.type === "local") ?? song.audioSources[0];
  const options = song.audioSources.filter((s) => s.downloadable !== false);
  const [selected, setSelected] = useState(local);

  async function handleDownload() {
    if (!selected) return;
    setDone(false);
    setProgress(0);
    try {
      const res = await fetch(selected.url);
      const total = Number(res.headers.get("content-length")) || 0;
      const reader = res.body?.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;
      if (reader) {
        for (;;) {
          const { done: streamDone, value } = await reader.read();
          if (streamDone) break;
          if (value) {
            chunks.push(value);
            received += value.length;
            if (total) setProgress(Math.round((received / total) * 100));
          }
        }
      }
      const blob = new Blob(chunks as BlobPart[]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = safeFileName(song, selected.format ?? "mp3");
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDone(true);
    } finally {
      setProgress(null);
    }
  }

  if (!song.isDownloadable || options.length === 0) return null;

  return (
    <>
      <button
        type="button"
        id="descargar"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
      >
        <Download className="h-4 w-4" /> Descargar
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
          <div className="glass w-full max-w-sm rounded-t-2xl p-5 sm:rounded-2xl">
            <div className="mb-4 flex items-start justify-between">
              <p className="text-sm font-semibold text-foreground">Descargar canción</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="text-foreground-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div className="h-14 w-14 shrink-0">
                <CoverImage src={song.coverUrl} title={song.title} size="small" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{song.title}</p>
                <p className="truncate text-xs text-foreground-muted">
                  {song.alias ?? song.artist} · {formatDuration(song.duration)}
                </p>
              </div>
            </div>

            <div className="mb-4 space-y-1.5">
              {options.map((source, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(source)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    selected === source ? "border-accent bg-accent-soft text-white" : "border-border text-foreground-muted hover:text-foreground"
                  }`}
                >
                  <span>
                    {source.format ?? "Audio"} {source.qualityLabel ? `— ${source.qualityLabel}` : ""}
                  </span>
                  <span className="text-xs">{formatBytes(source.fileSize) ?? ""}</span>
                </button>
              ))}
            </div>

            {getNoticeText("download") && (
              <p className="mb-4 text-[11px] text-foreground-muted">{getNoticeText("download")}</p>
            )}

            {progress !== null && (
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}

            {done ? (
              <div className="flex items-center justify-center gap-2 rounded-full bg-success/15 px-4 py-2.5 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" /> Descarga completada
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDownload}
                disabled={progress !== null}
                className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-60"
              >
                {progress !== null ? `Descargando… ${progress}%` : "Descargar"}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
