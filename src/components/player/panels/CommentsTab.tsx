"use client";

import type { Song } from "@/lib/types";
import CommentsSection from "@/components/song/CommentsSection";

export default function CommentsTab({ song }: { song: Song }) {
  return (
    <div className="h-full overflow-y-auto px-4 py-4">
      <CommentsSection songId={song.id} enabled={song.commentsEnabled} />
    </div>
  );
}
