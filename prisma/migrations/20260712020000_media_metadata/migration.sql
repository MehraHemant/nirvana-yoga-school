-- AlterTable
ALTER TABLE "media_assets" ADD COLUMN "caption" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
