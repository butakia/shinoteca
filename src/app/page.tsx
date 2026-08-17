"use client";

import Link from "next/link";
import { Play, Shuffle, Clock, TrendingUp, Heart, CalendarDays, Disc3, Archive } from "lucide-react";
import { getAllAlbums } from "@/lib/data";
import { useSongs } from "@/context/SongsContext";
import { useNotices } from "@/context/NoticesContext";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";
import SongCard from "@/components/song/SongCard";
import AlbumCard from "@/components/song/AlbumCard";
import HorizontalRail from "@/components/common/HorizontalRail";
import EmptyState from "@/components/common/EmptyState";
import CoverImage from "@/components/media/CoverImage";
import AdBanner from "@/components/ads/AdBanner";
import { releaseTypeLabels } from "@/lib/format";
import type { ReleaseType } from "@/lib/types";

const releaseGroups: ReleaseType[] = ["maqueta", "ep", "lp", "compilation"];

export default function HomePage() {
  const { getAllSongs, getFeaturedSongs, getAvailableYears, getSongById } = useSongs();
  const { getNoticeText } = useNotices();
  const { playQueueAt, history, playCounts } = usePlayer();
  const { favorites } = useFavorites();

  const allSongs = getAllSongs();
  const featured = getFeaturedSongs();
  const albums = getAllAlbums();
  const years = getAvailableYears();
  const authorizationNotice = getNoticeText("authorization");

  const hero = featured[0] ?? allSongs[0];

  const recentlyPlayed = history
    .map((id) => getSongById(id))
    .filter((s): s is NonNullable<typeof s> => !!s)
    .slice(0, 8);

  const mostPlayed = Object.entries(playCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => getSongById(id))
    .filter((s): s is NonNullable<typeof s> => !!s)
    .slice(0, 8);

  const favoriteSongs = favorites
    .map((id) => getSongById(id))
    .filter((s): s is NonNullable<typeof s> => !!s);

  const seedSong = recentlyPlayed[0];
  const recommended = seedSong
    ? allSongs
        .filter(
          (s) =>
            s.id !== seedSong.id &&
            !history.includes(s.id) &&
            (s.genre === seedSong.genre || s.tags.some((t) => seedSong.tags.includes(t)))
        )
        .slice(0, 8)
    : allSongs.slice(0, 8);

  return (
    <div className="pb-10">
      {/* hero */}
      {hero && (
        <section className="relative overflow-hidden px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10">
            {hero.coverUrl ? (
              <div
                className="h-full w-full scale-110 bg-cover bg-center opacity-25 blur-3xl"
                style={{ backgroundImage: `url(${hero.coverUrl})` }}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-red-900/30 via-background to-background" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>

          {authorizationNotice && (
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-accent">
              {authorizationNotice}
            </p>
          )}
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end">
            <div className="w-40 shrink-0 sm:w-56">
              <CoverImage src={hero.coverUrl} title={hero.title} size="large" priority />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-4xl">{hero.title}</h1>
              <p className="mt-1 text-sm text-foreground-muted sm:text-base">
                {hero.alias ?? hero.artist} {hero.year ? `· ${hero.year}` : ""} ·{" "}
                {releaseTypeLabels[hero.releaseType]}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => playQueueAt(featured.length ? featured : allSongs, 0)}
                  className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:bg-accent/90 active:scale-95"
                >
                  <Play className="h-4 w-4" fill="currentColor" strokeWidth={0} /> Reproducir destacadas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const shuffled = [...allSongs].sort(() => Math.random() - 0.5);
                    playQueueAt(shuffled, 0);
                  }}
                  className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
                >
                  <Shuffle className="h-4 w-4" /> Mix aleatorio
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <HorizontalRail title="Canciones destacadas" viewAllHref="/canciones">
          {featured.map((song) => (
            <div key={song.id} className="w-40 shrink-0 sm:w-44">
              <SongCard song={song} queue={featured} />
            </div>
          ))}
        </HorizontalRail>
      )}

      <HorizontalRail title="Álbumes y recopilaciones recientes" viewAllHref="/albumes">
        {albums.map((album) => (
          <div key={album.id} className="w-40 shrink-0 sm:w-44">
            <AlbumCard album={album} />
          </div>
        ))}
      </HorizontalRail>

      <section className="mb-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-foreground-muted" />
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">Escuchado recientemente</h2>
        </div>
        {recentlyPlayed.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Todavía no has escuchado nada"
            description="Las canciones que reproduzcas aparecerán aquí para que continúes fácilmente."
            actionLabel="Explorar canciones"
            actionHref="/canciones"
          />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentlyPlayed.map((song) => (
              <div key={song.id} className="w-40 shrink-0 sm:w-44">
                <SongCard song={song} queue={recentlyPlayed} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-foreground-muted" />
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">Más reproducidas</h2>
        </div>
        {mostPlayed.length === 0 ? (
          <EmptyState icon={TrendingUp} title="Aún no hay estadísticas de reproducción" />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {mostPlayed.map((song) => (
              <div key={song.id} className="w-40 shrink-0 sm:w-44">
                <SongCard song={song} queue={mostPlayed} />
              </div>
            ))}
          </div>
        )}
      </section>

      <AdBanner slot="home-1" />

      <section className="mb-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center gap-2">
          <Heart className="h-4 w-4 text-foreground-muted" />
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">Favoritas</h2>
        </div>
        {favoriteSongs.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No tienes canciones favoritas"
            description="Toca el corazón en cualquier canción para guardarla aquí."
          />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {favoriteSongs.map((song) => (
              <div key={song.id} className="w-40 shrink-0 sm:w-44">
                <SongCard song={song} queue={favoriteSongs} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-foreground-muted" />
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">Explorar por año</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {years.map((year) => (
            <Link
              key={year}
              href={`/anios/${year}`}
              className="rounded-full border border-border px-4 py-2 text-sm text-foreground-muted transition-colors hover:border-accent/50 hover:text-foreground"
            >
              {year}
            </Link>
          ))}
        </div>
      </section>

      <HorizontalRail title="Explorar por álbum" viewAllHref="/albumes">
        {albums.map((album) => (
          <div key={album.id} className="w-40 shrink-0 sm:w-44">
            <AlbumCard album={album} />
          </div>
        ))}
      </HorizontalRail>

      <section className="mb-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center gap-2">
          <Archive className="h-4 w-4 text-foreground-muted" />
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">Maquetas, EP, LP y recopilaciones</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {releaseGroups.map((type) => (
            <Link
              key={type}
              href={`/lanzamientos/${type}`}
              className="glass flex flex-col items-center justify-center gap-2 rounded-xl px-4 py-6 text-center transition-colors hover:bg-surface-hover"
            >
              <Disc3 className="h-6 w-6 text-accent" strokeWidth={1.6} />
              <span className="text-sm font-medium text-foreground">{releaseTypeLabels[type]}</span>
            </Link>
          ))}
        </div>
      </section>

      <AdBanner slot="home-2" />

      <HorizontalRail title="Recomendado para ti" viewAllHref="/explorar">
        {recommended.map((song) => (
          <div key={song.id} className="w-40 shrink-0 sm:w-44">
            <SongCard song={song} queue={recommended} />
          </div>
        ))}
      </HorizontalRail>
    </div>
  );
}
