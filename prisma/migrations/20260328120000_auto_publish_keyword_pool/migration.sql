-- Redefine AiTask to remove keywordSource and keep new workflow fields
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AiTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "runTime" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "dailyCount" INTEGER NOT NULL DEFAULT 1,
    "articleType" TEXT NOT NULL DEFAULT 'question',
    "autoPublish" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "siteId" TEXT,
    "targetSitesJson" JSONB,
    CONSTRAINT "AiTask_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AiTask" (
  "id", "taskName", "enabled", "runTime", "language", "dailyCount", "articleType", "autoPublish", "createdAt", "updatedAt", "siteId", "targetSitesJson"
)
SELECT
  "id", "taskName", "enabled", "runTime", "language", "dailyCount", "articleType", "autoPublish", "createdAt", "updatedAt", "siteId", "targetSitesJson"
FROM "AiTask";
DROP TABLE "AiTask";
ALTER TABLE "new_AiTask" RENAME TO "AiTask";

CREATE TABLE "KeywordPool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keyword" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
