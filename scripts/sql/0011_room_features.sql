-- Shared room feature bullets (moved from per-page pricing options)
-- Applied via: npm run db:migrate:room-features
-- Room feature values are managed in the CMS (rooms.features); the bundled
-- catalog seed this comment referenced has been removed.

ALTER TABLE "rooms"
  ADD COLUMN IF NOT EXISTS "features" JSONB NOT NULL DEFAULT '[]'::jsonb;
