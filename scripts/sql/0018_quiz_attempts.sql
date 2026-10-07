-- Finished quiz attempts. Two per account per Asia/Kolkata calendar month.
-- Created automatically on first quiz load or attempt record; this file is the schema record.

CREATE TABLE IF NOT EXISTS "quiz_attempts" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "completed_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "score" INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS "quiz_attempts_user_completed_idx"
  ON "quiz_attempts" ("user_id", "completed_at");
