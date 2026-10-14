/**
 * Page CMS document shape — ordered component blocks on a page.
 */

import type { ContentFieldDefinition } from "@/content/types/content-schema";

/**
 * One filled component section on a page (saved in pages.content_data).
 */
export type CmsContentBlock = {
  /** Stable id for editor list keys */
  id: string;
  /** ContentType.key */
  typeKey: string;
  /** Field values for that content type */
  data: Record<string, unknown>;
};

/**
 * Document stored in `pages.content_data`.
 */
export type PageCmsDocument = {
  blocks: CmsContentBlock[];
};

/**
 * Snapshot attached to SitePageDocument for the public renderer.
 */
export type SitePageCmsContent = {
  blocks: Array<{
    typeKey: string;
    typeName: string;
    fields: ContentFieldDefinition[];
    data: Record<string, unknown>;
  }>;
};

/**
 * Parses raw JSON from the DB into a PageCmsDocument.
 *
 * @param raw - pages.content_data value
 */
export function parsePageCmsDocument(raw: unknown): PageCmsDocument {
  if (!raw || typeof raw !== "object") return { blocks: [] };
  const doc = raw as Record<string, unknown>;

  if (Array.isArray(doc.blocks)) {
    const blocks: CmsContentBlock[] = [];
    for (const entry of doc.blocks) {
      if (!entry || typeof entry !== "object") continue;
      const row = entry as Record<string, unknown>;
      const typeKey = typeof row.typeKey === "string" ? row.typeKey : "";
      const id =
        typeof row.id === "string" && row.id
          ? row.id
          : `block_${blocks.length + 1}`;
      if (!typeKey) continue;
      const data =
        row.data && typeof row.data === "object"
          ? (row.data as Record<string, unknown>)
          : {};
      blocks.push({ id, typeKey, data });
    }
    return { blocks };
  }

  // Legacy flat field map (single content type) → no blocks
  return { blocks: [] };
}

/**
 * Creates a unique block id.
 */
export function createCmsBlockId(): string {
  return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
