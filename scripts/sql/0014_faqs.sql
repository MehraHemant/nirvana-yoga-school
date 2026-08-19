-- Centralized FAQ catalog + per-page assignments (Neon Postgres)
-- Applied via: npm run db:migrate:faqs

CREATE TABLE IF NOT EXISTS "faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL DEFAULT '',
    "answer" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'general',
    "admin_tag" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "faqs_category_check" CHECK (
        "category" IN ('general', 'certification', 'lodging-meals', 'travel-health')
    )
);

CREATE INDEX IF NOT EXISTS "faqs_category_idx" ON "faqs" ("category");
CREATE INDEX IF NOT EXISTS "faqs_admin_tag_idx" ON "faqs" ("admin_tag");

CREATE TABLE IF NOT EXISTS "page_faq_assignments" (
    "id" TEXT NOT NULL,
    "context_type" TEXT NOT NULL,
    "context_key" TEXT NOT NULL,
    "faq_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "extras" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_faq_assignments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "page_faq_assignments_faq_id_fkey"
        FOREIGN KEY ("faq_id") REFERENCES "faqs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "page_faq_assignments_context_type_check" CHECK (
        "context_type" IN ('page', 'global')
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS "page_faq_assignments_context_faq_uidx"
    ON "page_faq_assignments" ("context_type", "context_key", "faq_id");

CREATE INDEX IF NOT EXISTS "page_faq_assignments_context_sort_idx"
    ON "page_faq_assignments" ("context_type", "context_key", "sort_order");
