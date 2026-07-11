import type {
  CreateModuleLibraryItemInput,
  ModuleLibraryItemRecord,
  ModuleLibraryKey,
  ModuleLibraryPayload,
  UpdateModuleLibraryItemInput,
} from "@/content/types/module-library";
import type { HeroType } from "@/content/types/page-modules";
import { prisma } from "@/lib/db";

const MODULE_KEYS: ModuleLibraryKey[] = [
  "hero",
  "stickyNav",
  "overview",
  "inclusions",
  "eligibility",
  "syllabus",
  "schedule",
  "pricing",
  "faqs",
];

/**
 * Deep-clone a library payload for copy-on-insert.
 *
 * @param payload - Module JSON to clone
 * @returns Independent copy of the payload
 */
export function clonePayload<T>(payload: T): T {
  return structuredClone(payload);
}

/**
 * Check whether a string is a supported module library key.
 *
 * @param value - Raw module key from query or body
 * @returns True when value is a known module key
 */
export function isModuleLibraryKey(value: string): value is ModuleLibraryKey {
  return MODULE_KEYS.includes(value as ModuleLibraryKey);
}

/**
 * Validate payload shape matches module key and optional variant.
 *
 * @param moduleKey - Library module type
 * @param variant - Hero layout type when moduleKey is hero
 * @param payload - JSON payload to validate
 * @throws Error when payload does not match expected shape
 */
export function assertPayloadMatchesKey(
  moduleKey: ModuleLibraryKey,
  variant: string | null | undefined,
  payload: unknown,
): void {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload must be an object");
  }

  const data = payload as Record<string, unknown>;

  switch (moduleKey) {
    case "hero": {
      if (!variant) throw new Error("Hero items require a variant");
      if (data.type !== variant) {
        throw new Error(`Hero payload type must match variant "${variant}"`);
      }
      if (typeof data.title !== "string") {
        throw new Error("Hero payload requires a title");
      }
      break;
    }
    case "stickyNav": {
      if (!Array.isArray(data.items)) {
        throw new Error("Sticky nav payload requires items array");
      }
      break;
    }
    case "overview": {
      if (typeof data.title !== "string" || typeof data.lead !== "string") {
        throw new Error("Overview payload requires title and lead");
      }
      break;
    }
    case "inclusions": {
      if (!Array.isArray(data.items)) {
        throw new Error("Inclusions payload requires items array");
      }
      break;
    }
    case "eligibility": {
      if (!Array.isArray(data.requirements)) {
        throw new Error("Eligibility payload requires requirements array");
      }
      break;
    }
    case "syllabus": {
      if (!Array.isArray(data.chapters)) {
        throw new Error("Syllabus payload requires chapters array");
      }
      break;
    }
    case "schedule": {
      if (!Array.isArray(data.items)) {
        throw new Error("Schedule payload requires items array");
      }
      break;
    }
    case "pricing": {
      if (!Array.isArray(data.options)) {
        throw new Error("Pricing payload requires options array");
      }
      break;
    }
    case "faqs": {
      if (!Array.isArray(data.items)) {
        throw new Error("FAQ payload requires items array");
      }
      break;
    }
    default:
      throw new Error("Unsupported module key");
  }
}

/**
 * Resolve variant for a module key from payload when not explicitly provided.
 *
 * @param moduleKey - Library module type
 * @param payload - Module JSON
 * @returns Variant string for hero, null otherwise
 */
export function resolveVariantFromPayload(
  moduleKey: ModuleLibraryKey,
  payload: ModuleLibraryPayload,
): string | null {
  if (
    moduleKey === "hero" &&
    payload &&
    typeof payload === "object" &&
    "type" in payload
  ) {
    return (payload as { type: HeroType }).type;
  }
  return null;
}

/**
 * Map Prisma row to API record.
 *
 * @param row - Database row
 * @returns Serialized library item
 */
function mapRow(row: {
  id: string;
  moduleKey: string;
  variant: string | null;
  name: string;
  payload: unknown;
  createdAt: Date;
  updatedAt: Date;
}): ModuleLibraryItemRecord {
  return {
    id: row.id,
    moduleKey: row.moduleKey as ModuleLibraryKey,
    variant: row.variant,
    name: row.name,
    payload: row.payload as ModuleLibraryPayload,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * List library items filtered by module key and optional variant.
 *
 * @param params - Filter options
 * @returns Matching library items newest first
 */
export async function listModuleLibraryItems(params: {
  moduleKey: ModuleLibraryKey;
  variant?: string;
}): Promise<ModuleLibraryItemRecord[]> {
  const rows = await prisma.moduleLibraryItem.findMany({
    where: {
      moduleKey: params.moduleKey,
      ...(params.variant ? { variant: params.variant } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapRow);
}

/**
 * Fetch a single library item by id.
 *
 * @param id - Library item id
 * @returns Item or null when missing
 */
export async function getModuleLibraryItem(
  id: string,
): Promise<ModuleLibraryItemRecord | null> {
  const row = await prisma.moduleLibraryItem.findUnique({ where: { id } });
  return row ? mapRow(row) : null;
}

/**
 * Create a new library item.
 *
 * @param input - Create payload
 * @returns Created record
 */
export async function createModuleLibraryItem(
  input: CreateModuleLibraryItemInput,
): Promise<ModuleLibraryItemRecord> {
  const variant =
    input.variant ?? resolveVariantFromPayload(input.moduleKey, input.payload);
  assertPayloadMatchesKey(input.moduleKey, variant, input.payload);

  const row = await prisma.moduleLibraryItem.create({
    data: {
      moduleKey: input.moduleKey,
      variant,
      name: input.name.trim(),
      payload: input.payload as object,
    },
  });
  return mapRow(row);
}

/**
 * Update an existing library item.
 *
 * @param id - Library item id
 * @param patch - Fields to update
 * @returns Updated record
 */
export async function updateModuleLibraryItem(
  id: string,
  patch: UpdateModuleLibraryItemInput,
): Promise<ModuleLibraryItemRecord> {
  const existing = await prisma.moduleLibraryItem.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Library item not found");
  }

  const payload = patch.payload ?? (existing.payload as ModuleLibraryPayload);
  if (patch.payload) {
    assertPayloadMatchesKey(
      existing.moduleKey as ModuleLibraryKey,
      existing.variant,
      payload,
    );
  }

  const row = await prisma.moduleLibraryItem.update({
    where: { id },
    data: {
      ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
      ...(patch.payload !== undefined
        ? { payload: patch.payload as object }
        : {}),
    },
  });
  return mapRow(row);
}

/**
 * Delete a library item.
 *
 * @param id - Library item id
 */
export async function deleteModuleLibraryItem(id: string): Promise<void> {
  await prisma.moduleLibraryItem.delete({ where: { id } });
}

/**
 * Build a short preview string for library list cards.
 *
 * @param item - Library item
 * @returns One-line preview text
 */
export function getModuleLibraryPreview(item: ModuleLibraryItemRecord): string {
  const payload = item.payload as Record<string, unknown>;

  switch (item.moduleKey) {
    case "hero":
      return typeof payload.title === "string" ? payload.title : item.name;
    case "stickyNav": {
      const items = payload.items as unknown[] | undefined;
      return `${items?.length ?? 0} navigation links`;
    }
    case "overview":
      return typeof payload.title === "string" ? payload.title : item.name;
    case "inclusions": {
      const items = payload.items as unknown[] | undefined;
      return `${items?.length ?? 0} inclusions`;
    }
    case "eligibility": {
      const reqs = payload.requirements as unknown[] | undefined;
      return `${reqs?.length ?? 0} requirements`;
    }
    case "syllabus": {
      const chapters = payload.chapters as unknown[] | undefined;
      return `${chapters?.length ?? 0} chapters`;
    }
    case "schedule": {
      const rows = payload.items as unknown[] | undefined;
      return `${rows?.length ?? 0} schedule rows`;
    }
    case "pricing": {
      const options = payload.options as unknown[] | undefined;
      return `${options?.length ?? 0} pricing options`;
    }
    case "faqs": {
      const faqs = payload.items as unknown[] | undefined;
      return `${faqs?.length ?? 0} questions`;
    }
    default:
      return item.name;
  }
}
