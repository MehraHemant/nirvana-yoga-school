-- CreateTable
CREATE TABLE `pages` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `type` ENUM('course', 'online', 'retreat', 'venue', 'site', 'blog') NOT NULL,
    `eyebrow` VARCHAR(191) NOT NULL DEFAULT '',
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL DEFAULT '',
    `image` VARCHAR(191) NOT NULL DEFAULT '',
    `cta_label` VARCHAR(191) NULL,
    `cta_href` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `content_type_id` VARCHAR(191) NULL,
    `content_data` JSON NOT NULL DEFAULT ('{}'),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `page_modules` JSON NULL,

    UNIQUE INDEX `pages_slug_key`(`slug`),
    INDEX `pages_type_published_idx`(`type`, `published`),
    INDEX `pages_content_type_id_idx`(`content_type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_types` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL DEFAULT '',
    `icon` VARCHAR(191) NOT NULL DEFAULT 'page',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `page_types` JSON NOT NULL,
    `fields` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `content_types_key_key`(`key`),
    INDEX `content_types_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_items` (
    `id` VARCHAR(191) NOT NULL,
    `content_type_id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `published_at` DATETIME(3) NULL,
    `data` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `content_items_slug_key`(`slug`),
    INDEX `content_items_content_type_id_published_idx`(`content_type_id`, `published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_references` (
    `id` VARCHAR(191) NOT NULL,
    `from_id` VARCHAR(191) NOT NULL,
    `to_id` VARCHAR(191) NOT NULL,
    `field_key` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `content_references_to_id_idx`(`to_id`),
    INDEX `content_references_from_id_field_key_sort_order_idx`(`from_id`, `field_key`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_sections` (
    `id` VARCHAR(191) NOT NULL,
    `page_id` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `eyebrow` VARCHAR(191) NULL,
    `body` TEXT NULL,
    `layout` VARCHAR(191) NOT NULL DEFAULT 'default',
    `image` VARCHAR(191) NULL,
    `images` JSON NOT NULL,
    `blocks` JSON NULL,

    INDEX `page_sections_page_id_sort_order_idx`(`page_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `section_subsections` (
    `id` VARCHAR(191) NOT NULL,
    `section_id` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NULL,
    `image` VARCHAR(191) NULL,

    INDEX `section_subsections_section_id_sort_order_idx`(`section_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `section_items` (
    `id` VARCHAR(191) NOT NULL,
    `section_id` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    INDEX `section_items_section_id_sort_order_idx`(`section_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subsection_items` (
    `id` VARCHAR(191) NOT NULL,
    `subsection_id` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    INDEX `subsection_items_subsection_id_sort_order_idx`(`subsection_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_packages` (
    `id` VARCHAR(191) NOT NULL,
    `page_id` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,

    INDEX `page_packages_page_id_sort_order_idx`(`page_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_gallery_images` (
    `id` VARCHAR(191) NOT NULL,
    `page_id` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'general',
    `media_asset_id` VARCHAR(191) NULL,

    INDEX `page_gallery_images_page_id_sort_order_idx`(`page_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_cards` (
    `id` VARCHAR(191) NOT NULL,
    `page_id` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `href` VARCHAR(191) NULL,

    INDEX `page_cards_page_id_sort_order_idx`(`page_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_people` (
    `id` VARCHAR(191) NOT NULL,
    `page_id` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `summary` TEXT NULL,
    `bio` TEXT NULL,
    `education` JSON NOT NULL,
    `experience` JSON NOT NULL,
    `expertise` JSON NOT NULL,

    INDEX `page_people_page_id_sort_order_idx`(`page_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_highlights` (
    `id` VARCHAR(191) NOT NULL,
    `page_id` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `image` VARCHAR(191) NULL,

    INDEX `page_highlights_page_id_sort_order_idx`(`page_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_documents` (
    `id` VARCHAR(191) NOT NULL,
    `page_id` VARCHAR(191) NOT NULL,
    `document` JSON NOT NULL,

    UNIQUE INDEX `course_documents_page_id_key`(`page_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_posts` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT '',
    `excerpt` TEXT NOT NULL,
    `image` VARCHAR(191) NOT NULL DEFAULT '',
    `published_at` DATETIME(3) NULL,
    `content` JSON NOT NULL,
    `body_html` TEXT NULL,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_posts_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `navigation_groups` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `navigation_groups_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `navigation_items` (
    `id` VARCHAR(191) NOT NULL,
    `group_id` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL,
    `item_type` ENUM('page', 'static') NOT NULL,
    `page_type` VARCHAR(191) NULL,
    `page_slug` VARCHAR(191) NULL,
    `href` VARCHAR(191) NULL,
    `label` VARCHAR(191) NULL,

    INDEX `navigation_items_group_id_sort_order_idx`(`group_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media_assets` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `cdn_key` VARCHAR(191) NOT NULL,
    `mime` VARCHAR(191) NOT NULL,
    `size_bytes` INTEGER NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `alt` VARCHAR(191) NULL,
    `caption` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `tags` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `media_assets_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'editor') NOT NULL DEFAULT 'editor',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admin_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_revisions` (
    `id` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NULL,
    `snapshot` JSON NOT NULL,
    `admin_user_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `content_revisions_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `content_revisions_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `module_library_items` (
    `id` VARCHAR(191) NOT NULL,
    `module_key` VARCHAR(191) NOT NULL,
    `variant` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `module_library_items_module_key_variant_idx`(`module_key`, `variant`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_submissions` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('enquiry', 'contact') NOT NULL,
    `status` ENUM('new', 'read', 'replied', 'archived') NOT NULL DEFAULT 'new',
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NULL,
    `program` VARCHAR(191) NULL,
    `accommodation` VARCHAR(191) NULL,
    `start_date` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `source` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `read_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `lead_submissions_type_created_at_idx`(`type`, `created_at`),
    INDEX `lead_submissions_status_created_at_idx`(`status`, `created_at`),
    INDEX `lead_submissions_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('course', 'retreat') NOT NULL,
    `status` ENUM('pending_payment', 'confirmed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending_payment',
    `program_slug` VARCHAR(191) NOT NULL,
    `program_title` VARCHAR(191) NOT NULL,
    `room_type` VARCHAR(191) NOT NULL,
    `batch_date` VARCHAR(191) NOT NULL,
    `duration` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `reference_code` VARCHAR(191) NULL,
    `hear_about` VARCHAR(191) NULL,
    `payment_mode` ENUM('full', 'deposit_20') NOT NULL,
    `base_price_cents` INTEGER NOT NULL,
    `full_amount_cents` INTEGER NOT NULL,
    `pay_now_cents` INTEGER NOT NULL,
    `paypal_fee_cents` INTEGER NOT NULL,
    `total_pay_now_cents` INTEGER NOT NULL,
    `remaining_cents` INTEGER NOT NULL,
    `promo_code` VARCHAR(191) NULL,
    `discount_cents` INTEGER NOT NULL DEFAULT 0,
    `paypal_order_id` VARCHAR(191) NULL,
    `paypal_capture_id` VARCHAR(191) NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `confirmed_at` DATETIME(3) NULL,

    INDEX `bookings_type_status_created_at_idx`(`type`, `status`, `created_at`),
    INDEX `bookings_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `global_settings` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `global_settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pages` ADD CONSTRAINT `pages_content_type_id_fkey` FOREIGN KEY (`content_type_id`) REFERENCES `content_types`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `content_items` ADD CONSTRAINT `content_items_content_type_id_fkey` FOREIGN KEY (`content_type_id`) REFERENCES `content_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `content_references` ADD CONSTRAINT `content_references_from_id_fkey` FOREIGN KEY (`from_id`) REFERENCES `content_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `content_references` ADD CONSTRAINT `content_references_to_id_fkey` FOREIGN KEY (`to_id`) REFERENCES `content_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_sections` ADD CONSTRAINT `page_sections_page_id_fkey` FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `section_subsections` ADD CONSTRAINT `section_subsections_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `page_sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `section_items` ADD CONSTRAINT `section_items_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `page_sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subsection_items` ADD CONSTRAINT `subsection_items_subsection_id_fkey` FOREIGN KEY (`subsection_id`) REFERENCES `section_subsections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_packages` ADD CONSTRAINT `page_packages_page_id_fkey` FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_gallery_images` ADD CONSTRAINT `page_gallery_images_page_id_fkey` FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_gallery_images` ADD CONSTRAINT `page_gallery_images_media_asset_id_fkey` FOREIGN KEY (`media_asset_id`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_cards` ADD CONSTRAINT `page_cards_page_id_fkey` FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_people` ADD CONSTRAINT `page_people_page_id_fkey` FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_highlights` ADD CONSTRAINT `page_highlights_page_id_fkey` FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_documents` ADD CONSTRAINT `course_documents_page_id_fkey` FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `navigation_items` ADD CONSTRAINT `navigation_items_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `navigation_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `content_revisions` ADD CONSTRAINT `content_revisions_admin_user_id_fkey` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

