-- Per-page SEO metadata (title, description, OG image, keywords, noindex)
-- Applied via: npm run db:migrate:page-seo

CREATE TABLE IF NOT EXISTS "page_seo" (
  "page_id" TEXT PRIMARY KEY REFERENCES "pages"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "og_image" TEXT NOT NULL DEFAULT '',
  "keywords" TEXT NOT NULL DEFAULT '',
  "no_index" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
