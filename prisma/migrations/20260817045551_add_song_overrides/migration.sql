-- CreateTable
CREATE TABLE "SongOverride" (
    "songId" TEXT NOT NULL PRIMARY KEY,
    "patch" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DeletedSong" (
    "songId" TEXT NOT NULL PRIMARY KEY,
    "deletedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
