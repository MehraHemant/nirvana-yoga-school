-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('course', 'online', 'retreat', 'venue', 'site', 'blog');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('admin', 'editor');

-- CreateEnum
CREATE TYPE "NavItemType" AS ENUM ('page', 'static');

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "PageType" NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "cta_label" TEXT,
    "cta_href" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_type_published_idx" ON "pages"("type", "published");

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
CREATE UNIQUE INDEX "navigation_groups_key_key" ON "navigation_groups"("key");

-- CreateIndex
CREATE INDEX "navigation_items_group_id_sort_order_idx" ON "navigation_items"("group_id", "sort_order");

-- CreateIndex
CREATE INDEX "media_assets_created_at_idx" ON "media_assets"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "content_revisions_entity_type_entity_id_idx" ON "content_revisions"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "content_revisions_slug_idx" ON "content_revisions"("slug");

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
