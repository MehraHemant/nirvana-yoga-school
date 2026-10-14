-- AI chatbot + future RAG knowledge base (Neon Postgres)
-- Applied via: npm run db:migrate:chat

CREATE TABLE IF NOT EXISTS "chat_conversations" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "admin_user_id" TEXT,
    "title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "chat_conversations_session_id_idx"
    ON "chat_conversations" ("session_id");

CREATE INDEX IF NOT EXISTS "chat_conversations_updated_at_idx"
    ON "chat_conversations" ("updated_at");

CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chat_messages_conversation_id_fkey"
        FOREIGN KEY ("conversation_id")
        REFERENCES "chat_conversations" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "chat_messages_conversation_id_idx"
    ON "chat_messages" ("conversation_id");

CREATE INDEX IF NOT EXISTS "chat_messages_created_at_idx"
    ON "chat_messages" ("conversation_id", "created_at");

-- Minimal knowledge-base chunks for future RAG (page/blog content slices).
CREATE TABLE IF NOT EXISTS "knowledge_base_chunks" (
    "id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT,
    "source_path" TEXT,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "embedding" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_base_chunks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "knowledge_base_chunks_source_idx"
    ON "knowledge_base_chunks" ("source_type", "source_id");

CREATE INDEX IF NOT EXISTS "knowledge_base_chunks_path_idx"
    ON "knowledge_base_chunks" ("source_path");
