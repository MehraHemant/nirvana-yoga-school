-- Denormalized listing fields (avoid loading page_modules JSON in admin lists)
ALTER TABLE `pages`
  ADD COLUMN `fee` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `duration` VARCHAR(191) NOT NULL DEFAULT '';

-- Longer SEO copy / CDN URLs
ALTER TABLE `pages` MODIFY `description` TEXT NOT NULL;
ALTER TABLE `pages` MODIFY `image` VARCHAR(500) NOT NULL DEFAULT '';

-- Admin list / lookup indexes
CREATE INDEX `pages_type_title_idx` ON `pages`(`type`, `title`);
CREATE INDEX `pages_updated_at_idx` ON `pages`(`updated_at`);

CREATE INDEX `content_items_updated_at_idx` ON `content_items`(`updated_at`);

CREATE INDEX `blog_posts_published_published_at_idx` ON `blog_posts`(`published`, `published_at`);
CREATE INDEX `blog_posts_updated_at_idx` ON `blog_posts`(`updated_at`);

CREATE INDEX `navigation_items_page_slug_idx` ON `navigation_items`(`page_slug`);

CREATE INDEX `media_assets_cdn_key_idx` ON `media_assets`(`cdn_key`);

CREATE INDEX `bookings_program_slug_idx` ON `bookings`(`program_slug`);

-- Backfill fee/duration from page_modules hero when present (MySQL JSON)
UPDATE `pages`
SET
  `fee` = COALESCE(
    NULLIF(JSON_UNQUOTE(JSON_EXTRACT(`page_modules`, '$.hero.fee')), 'null'),
    ''
  ),
  `duration` = COALESCE(
    NULLIF(JSON_UNQUOTE(JSON_EXTRACT(`page_modules`, '$.hero.duration')), 'null'),
    ''
  )
WHERE `page_modules` IS NOT NULL;
