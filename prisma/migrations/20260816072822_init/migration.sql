-- CreateTable
CREATE TABLE "UploadedSong" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
