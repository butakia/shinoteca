// SSR-safe localStorage helpers. All player/favorites/playlist state in this
// foundation pass lives in the browser only — see README for what a real
// backend (accounts, DB-backed history) would replace here.
export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — fail silently, state stays in-memory
  }
}

export const STORAGE_KEYS = {
  playerState: "shinoflow:player:v1",
  favorites: "shinoflow:favorites:v1",
  likes: "shinoflow:likes:v1",
  history: "shinoflow:history:v1",
  playCounts: "shinoflow:play-counts:v1",
  playlists: "shinoflow:playlists:v1",
  searchHistory: "shinoflow:search-history:v1",
  smartQueue: "shinoflow:smart-queue:v1",
  institutionalPages: "shinoflow:institutional-pages:v1",
  collaborators: "shinoflow:collaborators:v1",
  songOverrides: "shinoflow:song-overrides:v1",
  deletedSongIds: "shinoflow:deleted-song-ids:v1",
  songEditLog: "shinoflow:song-edit-log:v1",
  notices: "shinoflow:notices:v1",
  premium: "shinoflow:premium:v1",
  onlyShinoflow: "shinoflow:only-shinoflow:v1",
} as const;
