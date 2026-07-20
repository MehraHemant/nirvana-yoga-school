import {
  DEFAULT_CONTENT_TYPES,
  LEGACY_TYPE_REMAP,
} from "@/lib/cms/default-content-types";
import { parsePageCmsDocument } from "@/content/types/page-cms";
import type { DbClient } from "@/lib/db/client";

/**
 * Upserts default CMS content types and removes obsolete system types.
 *
 * @param db - Database client supplied by an app or Node CLI entry point
 */
export async function syncDefaultContentTypes(db: DbClient) {
  const keepKeys = new Set(DEFAULT_CONTENT_TYPES.map((t) => t.key));

  for (const starter of DEFAULT_CONTENT_TYPES) {
    await db.contentType.upsert({
      where: { key: starter.key },
      create: {
        key: starter.key,
        name: starter.name,
        description: starter.description,
        icon: starter.icon,
        sortOrder: starter.sortOrder,
        isSystem: true,
        pageTypes: starter.pageTypes,
        fields: starter.fields,
      },
      update: {
        name: starter.name,
        description: starter.description,
        icon: starter.icon,
        sortOrder: starter.sortOrder,
        isSystem: true,
        pageTypes: starter.pageTypes,
        fields: starter.fields,
      },
    });
  }

  await remapLegacyPageBlocks(db);

  const obsolete = await db.contentType.findMany({
    where: { isSystem: true },
  });
  for (const row of obsolete) {
    if (!keepKeys.has(row.key)) {
      await db.contentType.delete({ where: { id: row.id } });
    }
  }
}

/**
 * Rewrites legacy content block type keys without changing block data.
 *
 * @param db - Database client supplied by an app or Node CLI entry point
 */
async function remapLegacyPageBlocks(db: DbClient) {
  const pages = await db.page.findMany({
    select: { id: true, contentData: true },
  });
  for (const page of pages) {
    const doc = parsePageCmsDocument(page.contentData);
    if (doc.blocks.length === 0) continue;
    let changed = false;
    const blocks = doc.blocks.map((block) => {
      const mapped = LEGACY_TYPE_REMAP[block.typeKey];
      if (mapped && mapped !== block.typeKey) {
        changed = true;
        return { ...block, typeKey: mapped };
      }
      return block;
    });
    if (!changed) continue;
    await db.page.update({
      where: { id: page.id },
      data: { contentData: { blocks } },
    });
  }
}
