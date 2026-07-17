-- Add sort_order to content_items for stable list ordering.
ALTER TABLE `content_items`
  ADD COLUMN `sort_order` INT NOT NULL DEFAULT 0;

-- Backfill by created_at within each content type (0, 10, 20…).
UPDATE `content_items` AS ci
INNER JOIN (
  SELECT
    `id`,
    (ROW_NUMBER() OVER (
      PARTITION BY `content_type_id`
      ORDER BY `created_at` ASC, `id` ASC
    ) - 1) * 10 AS `next_sort`
  FROM `content_items`
) AS ranked ON ranked.`id` = ci.`id`
SET ci.`sort_order` = ranked.`next_sort`;

CREATE INDEX `content_items_content_type_id_sort_order_idx`
  ON `content_items`(`content_type_id`, `sort_order`);
