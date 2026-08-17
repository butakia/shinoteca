import Link from "next/link";
import type { Album } from "@/lib/types";
import CoverImage from "@/components/media/CoverImage";
import { releaseTypeLabels } from "@/lib/format";

export default function AlbumCard({ album }: { album: Album }) {
  return (
    <Link href={`/albumes/${album.id}`} className="group block w-full">
      <CoverImage src={album.coverUrl} title={album.title} size="medium" className="shadow-lg" />
      <div className="mt-2">
        <p className="truncate text-sm font-medium text-foreground group-hover:underline">{album.title}</p>
        <p className="truncate text-xs text-foreground-muted">
          {releaseTypeLabels[album.releaseType]} {album.year ? `· ${album.year}` : ""}
        </p>
      </div>
    </Link>
  );
}
