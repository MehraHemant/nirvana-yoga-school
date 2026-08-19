-- Public-facing room label (separate from internal `name`)
-- Applied via: npm run db:migrate:room-title

ALTER TABLE "rooms"
  ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL DEFAULT '';
