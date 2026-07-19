-- Optional add-ons selected during booking checkout
ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "addons" JSONB NOT NULL DEFAULT '[]'::jsonb;
