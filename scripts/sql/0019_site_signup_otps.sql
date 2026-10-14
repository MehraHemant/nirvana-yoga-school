-- Email verification for public signups.
-- Created automatically on first signup; this file is the schema record.

-- Pending signups waiting for their emailed code. One row per email; the
-- site_users row is only created once the code is verified.
CREATE TABLE IF NOT EXISTS "site_signup_otps" (
  "email" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "code_hash" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "sends" INTEGER NOT NULL DEFAULT 1,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "last_sent_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "site_users"
  ADD COLUMN IF NOT EXISTS "email_verified_at" TIMESTAMPTZ;
