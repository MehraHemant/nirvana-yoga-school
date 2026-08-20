-- Additional guests for multi-person room bookings (e.g. double room)
-- Applied via: npm run db:migrate:booking-guests

ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "additional_guests" JSONB NOT NULL DEFAULT '[]'::jsonb;
