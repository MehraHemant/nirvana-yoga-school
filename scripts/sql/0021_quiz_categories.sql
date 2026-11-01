-- Quiz question categories. Applied on first use by ensureQuizQuestionsTable;
-- this file is the schema record. Seed the question bank with `npm run db:seed:quiz`.

ALTER TABLE "quiz_questions"
  ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'yoga-basics';

-- Closest category for questions that existed before the column.
-- Only fills the default so a later admin edit is left alone.
UPDATE "quiz_questions" SET "category" = 'meditation'
  WHERE "id" = 'test-img-options' AND "category" = 'yoga-basics';
UPDATE "quiz_questions" SET "category" = 'yoga-philosophy'
  WHERE "id" = 'uml5vu7ftbj3yrbfqgf0xnlk' AND "category" = 'yoga-basics';
UPDATE "quiz_questions" SET "category" = 'yoga-poses'
  WHERE "id" = 'lgqf6skesou15mzjv96ev1m0' AND "category" = 'yoga-basics';
UPDATE "quiz_questions" SET "category" = 'chakras'
  WHERE "id" = 'd8c3u6f648hjmgmagd4jtciy' AND "category" = 'yoga-basics';
UPDATE "quiz_questions" SET "category" = '200-hour-ttc'
  WHERE "id" = 'rt5qe6sq718vp6n90g7vhov1' AND "category" = 'yoga-basics';
UPDATE "quiz_questions" SET "category" = 'yoga-poses'
  WHERE "id" = 'e3ompcasvrh5l8ahmcusgebo' AND "category" = 'yoga-basics';
UPDATE "quiz_questions" SET "category" = 'yoga-retreats'
  WHERE "id" = 'fblkbs4c4ztxbntbur5ihg2l' AND "category" = 'yoga-basics';
