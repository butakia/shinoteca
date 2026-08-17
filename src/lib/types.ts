// Data model for Shinoteca.
// Shaped to be DB-ready: the demo build below only ever uses AudioSource.type === "local"
// and CoverSource === "uploaded" | "fallback", but the fields for external/storage-backed
// audio and multi-quality downloads already exist so a later pass (admin + downloads) can
// populate them without changing this shape.

export type ReleaseType =
  | "single"
  | "demo"
  | "maqueta"
  | "ep"
  | "lp"
  | "compilation";

export type AudioSourceType = "local" | "external" | "storage";

export type AudioSource = {
  type: AudioSourceType;
  url: string;
  provider?: string;
  format?: string;
  bitrate?: number;
  fileSize?: number;
  qualityLabel?: string;
  downloadable?: boolean;
};

export type CoverSource = "uploaded" | "external" | "fallback";

export type Artist = {
  id: string;
  name: string;
  alias?: string;
  description?: string;
  imageUrl?: string;
  activeYears?: string;
};

export type Album = {
  id: string;
  title: string;
  artistId: string;
  releaseType: ReleaseType;
  year?: number;
  coverUrl?: string;
  coverSource?: CoverSource;
  description?: string;
  credits?: string;
  trackOrder?: string[];
  isThirdParty?: boolean;
};

export type MetadataStatus = "complete" | "partial" | "missing";

export type Song = {
  id: string;
  title: string;
  originalFileName?: string;
  originalFolderName?: string;
  artist: string;
  alias?: string;
  albumId?: string;
  releaseType: ReleaseType;
  year?: number;
  trackNumber?: number;
  genre?: string;
  duration: number;
  coverUrl?: string;
  coverSource?: CoverSource;
  lyrics?: string;
  description?: string;
  credits?: string;
  notes?: string;
  tags: string[];
  audioSources: AudioSource[];
  isPublished: boolean;
  isDownloadable: boolean;
  commentsEnabled: boolean;
  isFeatured?: boolean;
  includeInRecommendations?: boolean;
  includeInMixes?: boolean;
  metadataStatus?: MetadataStatus;
  needsReview?: boolean;
  // The catalog is centered on Shinoflow, but the community can also upload
  // other artists — this flags those so listings can filter to "solo
  // Shinoflow" for people who want just that.
  isThirdParty?: boolean;
};

export type RepeatMode = "off" | "all" | "one";

export type Playlist = {
  id: string;
  name: string;
  songIds: string[];
  createdAt: string;
  updatedAt: string;
};
