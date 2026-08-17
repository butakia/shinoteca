// Minimal IndexedDB wrapper for storing downloaded song audio as Blobs, so
// "Mis descargas" can play songs with no network round-trip at all — a
// blob: URL created from a locally-stored Blob needs nothing from the
// server, unlike the browser's HTTP cache which can still be evicted or
// require a revalidation request.
const DB_NAME = "shinoteca-offline";
const DB_VERSION = 1;
const STORE = "tracks";

export type OfflineTrackMeta = {
  songId: string;
  title: string;
  artist: string;
  coverUrl?: string;
  duration: number;
  sizeBytes: number;
  downloadedAt: string;
};

export type OfflineTrackRecord = OfflineTrackMeta & { blob: Blob };

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "songId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveOfflineTrack(record: OfflineTrackRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineTrack(songId: string): Promise<OfflineTrackRecord | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(songId);
    req.onsuccess = () => resolve(req.result as OfflineTrackRecord | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteOfflineTrack(songId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(songId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listOfflineTracks(): Promise<OfflineTrackMeta[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as OfflineTrackRecord[]) ?? [];
      resolve(rows.map(({ blob: _blob, ...meta }) => meta));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function estimateStorage(): Promise<{ usage: number; quota: number } | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null;
  const { usage, quota } = await navigator.storage.estimate();
  return { usage: usage ?? 0, quota: quota ?? 0 };
}
