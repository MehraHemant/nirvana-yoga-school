-- Optional room selector eyebrow per shared catalog room
-- Applied via: npm run db:migrate:room-eyebrow

ALTER TABLE "rooms"
  ADD COLUMN IF NOT EXISTS "eyebrow" TEXT NOT NULL DEFAULT '';
