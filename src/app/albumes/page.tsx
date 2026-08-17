"use client";

import { useSongs } from "@/context/SongsContext";
import AlbumCard from "@/components/song/AlbumCard";
import PageHeader from "@/components/common/PageHeader";

export default function AlbumsPage() {
  // getVisibleAlbums (no getAllAlbums) para que respete "Solo Shinoflow".
  const { getVisibleAlbums } = useSongs();
  const albums = getVisibleAlbums();

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <PageHeader title="Álbumes" subtitle="Maquetas, EP, LP y recopilaciones" />
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
}
