-- Public site accounts (login / signup). Separate from admin_users.
-- Created automatically on first signup or login; this file is the schema record.

CREATE TABLE IF NOT EXISTS "site_users" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "site_users_email_key" ON "site_users" ("email");
