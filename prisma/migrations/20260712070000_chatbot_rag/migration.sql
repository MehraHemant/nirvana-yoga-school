-- pgvector extension (requires pgvector/pgvector Docker image)
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "ChatMessageRole" AS ENUM ('user', 'assistant', 'system');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('pending', 'processing', 'indexed', 'failed');

-- CreateEnum
CREATE TYPE "DocumentSourceType" AS ENUM ('txt', 'markdown', 'html', 'pdf', 'docx');

-- CreateTable
CREATE TABLE "chat_conversations" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "title" TEXT,
    "summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "role" "ChatMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "source_type" "DocumentSourceType" NOT NULL,
    "mime_type" TEXT,
    "file_size" INTEGER,
    "status" "DocumentStatus" NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_document_chunks" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_document_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_embeddings" (
    "id" TEXT NOT NULL,
    "chunk_id" TEXT NOT NULL,
    "vector" vector(768) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_conversations_session_id_updated_at_idx" ON "chat_conversations"("session_id", "updated_at");

-- CreateIndex
CREATE INDEX "chat_messages_conversation_id_created_at_idx" ON "chat_messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "chat_documents_status_created_at_idx" ON "chat_documents"("status", "created_at");

-- CreateIndex
CREATE INDEX "chat_document_chunks_document_id_idx" ON "chat_document_chunks"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_document_chunks_document_id_chunk_index_key" ON "chat_document_chunks"("document_id", "chunk_index");

-- CreateIndex
CREATE UNIQUE INDEX "chat_embeddings_chunk_id_key" ON "chat_embeddings"("chunk_id");

-- HNSW index for cosine similarity search (nomic-embed-text)
CREATE INDEX "chat_embeddings_vector_hnsw_idx" ON "chat_embeddings" USING hnsw ("vector" vector_cosine_ops);

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_document_chunks" ADD CONSTRAINT "chat_document_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "chat_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_embeddings" ADD CONSTRAINT "chat_embeddings_chunk_id_fkey" FOREIGN KEY ("chunk_id") REFERENCES "chat_document_chunks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
