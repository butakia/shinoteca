import { ShieldAlert } from "lucide-react";
import type { Song } from "@/lib/types";
import { useNotices } from "@/context/NoticesContext";

export default function LyricsTab({ song }: { song: Song }) {
  const { getNoticeText } = useNotices();
  const notice = getNoticeText("lyrics");

  return (
    <div className="h-full overflow-y-auto px-4 py-4">
      {song.lyrics ? (
        <>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{song.lyrics}</p>
          {notice && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-surface/60 p-3 text-xs text-foreground-muted">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>{notice}</p>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-foreground-muted">Letra no disponible.</p>
      )}
    </div>
  );
}
