-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('enquiry', 'contact');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'read', 'replied', 'archived');

-- CreateTable
CREATE TABLE "lead_submissions" (
    "id" TEXT NOT NULL,
    "type" "LeadType" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'new',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "program" TEXT,
    "accommodation" TEXT,
    "start_date" TEXT,
    "message" TEXT NOT NULL,
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "lead_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_submissions_type_created_at_idx" ON "lead_submissions"("type", "created_at");

-- CreateIndex
CREATE INDEX "lead_submissions_status_created_at_idx" ON "lead_submissions"("status", "created_at");
