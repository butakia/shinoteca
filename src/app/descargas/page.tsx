"use client";

import { Download, Trash2, Play, AlertTriangle, HardDrive } from "lucide-react";
import { useDownloads } from "@/context/DownloadsContext";
import { usePlayer } from "@/context/PlayerContext";
import { useSongs } from "@/context/SongsContext";
import CoverImage from "@/components/media/CoverImage";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { formatDuration } from "@/lib/format";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DescargasPage() {
  const { offlineMeta, removeDownload, storageEstimate } = useDownloads();
  const { playSong } = usePlayer();
  const { getSongById } = useSongs();

  const tracks = Object.values(offlineMeta).sort(
    (a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()
  );
  const totalBytes = tracks.reduce((sum, t) => sum + t.sizeBytes, 0);

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <PageHeader title="Mis descargas" subtitle={`${tracks.length} canciones disponibles sin conexión`} />

      <div className="mb-6 flex items-start gap-2 rounded-xl border border-border bg-surface/60 p-3 text-xs text-foreground-muted">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          Las descargas se guardan únicamente en este navegador (no en una cuenta en la nube). Se pueden
          perder si borras los datos del sitio, usas modo incógnito, o cambias de dispositivo o navegador.
        </p>
      </div>

      {storageEstimate && storageEstimate.quota > 0 && (
        <div className="mb-6 flex items-center gap-3 text-xs text-foreground-muted">
          <HardDrive className="h-3.5 w-3.5 shrink-0" />
          <span>
            {formatBytes(totalBytes)} descargados · {formatBytes(storageEstimate.usage)} de{" "}
            {formatBytes(storageEstimate.quota)} usados en este navegador
          </span>
        </div>
      )}

      {tracks.length === 0 ? (
        <EmptyState
          icon={Download}
          title="Todavía no has descargado ninguna canción"
          description="Busca el ícono de descarga sin conexión en el reproductor para guardar canciones y escucharlas sin internet."
          actionLabel="Explorar canciones"
          actionHref="/canciones"
        />
      ) : (
        <div className="space-y-0.5">
          {tracks.map((track) => {
            const song = getSongById(track.songId);
            return (
              <div key={track.songId} className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-hover">
                <button
                  type="button"
                  onClick={() => song && playSong(song)}
                  disabled={!song}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:opacity-50"
                >
                  <div className="h-11 w-11 shrink-0">
                    <CoverImage src={track.coverUrl} title={track.title} size="xs" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{track.title}</p>
                    <p className="truncate text-xs text-foreground-muted">
                      {track.artist} · {formatDuration(track.duration)} · {formatBytes(track.sizeBytes)}
                    </p>
                  </div>
                  <Play className="h-4 w-4 shrink-0 text-foreground-muted opacity-0 group-hover:opacity-100" />
                </button>
                <button
                  type="button"
                  onClick={() => removeDownload(track.songId)}
                  aria-label={`Quitar descarga de ${track.title}`}
                  title="Quitar descarga"
                  className="shrink-0 rounded-full p-2 text-foreground-muted hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
