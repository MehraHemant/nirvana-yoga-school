-- CreateTable
CREATE TABLE "module_library_items" (
    "id" TEXT NOT NULL,
    "module_key" TEXT NOT NULL,
    "variant" TEXT,
    "name" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_library_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "module_library_items_module_key_variant_idx" ON "module_library_items"("module_key", "variant");
