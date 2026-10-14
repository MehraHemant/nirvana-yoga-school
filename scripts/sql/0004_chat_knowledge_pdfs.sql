-- Chat RAG PDF knowledge documents (Neon Postgres)
-- Applied via: npm run db:migrate:chat-pdfs

CREATE TABLE IF NOT EXISTS "chat_knowledge_pdfs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "filename" TEXT NOT NULL,
    "storage_url" TEXT NOT NULL,
    "cdn_key" TEXT,
    "mime" TEXT NOT NULL DEFAULT 'application/pdf',
    "size_bytes" INTEGER NOT NULL DEFAULT 0,
    "content_hash" TEXT,
    "extracted_text" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "chunk_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_knowledge_pdfs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "chat_knowledge_pdfs_status_idx"
    ON "chat_knowledge_pdfs" ("status");

CREATE INDEX IF NOT EXISTS "chat_knowledge_pdfs_content_hash_idx"
    ON "chat_knowledge_pdfs" ("content_hash");

CREATE INDEX IF NOT EXISTS "chat_knowledge_pdfs_created_at_idx"
    ON "chat_knowledge_pdfs" ("created_at");
