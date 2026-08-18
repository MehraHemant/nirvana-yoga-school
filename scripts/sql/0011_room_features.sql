-- Shared room feature bullets (moved from per-page pricing options)
-- Applied via: npm run db:migrate:room-features
-- Feature seed values live in src/content/lodging/room-catalog.ts (COURSE_ROOM_CATALOG)
-- and are upserted by scripts/apply-room-features-migration.ts / apply-rooms-migration.ts.

ALTER TABLE "rooms"
  ADD COLUMN IF NOT EXISTS "features" JSONB NOT NULL DEFAULT '[]'::jsonb;
