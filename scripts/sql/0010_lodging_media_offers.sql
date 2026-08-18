-- Lodging media, food menus, per-page room offers, and date batches
-- Applied via: npm run db:migrate:lodging

-- ---------------------------------------------------------------------------
-- Media library (local /img/... URLs only for lodging seed)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "media_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tag" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "alt" TEXT NOT NULL DEFAULT '',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "media_images_tag_sort_idx"
    ON "media_images" ("tag", "sort");

CREATE UNIQUE INDEX IF NOT EXISTS "media_images_url_uidx"
    ON "media_images" ("url");

CREATE TABLE IF NOT EXISTS "media_videos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tag" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "alt" TEXT NOT NULL DEFAULT '',
    "poster" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_videos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "media_videos_tag_sort_idx"
    ON "media_videos" ("tag", "sort");

CREATE UNIQUE INDEX IF NOT EXISTS "media_videos_url_uidx"
    ON "media_videos" ("url");

-- ---------------------------------------------------------------------------
-- Room ↔ media junction tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "room_images" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "media_image_id" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "room_images_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "room_images_room_fkey"
        FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "room_images_media_fkey"
        FOREIGN KEY ("media_image_id") REFERENCES "media_images" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "room_images_room_media_uidx"
    ON "room_images" ("room_id", "media_image_id");

CREATE INDEX IF NOT EXISTS "room_images_room_sort_idx"
    ON "room_images" ("room_id", "sort");

CREATE TABLE IF NOT EXISTS "room_videos" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "media_video_id" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "room_videos_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "room_videos_room_fkey"
        FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "room_videos_media_fkey"
        FOREIGN KEY ("media_video_id") REFERENCES "media_videos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "room_videos_room_media_uidx"
    ON "room_videos" ("room_id", "media_video_id");

CREATE INDEX IF NOT EXISTS "room_videos_room_sort_idx"
    ON "room_videos" ("room_id", "sort");

-- ---------------------------------------------------------------------------
-- Food menus (replace global_settings courseFood / retreatFood as source of truth)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "food_menus" (
    "id" TEXT NOT NULL,
    "catalog" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "dietary_note" TEXT NOT NULL DEFAULT '',
    "live" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "food_menus_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "food_menus_catalog_check" CHECK ("catalog" IN ('course', 'retreat'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "food_menus_catalog_uidx"
    ON "food_menus" ("catalog");

CREATE TABLE IF NOT EXISTS "food_points" (
    "id" TEXT NOT NULL,
    "food_menu_id" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "sort" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "food_points_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "food_points_menu_fkey"
        FOREIGN KEY ("food_menu_id") REFERENCES "food_menus" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "food_points_menu_sort_idx"
    ON "food_points" ("food_menu_id", "sort");

CREATE TABLE IF NOT EXISTS "food_images" (
    "id" TEXT NOT NULL,
    "food_menu_id" TEXT NOT NULL,
    "media_image_id" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "food_images_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "food_images_menu_fkey"
        FOREIGN KEY ("food_menu_id") REFERENCES "food_menus" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "food_images_media_fkey"
        FOREIGN KEY ("media_image_id") REFERENCES "media_images" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "food_images_menu_media_uidx"
    ON "food_images" ("food_menu_id", "media_image_id");

CREATE INDEX IF NOT EXISTS "food_images_menu_sort_idx"
    ON "food_images" ("food_menu_id", "sort");

-- ---------------------------------------------------------------------------
-- Per-page offers, section flags, and date batches
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "page_room_offers" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "live" BOOLEAN NOT NULL DEFAULT TRUE,
    "price" TEXT NOT NULL DEFAULT '',
    "original_price" TEXT NOT NULL DEFAULT '',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "page_room_offers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "page_room_offers_page_fkey"
        FOREIGN KEY ("page_id") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "page_room_offers_room_fkey"
        FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "page_room_offers_page_room_uidx"
    ON "page_room_offers" ("page_id", "room_id");

CREATE INDEX IF NOT EXISTS "page_room_offers_page_live_idx"
    ON "page_room_offers" ("page_id", "live");

CREATE INDEX IF NOT EXISTS "page_room_offers_room_idx"
    ON "page_room_offers" ("room_id");

CREATE TABLE IF NOT EXISTS "page_section_flags" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "section_key" TEXT NOT NULL,
    "live" BOOLEAN NOT NULL DEFAULT TRUE,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "page_section_flags_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "page_section_flags_page_fkey"
        FOREIGN KEY ("page_id") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "page_section_flags_key_check"
        CHECK ("section_key" IN ('accommodation', 'food'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "page_section_flags_page_key_uidx"
    ON "page_section_flags" ("page_id", "section_key");

CREATE TABLE IF NOT EXISTS "page_date_batches" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "dates" TEXT NOT NULL DEFAULT '',
    "spaces" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT '',
    "tone" TEXT NOT NULL DEFAULT 'open',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "page_date_batches_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "page_date_batches_page_fkey"
        FOREIGN KEY ("page_id") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "page_date_batches_page_sort_idx"
    ON "page_date_batches" ("page_id", "sort");
