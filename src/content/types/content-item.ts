/**
 * Headless content item shapes (CH ONE style).
 *
 * A content item is one instance of a ContentType. Routable items (pages) have
 * a slug; component items are linked from a page through reference fields.
 */

import type { ContentFieldDefinition } from "@/content/types/content-schema";

/**
 * A stored content item as read from the database, before reference expansion.
 */
export type ContentItemRecord = {
  id: string;
  /** ContentType.key */
  typeKey: string;
  /** ContentType.name */
  typeName: string;
  /** Content type field schema */
  fields: ContentFieldDefinition[];
  /** Unique slug for routable items; null for components */
  slug: string | null;
  /** Admin-facing label */
  name: string;
  published: boolean;
  /** Raw field values (reference fields hold arrays of item ids) */
  data: Record<string, unknown>;
};

/**
 * A content item resolved for delivery — `reference` fields in `data` are
 * replaced by arrays of nested {@link ResolvedContentItem} (up to a depth).
 */
export type ResolvedContentItem = {
  id: string;
  /** ContentType.key */
  type: string;
  /** ContentType.name */
  typeName: string;
  slug: string | null;
  name: string;
  /** Content type field schema (so the renderer knows widget types) */
  fields: ContentFieldDefinition[];
  /** Field values; reference keys hold ResolvedContentItem[] */
  data: Record<string, unknown>;
};

/**
 * Delivery response for a list of items.
 */
export type ContentItemListResult = {
  items: ResolvedContentItem[];
  nextCursor: string | null;
};
