import { resolvedItemToSiteDocument } from "@/content/mappers/content-item";
import type {
  ContentItemRecord,
  ResolvedContentItem,
} from "@/content/types/content-item";
import type { ContentFieldDefinition } from "@/content/types/content-schema";
import {
  defaultsFromFields,
  isValidContentKey,
  normalizeIdList,
  normalizeItemData,
  parseContentFields,
} from "@/lib/cms/content-schema-utils";
import { allocateCopySlug } from "@/lib/cms/unique-slug";
import { db } from "@/lib/db";

export { resolvedItemToSiteDocument };

const itemWithType = { contentType: true } as const;

/** Content item row with its content type relation loaded. */
type ItemRow = {
  id: string;
  slug: string | null;
  name: string;
  published: boolean;
  data: unknown;
  contentType: {
    key: string;
    name: string;
    fields: unknown;
  };
};

/** Edge row for `content_references` createMany. */
type ContentReferenceCreateInput = {
  fromId: string;
  toId: string;
  fieldKey: string;
  sortOrder: number;
};

/** Options controlling item resolution. */
export type ResolveOptions = {
  /** How many reference levels to expand (default 3). */
  depth?: number;
  /** Only include published items (default true). */
  publishedOnly?: boolean;
};

/** Maps a Neon row (with its content type) to a raw item record. */
function mapRow(row: ItemRow): ContentItemRecord {
  return {
    id: row.id,
    typeKey: row.contentType.key,
    typeName: row.contentType.name,
    fields: parseContentFields(row.contentType.fields),
    slug: row.slug,
    name: row.name,
    published: row.published,
    data:
      row.data && typeof row.data === "object" && !Array.isArray(row.data)
        ? (row.data as Record<string, unknown>)
        : {},
  };
}

/** Loads item rows for a set of ids (batched). */
async function loadRowsByIds(ids: string[]): Promise<ItemRow[]> {
  if (ids.length === 0) return [];
  return db.contentItem.findMany({
    where: { id: { in: ids } },
    include: itemWithType,
  });
}

/**
 * Collects the referenced item ids from a record's `reference` fields, keyed by
 * field key, in author order.
 *
 * @param fields - Content-type field schema
 * @param data - Item field values
 */
export function collectReferenceIds(
  fields: ContentFieldDefinition[],
  data: Record<string, unknown>,
): { fieldKey: string; ids: string[] }[] {
  return fields
    .filter((field) => field.type === "reference")
    .map((field) => ({
      fieldKey: field.key,
      ids: normalizeIdList(data[field.key]),
    }));
}

/**
 * Recursively expands a record's reference fields into nested resolved items.
 *
 * @param record - Raw item record
 * @param depth - Remaining expansion depth
 * @param publishedOnly - Skip unpublished referenced items
 * @param visited - Ancestor ids (cycle guard)
 */
async function resolveRecord(
  record: ContentItemRecord,
  depth: number,
  publishedOnly: boolean,
  visited: ReadonlySet<string>,
): Promise<ResolvedContentItem> {
  const data: Record<string, unknown> = { ...record.data };
  const refFields = collectReferenceIds(record.fields, record.data);

  if (depth > 0 && refFields.length > 0) {
    const allIds = new Set<string>();
    for (const { ids } of refFields) {
      for (const id of ids) allIds.add(id);
    }
    const byId = new Map(
      (await loadRowsByIds([...allIds])).map((row) => [row.id, mapRow(row)]),
    );
    const nextVisited = new Set(visited).add(record.id);

    for (const { fieldKey, ids } of refFields) {
      const children: ResolvedContentItem[] = [];
      for (const id of ids) {
        const child = byId.get(id);
        if (!child) continue;
        if (publishedOnly && !child.published) continue;
        if (nextVisited.has(id)) continue;
        children.push(
          await resolveRecord(child, depth - 1, publishedOnly, nextVisited),
        );
      }
      data[fieldKey] = children;
    }
  }

  return {
    id: record.id,
    type: record.typeKey,
    typeName: record.typeName,
    slug: record.slug,
    name: record.name,
    fields: record.fields,
    data,
  };
}

/**
 * Loads and resolves a routable item by slug.
 *
 * @param slug - Item slug
 * @param options - Resolve depth / published filter
 */
export async function getResolvedItemBySlug(
  slug: string,
  options: ResolveOptions = {},
): Promise<ResolvedContentItem | null> {
  const publishedOnly = options.publishedOnly ?? true;
  const row = await db.contentItem.findUnique({
    where: { slug },
    include: itemWithType,
  });
  if (!row) return null;
  if (publishedOnly && !row.published) return null;
  return resolveRecord(
    mapRow(row),
    options.depth ?? 3,
    publishedOnly,
    new Set(),
  );
}

/**
 * Loads and resolves an item by id.
 *
 * @param id - Item id
 * @param options - Resolve depth / published filter
 */
export async function getResolvedItemById(
  id: string,
  options: ResolveOptions = {},
): Promise<ResolvedContentItem | null> {
  const publishedOnly = options.publishedOnly ?? true;
  const row = await db.contentItem.findUnique({
    where: { id },
    include: itemWithType,
  });
  if (!row) return null;
  if (publishedOnly && !row.published) return null;
  return resolveRecord(
    mapRow(row),
    options.depth ?? 3,
    publishedOnly,
    new Set(),
  );
}

/** Options for listing items. */
export type ListItemsOptions = ResolveOptions & {
  /** Filter by content-type key */
  typeKey?: string;
  /** Max items (default 50) */
  limit?: number;
};

/**
 * Lists resolved items, optionally filtered by content-type key.
 *
 * @param options - Filter + resolve options
 */
export async function listResolvedItems(
  options: ListItemsOptions = {},
): Promise<ResolvedContentItem[]> {
  const publishedOnly = options.publishedOnly ?? true;
  const rows = await db.contentItem.findMany({
    where: {
      ...(options.typeKey ? { contentType: { key: options.typeKey } } : {}),
      ...(publishedOnly ? { published: true } : {}),
    },
    include: itemWithType,
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    take: Math.min(options.limit ?? 50, 200),
  });
  return Promise.all(
    rows.map((row) =>
      resolveRecord(mapRow(row), options.depth ?? 2, publishedOnly, new Set()),
    ),
  );
}

/**
 * Rebuilds the `content_references` edge rows for one item from its data.
 * Only references pointing at existing items are written.
 *
 * @param itemId - The `from` item id
 * @param fields - Item content-type field schema
 * @param data - Item field values
 */
export async function syncItemReferences(
  itemId: string,
  fields: ContentFieldDefinition[],
  data: Record<string, unknown>,
): Promise<void> {
  const refs = collectReferenceIds(fields, data);
  const targetIds = [...new Set(refs.flatMap((r) => r.ids))];

  const existing =
    targetIds.length > 0
      ? await db.contentItem.findMany({
          where: { id: { in: targetIds } },
          select: { id: true },
        })
      : [];
  const valid = new Set(existing.map((row) => row.id));

  const edges: ContentReferenceCreateInput[] = [];
  for (const { fieldKey, ids } of refs) {
    ids.forEach((toId, index) => {
      if (toId === itemId || !valid.has(toId)) return;
      edges.push({ fromId: itemId, toId, fieldKey, sortOrder: index });
    });
  }

  await db.$transaction([
    db.contentReference.deleteMany({ where: { fromId: itemId } }),
    ...(edges.length > 0
      ? [db.contentReference.createMany({ data: edges })]
      : []),
  ]);
}

// ---------------------------------------------------------------------------
// Admin management
// ---------------------------------------------------------------------------

/** Lightweight item summary for admin lists and reference pickers. */
export type AdminItemSummary = {
  id: string;
  name: string;
  slug: string | null;
  typeKey: string;
  typeName: string;
  published: boolean;
};

/** Result wrapper for admin mutations. */
export type ItemMutationResult = {
  data?: AdminItemSummary;
  error?: string;
};

/** True when a Neon error is a unique-constraint violation. */
function isUniqueError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    (error as { code?: string }).code === "P2002"
  );
}

/** Normalizes a slug candidate to lowercase kebab. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toSummary(row: {
  id: string;
  name: string;
  slug: string | null;
  published: boolean;
  contentType: { key: string; name: string };
}): AdminItemSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    typeKey: row.contentType.key,
    typeName: row.contentType.name,
    published: row.published,
  };
}

/**
 * Lists items for admin, optionally filtered by content-type key, ids, or a
 * name search. Returns lightweight summaries.
 *
 * @param options - Filters
 */
export async function listAdminItems(options: {
  typeKey?: string;
  ids?: string[];
  search?: string;
}): Promise<AdminItemSummary[]> {
  const rows = await db.contentItem.findMany({
    where: {
      ...(options.typeKey ? { contentType: { key: options.typeKey } } : {}),
      ...(options.ids ? { id: { in: options.ids } } : {}),
      ...(options.search ? { name: { contains: options.search } } : {}),
    },
    include: { contentType: { select: { key: true, name: true } } },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    take: 200,
  });
  return rows.map(toSummary);
}

/**
 * Creates a content item of a given type with default field values.
 *
 * @param input - Content-type key, admin name, optional slug
 */
export async function createContentItem(input: {
  typeKey: string;
  name: string;
  slug?: string;
}): Promise<ItemMutationResult> {
  const name = input.name.trim();
  if (!name) return { error: "Name is required." };

  const type = await db.contentType.findUnique({
    where: { key: input.typeKey },
  });
  if (!type) return { error: "Unknown content type." };

  let slug: string | null = null;
  if (input.slug?.trim()) {
    slug = slugify(input.slug);
    if (!isValidContentKey(slug)) return { error: "Invalid slug." };
  }

  const fields = parseContentFields(type.fields);
  const max = await db.contentItem.aggregate({
    where: { contentTypeId: type.id },
    _max: { sortOrder: true },
  });
  try {
    const item = await db.contentItem.create({
      data: {
        contentTypeId: type.id,
        name,
        slug,
        sortOrder: (max._max.sortOrder ?? 0) + 10,
        data: defaultsFromFields(fields) as object,
      },
      include: { contentType: { select: { key: true, name: true } } },
    });
    return { data: toSummary(item) };
  } catch (error) {
    if (isUniqueError(error)) return { error: "That slug is already in use." };
    throw error;
  }
}

/**
 * Updates an item's admin metadata (name and/or slug).
 *
 * @param id - Item id
 * @param meta - New name and slug (slug empty string clears it)
 */
export async function updateContentItemMeta(
  id: string,
  meta: { name?: string; slug?: string | null },
): Promise<ItemMutationResult> {
  const patch: { name?: string; slug?: string | null } = {};
  if (meta.name !== undefined) {
    const name = meta.name.trim();
    if (!name) return { error: "Name is required." };
    patch.name = name;
  }
  if (meta.slug !== undefined) {
    if (meta.slug === null || meta.slug.trim() === "") {
      patch.slug = null;
    } else {
      const slug = slugify(meta.slug);
      if (!isValidContentKey(slug)) return { error: "Invalid slug." };
      patch.slug = slug;
    }
  }
  try {
    const item = await db.contentItem.update({
      where: { id },
      data: patch,
      include: { contentType: { select: { key: true, name: true } } },
    });
    return { data: toSummary(item) };
  } catch (error) {
    if (isUniqueError(error)) return { error: "That slug is already in use." };
    throw error;
  }
}

/**
 * Normalizes and saves an item's field data, then rebuilds its reference edges.
 *
 * @param id - Item id
 * @param rawData - Raw field values from the editor
 */
export async function updateContentItemData(
  id: string,
  rawData: Record<string, unknown>,
): Promise<ItemMutationResult> {
  const row = await db.contentItem.findUnique({
    where: { id },
    include: { contentType: true },
  });
  if (!row) return { error: "Item not found." };

  const fields = parseContentFields(row.contentType.fields);
  const data = normalizeItemData(fields, rawData);
  await db.contentItem.update({
    where: { id },
    data: { data: data as object },
  });
  await syncItemReferences(id, fields, data);
  return { data: undefined };
}

/**
 * Publishes or unpublishes an item.
 *
 * @param id - Item id
 * @param published - Target published state
 */
export async function setContentItemPublished(
  id: string,
  published: boolean,
): Promise<void> {
  await db.contentItem.update({
    where: { id },
    data: { published, publishedAt: published ? new Date() : null },
  });
}

/**
 * Deletes an item unless it is still referenced by other items.
 *
 * @param id - Item id
 */
export async function deleteContentItem(
  id: string,
): Promise<{ ok?: true; error?: string }> {
  const referencedBy = await db.contentReference.count({
    where: { toId: id },
  });
  if (referencedBy > 0) {
    return {
      error: `This item is linked from ${referencedBy} place(s). Remove those links first.`,
    };
  }
  await db.contentItem.delete({ where: { id } });
  return { ok: true };
}

/**
 * Duplicates a content item (field data + references) as an unpublished copy.
 *
 * @param id - Source item id
 */
export async function duplicateContentItem(
  id: string,
): Promise<ItemMutationResult> {
  const row = await db.contentItem.findUnique({
    where: { id },
    include: { contentType: true },
  });
  if (!row) return { error: "Item not found." };

  let slug: string | null = null;
  if (row.slug) {
    slug = await allocateCopySlug(row.slug, async (candidate) => {
      const existing = await db.contentItem.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      return Boolean(existing);
    });
  }

  const data =
    row.data && typeof row.data === "object" && !Array.isArray(row.data)
      ? (row.data as Record<string, unknown>)
      : {};

  const max = await db.contentItem.aggregate({
    where: { contentTypeId: row.contentTypeId },
    _max: { sortOrder: true },
  });
  try {
    const item = await db.contentItem.create({
      data: {
        contentTypeId: row.contentTypeId,
        name: `${row.name} (copy)`,
        slug,
        published: false,
        publishedAt: null,
        sortOrder: (max._max.sortOrder ?? 0) + 10,
        data: data as object,
      },
      include: { contentType: { select: { key: true, name: true } } },
    });
    const fields = parseContentFields(row.contentType.fields);
    await syncItemReferences(item.id, fields, data);
    return { data: toSummary(item) };
  } catch (error) {
    if (isUniqueError(error)) return { error: "That slug is already in use." };
    throw error;
  }
}
