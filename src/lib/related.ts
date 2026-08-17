import type { Song } from "@/lib/types";

export type RelatedSection = {
  title: string;
  songs: Song[];
};

// Priority order for "what to show next" when a song has no useful album
// context (or in addition to it): same artist, then same era, then similar
// tags/genre, then a general library mix — labeled honestly so the panel
// never implies a relationship (like a fake album) that doesn't exist.
export function getRelatedSection(song: Song, allSongs: Song[]): RelatedSection {
  const pool = allSongs.filter((s) => s.id !== song.id);

  const sameArtist = pool.filter((s) => s.artist === song.artist || (song.alias && s.alias === song.alias));
  if (sameArtist.length > 0) {
    return { title: `Más de ${song.alias ?? song.artist}`, songs: sameArtist.slice(0, 8) };
  }

  if (song.year) {
    const sameEra = pool.filter((s) => s.year === song.year);
    if (sameEra.length > 0) {
      return { title: "De la misma época", songs: sameEra.slice(0, 8) };
    }
  }

  const sameTagsOrGenre = pool.filter(
    (s) => (song.genre && s.genre === song.genre) || s.tags.some((t) => song.tags.includes(t))
  );
  if (sameTagsOrGenre.length > 0) {
    return { title: "También te puede interesar", songs: sameTagsOrGenre.slice(0, 8) };
  }

  // No signal at all — an honestly-labeled shuffle instead of silence.
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return { title: "Mix sugerido para ti", songs: shuffled.slice(0, 8) };
}
