-- AlterTable
ALTER TABLE "lead_submissions" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "lead_submissions_deleted_at_idx" ON "lead_submissions"("deleted_at");
