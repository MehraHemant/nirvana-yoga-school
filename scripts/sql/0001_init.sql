-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('course', 'online', 'retreat', 'venue', 'site', 'blog');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('admin', 'editor');

-- CreateEnum
CREATE TYPE "NavItemType" AS ENUM ('page', 'static');

-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('enquiry', 'contact');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'read', 'replied', 'archived');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('course', 'retreat');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending_payment', 'confirmed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('full', 'deposit_20');

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "PageType" NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image" VARCHAR(500) NOT NULL DEFAULT '',
    "fee" TEXT NOT NULL DEFAULT '',
    "duration" TEXT NOT NULL DEFAULT '',
    "cta_label" TEXT,
    "cta_href" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "content_type_id" TEXT,
    "content_data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "page_modules" JSONB,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_types" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'page',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "page_types" JSONB NOT NULL DEFAULT '["site"]',
    "fields" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_items" (
    "id" TEXT NOT NULL,
    "content_type_id" TEXT NOT NULL,
    "slug" TEXT,
    "name" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_references" (
    "id" TEXT NOT NULL,
    "from_id" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,
    "field_key" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "content_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_sections" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "eyebrow" TEXT,
    "body" TEXT,
    "layout" TEXT NOT NULL DEFAULT 'default',
    "image" TEXT,
    "images" JSONB NOT NULL DEFAULT '[]',
    "blocks" JSONB,

    CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_subsections" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "image" TEXT,

    CONSTRAINT "section_subsections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_items" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "section_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subsection_items" (
    "id" TEXT NOT NULL,
    "subsection_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "subsection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_packages" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "page_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_gallery_images" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "media_asset_id" TEXT,

    CONSTRAINT "page_gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_cards" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "href" TEXT,

    CONSTRAINT "page_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_people" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "summary" TEXT,
    "bio" TEXT,
    "education" JSONB NOT NULL DEFAULT '[]',
    "experience" JSONB NOT NULL DEFAULT '[]',
    "expertise" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "page_people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_highlights" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "page_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_documents" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "document" JSONB NOT NULL,

    CONSTRAINT "course_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "excerpt" TEXT NOT NULL,
    "image" TEXT NOT NULL DEFAULT '',
    "published_at" TIMESTAMP(3),
    "content" JSONB NOT NULL DEFAULT '[]',
    "body_html" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navigation_groups" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "navigation_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navigation_items" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "item_type" "NavItemType" NOT NULL,
    "page_type" TEXT,
    "page_slug" TEXT,
    "href" TEXT,
    "label" TEXT,

    CONSTRAINT "navigation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "cdn_key" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'editor',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_revisions" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "slug" TEXT,
    "snapshot" JSONB NOT NULL,
    "admin_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_revisions_pkey" PRIMARY KEY ("id")
);

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
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "lead_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "type" "BookingType" NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending_payment',
    "program_slug" TEXT NOT NULL,
    "program_title" TEXT NOT NULL,
    "room_type" TEXT NOT NULL,
    "batch_date" TEXT NOT NULL,
    "duration" TEXT,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT,
    "reference_code" TEXT,
    "hear_about" TEXT,
    "payment_mode" "PaymentMode" NOT NULL,
    "base_price_cents" INTEGER NOT NULL,
    "full_amount_cents" INTEGER NOT NULL,
    "pay_now_cents" INTEGER NOT NULL,
    "paypal_fee_cents" INTEGER NOT NULL,
    "total_pay_now_cents" INTEGER NOT NULL,
    "remaining_cents" INTEGER NOT NULL,
    "promo_code" TEXT,
    "discount_cents" INTEGER NOT NULL DEFAULT 0,
    "paypal_order_id" TEXT,
    "paypal_capture_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "confirmed_at" TIMESTAMP(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_type_published_idx" ON "pages"("type", "published");

-- CreateIndex
CREATE INDEX "pages_type_title_idx" ON "pages"("type", "title");

-- CreateIndex
CREATE INDEX "pages_updated_at_idx" ON "pages"("updated_at");

-- CreateIndex
CREATE INDEX "pages_content_type_id_idx" ON "pages"("content_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_types_key_key" ON "content_types"("key");

-- CreateIndex
CREATE INDEX "content_types_sort_order_idx" ON "content_types"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "content_items_slug_key" ON "content_items"("slug");

-- CreateIndex
CREATE INDEX "content_items_content_type_id_published_idx" ON "content_items"("content_type_id", "published");

-- CreateIndex
CREATE INDEX "content_items_content_type_id_sort_order_idx" ON "content_items"("content_type_id", "sort_order");

-- CreateIndex
CREATE INDEX "content_items_updated_at_idx" ON "content_items"("updated_at");

-- CreateIndex
CREATE INDEX "content_references_to_id_idx" ON "content_references"("to_id");

-- CreateIndex
CREATE INDEX "content_references_from_id_field_key_sort_order_idx" ON "content_references"("from_id", "field_key", "sort_order");

-- CreateIndex
CREATE INDEX "page_sections_page_id_sort_order_idx" ON "page_sections"("page_id", "sort_order");

-- CreateIndex
CREATE INDEX "section_subsections_section_id_sort_order_idx" ON "section_subsections"("section_id", "sort_order");

-- CreateIndex
CREATE INDEX "section_items_section_id_sort_order_idx" ON "section_items"("section_id", "sort_order");

-- CreateIndex
CREATE INDEX "subsection_items_subsection_id_sort_order_idx" ON "subsection_items"("subsection_id", "sort_order");

-- CreateIndex
CREATE INDEX "page_packages_page_id_sort_order_idx" ON "page_packages"("page_id", "sort_order");

-- CreateIndex
CREATE INDEX "page_gallery_images_page_id_sort_order_idx" ON "page_gallery_images"("page_id", "sort_order");

-- CreateIndex
CREATE INDEX "page_cards_page_id_sort_order_idx" ON "page_cards"("page_id", "sort_order");

-- CreateIndex
CREATE INDEX "page_people_page_id_sort_order_idx" ON "page_people"("page_id", "sort_order");

-- CreateIndex
CREATE INDEX "page_highlights_page_id_sort_order_idx" ON "page_highlights"("page_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "course_documents_page_id_key" ON "course_documents"("page_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_published_published_at_idx" ON "blog_posts"("published", "published_at");

-- CreateIndex
CREATE INDEX "blog_posts_updated_at_idx" ON "blog_posts"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "navigation_groups_key_key" ON "navigation_groups"("key");

-- CreateIndex
CREATE INDEX "navigation_items_group_id_sort_order_idx" ON "navigation_items"("group_id", "sort_order");

-- CreateIndex
CREATE INDEX "navigation_items_page_slug_idx" ON "navigation_items"("page_slug");

-- CreateIndex
CREATE INDEX "media_assets_cdn_key_idx" ON "media_assets"("cdn_key");

-- CreateIndex
CREATE INDEX "media_assets_created_at_idx" ON "media_assets"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "content_revisions_entity_type_entity_id_idx" ON "content_revisions"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "content_revisions_slug_idx" ON "content_revisions"("slug");

-- CreateIndex
CREATE INDEX "module_library_items_module_key_variant_idx" ON "module_library_items"("module_key", "variant");

-- CreateIndex
CREATE INDEX "lead_submissions_type_created_at_idx" ON "lead_submissions"("type", "created_at");

-- CreateIndex
CREATE INDEX "lead_submissions_status_created_at_idx" ON "lead_submissions"("status", "created_at");

-- CreateIndex
CREATE INDEX "lead_submissions_deleted_at_idx" ON "lead_submissions"("deleted_at");

-- CreateIndex
CREATE INDEX "bookings_type_status_created_at_idx" ON "bookings"("type", "status", "created_at");

-- CreateIndex
CREATE INDEX "bookings_program_slug_idx" ON "bookings"("program_slug");

-- CreateIndex
CREATE INDEX "bookings_deleted_at_idx" ON "bookings"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "global_settings_key_key" ON "global_settings"("key");

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_content_type_id_fkey" FOREIGN KEY ("content_type_id") REFERENCES "content_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_content_type_id_fkey" FOREIGN KEY ("content_type_id") REFERENCES "content_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_references" ADD CONSTRAINT "content_references_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_references" ADD CONSTRAINT "content_references_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "content_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_subsections" ADD CONSTRAINT "section_subsections_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "page_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_items" ADD CONSTRAINT "section_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "page_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subsection_items" ADD CONSTRAINT "subsection_items_subsection_id_fkey" FOREIGN KEY ("subsection_id") REFERENCES "section_subsections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_packages" ADD CONSTRAINT "page_packages_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_gallery_images" ADD CONSTRAINT "page_gallery_images_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_gallery_images" ADD CONSTRAINT "page_gallery_images_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_cards" ADD CONSTRAINT "page_cards_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_people" ADD CONSTRAINT "page_people_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_highlights" ADD CONSTRAINT "page_highlights_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_documents" ADD CONSTRAINT "course_documents_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "navigation_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

