-- CreateTable
CREATE TABLE "NoticeOverride" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "patch" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AlbumOverride" (
    "albumId" TEXT NOT NULL PRIMARY KEY,
    "patch" TEXT NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);
