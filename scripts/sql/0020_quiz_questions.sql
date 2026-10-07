-- CMS-managed quiz: question bank and richer attempt records.
-- Created automatically on first use; seed starter content with `npm run db:seed:quiz`.
-- Quiz settings live in global_settings under the key 'quiz'.

CREATE TABLE IF NOT EXISTS "quiz_questions" (
  "id" TEXT PRIMARY KEY,
  "prompt" TEXT NOT NULL,
  "prompt_image_url" TEXT NOT NULL DEFAULT '',
  -- 'text' or 'image'
  "option_type" TEXT NOT NULL DEFAULT 'text',
  -- [{ "label": "...", "imageUrl": "..." }]
  "options" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "correct_index" INTEGER NOT NULL,
  "explanation" TEXT NOT NULL DEFAULT '',
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "quiz_questions_sort_idx"
  ON "quiz_questions" ("sort_order");

-- Existing attempts came from the fixed 10-question, 10-point demo quiz.
ALTER TABLE "quiz_attempts"
  ADD COLUMN IF NOT EXISTS "max_score" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS "total_questions" INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS "correct_count" INTEGER,
  ADD COLUMN IF NOT EXISTS "incorrect_count" INTEGER,
  ADD COLUMN IF NOT EXISTS "skipped_count" INTEGER,
  ADD COLUMN IF NOT EXISTS "duration_ms" INTEGER,
  -- [{ "questionId": "...", "selectedIndex": 0, "status": "correct" }]
  ADD COLUMN IF NOT EXISTS "answers" JSONB;
