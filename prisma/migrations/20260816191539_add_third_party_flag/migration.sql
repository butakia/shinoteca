-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UploadedSong" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "alias" TEXT,
    "releaseType" TEXT NOT NULL DEFAULT 'single',
    "year" INTEGER,
    "genre" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "coverUrl" TEXT,
    "audioUrl" TEXT NOT NULL,
    "lyrics" TEXT,
    "description" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isThirdParty" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaderId" TEXT,
    CONSTRAINT "UploadedSong_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UploadedSong" ("alias", "artist", "audioUrl", "coverUrl", "createdAt", "description", "duration", "genre", "id", "isPublished", "lyrics", "releaseType", "tags", "title", "uploaderId", "year") SELECT "alias", "artist", "audioUrl", "coverUrl", "createdAt", "description", "duration", "genre", "id", "isPublished", "lyrics", "releaseType", "tags", "title", "uploaderId", "year" FROM "UploadedSong";
DROP TABLE "UploadedSong";
ALTER TABLE "new_UploadedSong" RENAME TO "UploadedSong";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
