import type { CmsPageKind } from "@/content/data/default-content-types";
import {
  DEFAULT_CONTENT_TYPES,
  LEGACY_TYPE_REMAP,
} from "@/content/data/default-content-types";
import type { ContentTypeInput } from "@/content/types/content-schema";
import type {
  CmsContentBlock,
  PageCmsDocument,
} from "@/content/types/page-cms";
import {
  createCmsBlockId,
  parsePageCmsDocument,
} from "@/content/types/page-cms";
import { invalidateContentCache } from "@/lib/cms/cache";
import {
  defaultsFromFields,
  isValidContentKey,
  normalizeItemData,
  parseContentFields,
} from "@/lib/cms/content-schema-utils";
import { prisma } from "@/lib/db";

export {
  defaultsFromFields,
  isValidContentKey,
  normalizeItemData,
  parseContentFields,
} from "@/lib/cms/content-schema-utils";

/**
 * Parses pageTypes JSON from a content type row.
 *
 * @param raw - DB JSON value
 */
export function parsePageTypes(raw: unknown): string[] {
  if (!Array.isArray(raw)) return ["site"];
  return raw.filter((v): v is string => typeof v === "string" && v.length > 0);
}

/**
 * Lists content types ordered for the admin picker.
 *
 * @param pageKind - Optional filter by page type (course, online, …).
 *   When set, excludes global components (empty pageTypes).
 */
export async function listContentTypes(pageKind?: string) {
  const rows = await prisma.contentType.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  if (!pageKind) return rows;
  return rows.filter((row) => {
    // User-created content types are global and available everywhere
    if (!row.isSystem) return true;
    const kinds = parsePageTypes(row.pageTypes);
    if (kinds.length === 0) return false;
    return kinds.includes(pageKind);
  });
}

/**
 * Fetches a content type by id.
 *
 * @param id - Content type id
 */
export async function getContentTypeById(id: string) {
  return prisma.contentType.findUnique({ where: { id } });
}

/**
 * Creates a content type from validated input.
 *
 * @param input - Key, name, fields, page types
 */
export async function createContentType(
  input: ContentTypeInput & {
    icon?: string;
    sortOrder?: number;
    pageTypes?: string[];
  },
) {
  const key = input.key.trim().toLowerCase();
  const name = input.name.trim();
  if (!isValidContentKey(key)) {
    return {
      error: "Key must be lowercase letters, numbers, _ or - (2–64 chars).",
    };
  }
  if (!name) return { error: "Name is required." };

  const existing = await prisma.contentType.findUnique({ where: { key } });
  if (existing) return { error: `Type key “${key}” already exists.` };

  const fields = parseContentFields(input.fields ?? []);
  const max = await prisma.contentType.aggregate({ _max: { sortOrder: true } });
  const pageTypes =
    input.pageTypes && input.pageTypes.length > 0 ? input.pageTypes : ["site"];

  const row = await prisma.contentType.create({
    data: {
      key,
      name,
      description: (input.description ?? "").trim(),
      fields,
      icon: input.icon?.trim() || "page",
      sortOrder: input.sortOrder ?? (max._max.sortOrder ?? 0) + 10,
      isSystem: false,
      pageTypes,
    },
  });
  return { data: row };
}

/**
 * Updates an existing content type (key is immutable).
 *
 * @param id - Content type id
 * @param input - Name, description, fields, pageTypes
 */
export async function updateContentType(
  id: string,
  input: Omit<ContentTypeInput, "key"> & {
    icon?: string;
    pageTypes?: string[];
  },
) {
  const existing = await prisma.contentType.findUnique({ where: { id } });
  if (!existing) return { error: "Content type not found." };

  const name = (input.name ?? existing.name).trim();
  if (!name) return { error: "Name is required." };

  const fields =
    input.fields !== undefined
      ? parseContentFields(input.fields)
      : parseContentFields(existing.fields);

  const row = await prisma.contentType.update({
    where: { id },
    data: {
      name,
      description: (input.description ?? existing.description).trim(),
      fields,
      icon: input.icon?.trim() || existing.icon,
      pageTypes:
        input.pageTypes !== undefined ? input.pageTypes : existing.pageTypes,
    },
  });
  return { data: row };
}

/**
 * Deletes a content type unless it is a protected system type.
 *
 * @param id - Content type id
 */
export async function deleteContentType(id: string) {
  const existing = await prisma.contentType.findUnique({ where: { id } });
  if (!existing) return { error: "Content type not found." };
  if (existing.isSystem) {
    return { error: "System content types cannot be deleted." };
  }
  await prisma.contentType.delete({ where: { id } });
  return { ok: true as const };
}

/**
 * Upserts all default system content types from the shared catalog.
 */
export async function syncDefaultContentTypes() {
  const keepKeys = new Set(DEFAULT_CONTENT_TYPES.map((t) => t.key));

  for (const starter of DEFAULT_CONTENT_TYPES) {
    await prisma.contentType.upsert({
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

  // Migrate existing page blocks from legacy per-kind keys to unified keys
  // before pruning the old types (field keys are preserved).
  await remapLegacyPageBlocks();

  // Remove obsolete system keys from earlier iterations
  const obsolete = await prisma.contentType.findMany({
    where: { isSystem: true },
  });
  for (const row of obsolete) {
    if (!keepKeys.has(row.key)) {
      await prisma.contentType.delete({ where: { id: row.id } });
    }
  }
}

/**
 * Rewrites page content_data block `typeKey`s from legacy per-kind keys to the
 * unified reusable keys. Safe rename — field data is untouched.
 */
async function remapLegacyPageBlocks() {
  const pages = await prisma.page.findMany({
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
    await prisma.page.update({
      where: { id: page.id },
      data: { contentData: { blocks } },
    });
  }
}

/**
 * Builds empty blocks for every component of a page kind.
 *
 * @param pageKind - course | online | retreat | venue | site
 */
export async function buildDefaultBlocksForKind(
  pageKind: CmsPageKind,
): Promise<CmsContentBlock[]> {
  const types = await listContentTypes(pageKind);
  return types.map((type) => {
    const fields = parseContentFields(type.fields);
    return {
      id: createCmsBlockId(),
      typeKey: type.key,
      data: defaultsFromFields(fields),
    };
  });
}

/**
 * Seeds all section components for a page kind into content_data.
 *
 * @param pageId - Page id
 * @param pageKind - Page type
 * @param pageSlug - For cache invalidation
 * @param replace - When true, replace existing blocks
 */
export async function seedPageBlocks(
  pageId: string,
  pageKind: CmsPageKind,
  pageSlug?: string,
  replace = false,
) {
  const page = await prisma.page.findUnique({ where: { id: pageId } });
  if (!page) return { error: "Page not found." };

  const existing = parsePageCmsDocument(page.contentData);
  if (!replace && existing.blocks.length > 0) {
    return { data: existing, skipped: true as const };
  }

  const blocks = await buildDefaultBlocksForKind(pageKind);
  const doc: PageCmsDocument = { blocks };

  await prisma.page.update({
    where: { id: pageId },
    data: {
      contentData: doc,
      contentTypeId: null,
    },
  });

  if (pageSlug || page.slug) invalidateContentCache(pageSlug || page.slug);
  return { data: doc, skipped: false as const };
}

/**
 * Saves the full blocks document for a page.
 *
 * @param pageId - Page id
 * @param document - Blocks payload
 * @param pageSlug - Optional cache slug
 */
export async function savePageCmsDocument(
  pageId: string,
  document: PageCmsDocument,
  pageSlug?: string,
) {
  const page = await prisma.page.findUnique({ where: { id: pageId } });
  if (!page) return { error: "Page not found." };

  const types = await prisma.contentType.findMany();
  const byKey = new Map(types.map((t) => [t.key, t]));

  const blocks: CmsContentBlock[] = [];
  for (const block of document.blocks) {
    const type = byKey.get(block.typeKey);
    if (!type) continue;
    const fields = parseContentFields(type.fields);
    blocks.push({
      id: block.id || createCmsBlockId(),
      typeKey: block.typeKey,
      data: normalizeItemData(fields, {
        ...defaultsFromFields(fields),
        ...block.data,
      }),
    });
  }

  const doc: PageCmsDocument = { blocks };
  await prisma.page.update({
    where: { id: pageId },
    data: { contentData: doc },
  });
  invalidateContentCache(pageSlug || page.slug);
  return { data: doc };
}

/** @deprecated kept for older assign flow — seeds blocks when assigning by type key */
export async function assignContentTypeToPage(
  pageId: string,
  contentTypeId: string | null,
  pageSlug?: string,
) {
  if (!contentTypeId) {
    const row = await prisma.page.update({
      where: { id: pageId },
      data: { contentTypeId: null },
    });
    if (pageSlug) invalidateContentCache(pageSlug);
    return { data: row };
  }

  const type = await prisma.contentType.findUnique({
    where: { id: contentTypeId },
  });
  if (!type) return { error: "Content type not found." };

  const page = await prisma.page.findUnique({ where: { id: pageId } });
  if (!page) return { error: "Page not found." };

  const fields = parseContentFields(type.fields);
  const doc = parsePageCmsDocument(page.contentData);
  doc.blocks.push({
    id: createCmsBlockId(),
    typeKey: type.key,
    data: defaultsFromFields(fields),
  });

  const row = await prisma.page.update({
    where: { id: pageId },
    data: {
      contentTypeId: null,
      contentData: doc,
    },
  });
  if (pageSlug || page.slug) invalidateContentCache(pageSlug || page.slug);
  return { data: row };
}

/**
 * @deprecated flat save — use savePageCmsDocument
 */
export async function savePageContentData(
  pageId: string,
  rawData: Record<string, unknown>,
  pageSlug?: string,
) {
  const page = await prisma.page.findUnique({ where: { id: pageId } });
  if (!page) return { error: "Page not found." };
  const doc = parsePageCmsDocument(page.contentData);
  if (doc.blocks.length === 0) {
    return { error: "Add page sections before saving." };
  }
  // Merge into first block for legacy callers
  doc.blocks[0] = {
    ...doc.blocks[0],
    data: { ...doc.blocks[0].data, ...rawData },
  };
  return savePageCmsDocument(pageId, doc, pageSlug);
}
