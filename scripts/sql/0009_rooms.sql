-- Shared course / retreat room catalogs (Neon Postgres)
-- Applied via: npm run db:migrate:rooms

CREATE TABLE IF NOT EXISTS "rooms" (
    "id" TEXT NOT NULL,
    "catalog" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "features" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "images" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "videos" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "live" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "rooms_catalog_check" CHECK ("catalog" IN ('course', 'retreat'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "rooms_catalog_slug_uidx"
    ON "rooms" ("catalog", "slug");

CREATE INDEX IF NOT EXISTS "rooms_catalog_sort_idx"
    ON "rooms" ("catalog", "sort");

CREATE INDEX IF NOT EXISTS "rooms_catalog_live_idx"
    ON "rooms" ("catalog", "live");
