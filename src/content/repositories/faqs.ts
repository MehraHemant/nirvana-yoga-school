import {
  DEFAULT_FAQ_CATEGORY,
  normalizeFaqCategory,
  type FaqCategoryId,
} from "@/content/types/faq-categories";
import type {
  FaqAssignmentExtras,
  FaqAssignmentRecord,
  FaqContextType,
  FaqRecord,
  ResolvedFaq,
  SyncFaqAssignmentsInput,
  UpsertFaqInput,
} from "@/content/types/faqs";
import { FAQ_ADMIN_TAG_UNTAGGED } from "@/content/types/faqs";
import type { FAQ } from "@/content/types/shared";
import type { SharedFaq } from "@/content/types/shared-sections";
import { normalizeFaqQuestion } from "@/lib/cms/faq-utils";
import { invalidateGlobalSettingsCache } from "@/lib/cms/cache";
import { createId, db } from "@/lib/db";
import { queryOne } from "@/lib/db/sql";
import type { PageModulesDocument } from "@/content/types";
import { requireDb } from "./db-fallback";
import type { ContentResult, RepositoryOptions } from "./fetch";

const FAQ_CACHE_PREFIX = "faq-assignments";

/**
 * Busts cached FAQ assignment reads after admin writes.
 *
 * @param contextType - page | global
 * @param contextKey - Slug or global settings key
 */
export function invalidateFaqAssignmentsCache(
  contextType: FaqContextType,
  contextKey: string,
): void {
  invalidateGlobalSettingsCache(`${FAQ_CACHE_PREFIX}:${contextType}:${contextKey}`);
}

/**
 * Maps a raw DB FAQ row into a typed record.
 *
 * @param row - Neon faqs row
 */
function mapFaqRow(row: Record<string, unknown>): FaqRecord {
  return {
    id: String(row.id ?? ""),
    question: String(row.question ?? ""),
    answer: String(row.answer ?? ""),
    category: normalizeFaqCategory(row.category),
    adminTag: String(row.adminTag ?? row.admin_tag ?? ""),
    createdAt: row.createdAt as string | Date | undefined,
    updatedAt: row.updatedAt as string | Date | undefined,
  };
}

/**
 * Maps a raw assignment row into a typed record.
 *
 * @param row - Neon page_faq_assignments row
 */
function mapAssignmentRow(row: Record<string, unknown>): FaqAssignmentRecord {
  const extras =
    row.extras && typeof row.extras === "object"
      ? (row.extras as FaqAssignmentExtras)
      : undefined;
  return {
    id: String(row.id ?? ""),
    contextType: row.contextType === "global" ? "global" : "page",
    contextKey: String(row.contextKey ?? row.context_key ?? ""),
    faqId: String(row.faqId ?? row.faq_id ?? ""),
    sortOrder:
      typeof row.sortOrder === "number"
        ? row.sortOrder
        : Number(row.sortOrder ?? row.sort_order ?? 0),
    extras,
    createdAt: row.createdAt as string | Date | undefined,
  };
}

/**
 * Finds a catalog FAQ by normalized question text.
 *
 * @param question - Raw question text
 */
async function findFaqByNormalizedQuestion(
  question: string,
): Promise<FaqRecord | null> {
  const normalized = normalizeFaqQuestion(question);
  if (!normalized) return null;

  const row = await queryOne<Record<string, unknown>>(
    `SELECT "id", "question", "answer", "category", "admin_tag", "created_at", "updated_at"
     FROM "faqs"
     WHERE lower(trim(regexp_replace("question", '\\s+', ' ', 'g'))) = $1
     LIMIT 1`,
    [normalized],
  );
  return row ? mapFaqRow(row) : null;
}

/**
 * Converts resolved FAQs into the shared FAQ module shape.
 *
 * @param faqs - Resolved catalog rows
 */
export function resolvedFaqsToModuleItems(faqs: ResolvedFaq[]): FAQ[] {
  return faqs.map((faq) => ({
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
  }));
}

/**
 * Converts resolved FAQs into homepage/shared FAQ cards.
 *
 * @param faqs - Resolved catalog rows
 */
export function resolvedFaqsToSharedFaqs(faqs: ResolvedFaq[]): SharedFaq[] {
  return faqs.map((faq) => ({
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    sort: faq.sortOrder,
    image: faq.extras?.image,
    tag: faq.extras?.tag,
  }));
}

/**
 * Lists all FAQs in the catalog, optionally filtered by category or admin tag.
 *
 * @param filters - Optional category/adminTag filters
 */
export async function getFaqCatalog(filters?: {
  category?: FaqCategoryId | "all";
  adminTag?: string;
}): Promise<FaqRecord[]> {
  const where: Record<string, unknown> = {};
  if (filters?.category && filters.category !== "all") {
    where.category = filters.category;
  }
  if (filters?.adminTag === FAQ_ADMIN_TAG_UNTAGGED) {
    where.adminTag = "";
  } else if (filters?.adminTag?.trim()) {
    where.adminTag = filters.adminTag.trim();
  }

  const rows = await db.faq.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }, { question: "asc" }],
  });
  return (rows as Record<string, unknown>[]).map(mapFaqRow);
}

/**
 * Loads one FAQ by id.
 *
 * @param id - FAQ id
 */
export async function getFaqById(id: string): Promise<FaqRecord | null> {
  const row = await db.faq.findUnique({ where: { id } });
  return row ? mapFaqRow(row as Record<string, unknown>) : null;
}

/**
 * Creates a FAQ in the shared catalog.
 *
 * @param input - FAQ fields
 */
export async function createFaq(input: UpsertFaqInput): Promise<FaqRecord> {
  const question = input.question.trim();
  const existing = await findFaqByNormalizedQuestion(question);
  if (existing) {
    throw new Error("A FAQ with this question already exists.");
  }

  const row = await db.faq.create({
    data: {
      id: createId(),
      question,
      answer: input.answer.trim(),
      category: normalizeFaqCategory(input.category),
      adminTag: input.adminTag?.trim() ?? "",
    },
  });
  return mapFaqRow(row as Record<string, unknown>);
}

/**
 * Updates an existing FAQ in the catalog.
 *
 * @param id - FAQ id
 * @param input - Partial FAQ fields
 */
export async function updateFaq(
  id: string,
  input: Partial<UpsertFaqInput>,
): Promise<FaqRecord> {
  const data: Record<string, unknown> = {};
  if (input.question !== undefined) {
    const question = input.question.trim();
    const existing = await findFaqByNormalizedQuestion(question);
    if (existing && existing.id !== id) {
      throw new Error("A FAQ with this question already exists.");
    }
    data.question = question;
  }
  if (input.answer !== undefined) data.answer = input.answer.trim();
  if (input.category !== undefined) {
    data.category = normalizeFaqCategory(input.category);
  }
  if (input.adminTag !== undefined) data.adminTag = input.adminTag.trim();

  const row = await db.faq.update({ where: { id }, data });
  return mapFaqRow(row as Record<string, unknown>);
}

/**
 * Deletes a FAQ from the catalog (assignments cascade).
 *
 * @param id - FAQ id
 */
export async function deleteFaq(id: string): Promise<void> {
  await db.faq.delete({ where: { id } });
}

/**
 * Loads assignment rows for a page or global context.
 *
 * @param contextType - page | global
 * @param contextKey - Slug or global settings key
 */
export async function getFaqAssignments(
  contextType: FaqContextType,
  contextKey: string,
): Promise<FaqAssignmentRecord[]> {
  const rows = await db.pageFaqAssignment.findMany({
    where: { contextType, contextKey },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return (rows as Record<string, unknown>[]).map(mapAssignmentRow);
}

/**
 * Resolves assigned FAQs with catalog fields for a context.
 *
 * @param contextType - page | global
 * @param contextKey - Slug or global settings key
 * @param includeAdminTag - When true, include adminTag on each row (admin only)
 */
export async function getAssignedFaqs(
  contextType: FaqContextType,
  contextKey: string,
  includeAdminTag = false,
): Promise<ResolvedFaq[]> {
  const assignments = await getFaqAssignments(contextType, contextKey);
  if (assignments.length === 0) return [];

  const faqIds = assignments.map((assignment) => assignment.faqId);
  const rows = await db.faq.findMany({
    where: { id: { in: faqIds } },
  });
  const byId = new Map(
    (rows as Record<string, unknown>[]).map((row) => [
      String(row.id ?? ""),
      mapFaqRow(row),
    ]),
  );

  const resolved: ResolvedFaq[] = [];
  for (const assignment of assignments) {
    const faq = byId.get(assignment.faqId);
    if (!faq) continue;
    resolved.push({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      assignmentId: assignment.id,
      sortOrder: assignment.sortOrder,
      extras: assignment.extras,
      adminTag: includeAdminTag ? faq.adminTag : undefined,
    });
  }
  return resolved;
}

/**
 * Replaces all FAQ assignments for a context with an ordered id list.
 *
 * @param input - Context and ordered FAQ ids
 */
export async function syncFaqAssignments(
  input: SyncFaqAssignmentsInput,
): Promise<ResolvedFaq[]> {
  const { contextType, contextKey, faqIds, extrasByFaqId } = input;
  const uniqueIds = [...new Set(faqIds.map((id) => id.trim()).filter(Boolean))];

  await db.$transaction(async () => {
    await db.pageFaqAssignment.deleteMany({
      where: { contextType, contextKey },
    });

    for (const [index, faqId] of uniqueIds.entries()) {
      await db.pageFaqAssignment.create({
        data: {
          id: createId(),
          contextType,
          contextKey,
          faqId,
          sortOrder: index * 10,
          extras: extrasByFaqId?.[faqId] ?? {},
        },
      });
    }
  });

  invalidateFaqAssignmentsCache(contextType, contextKey);
  return getAssignedFaqs(contextType, contextKey, true);
}

/**
 * Resolves page FAQs from DB, falling back to legacy JSON items.
 *
 * @param slug - Page slug
 * @param fallback - Legacy FAQ items from page modules or product JSON
 * @param options - Repository options
 */
export async function resolvePageFaqs(
  slug: string,
  fallback: FAQ[] = [],
  options?: RepositoryOptions,
): Promise<ContentResult<FAQ[]>> {
  return requireDb(async () => {
    const assigned = await getAssignedFaqs("page", slug);
    if (assigned.length > 0) {
      return resolvedFaqsToModuleItems(assigned);
    }
    return fallback.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
      category: normalizeFaqCategory(faq.category),
    }));
  }, options);
}

/**
 * Resolves global FAQs from DB, falling back to legacy shared FAQ rows.
 *
 * @param contextKey - Global settings key (homeFaqs, yttHub, venueFaqs)
 * @param fallback - Legacy FAQ list
 * @param options - Repository options
 */
export async function resolveGlobalFaqs(
  contextKey: string,
  fallback: SharedFaq[] = [],
  options?: RepositoryOptions,
): Promise<ContentResult<SharedFaq[]>> {
  return requireDb(async () => {
    const assigned = await getAssignedFaqs("global", contextKey);
    if (assigned.length > 0) {
      return resolvedFaqsToSharedFaqs(assigned);
    }
    return fallback.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
      category: normalizeFaqCategory(faq.category ?? DEFAULT_FAQ_CATEGORY),
      sort: faq.sort,
      image: faq.image,
      tag: faq.tag,
    }));
  }, options);
}

/**
 * Creates a blank FAQ row for admin forms.
 *
 * @param adminTag - Default admin-only tag
 */
export function createBlankFaqRecord(adminTag = ""): UpsertFaqInput {
  return {
    question: "",
    answer: "",
    category: DEFAULT_FAQ_CATEGORY,
    adminTag,
  };
}

/**
 * Replaces module FAQ items with DB assignments when present.
 *
 * @param slug - Page slug
 * @param modules - Page modules document
 */
export async function hydratePageModulesFaqs(
  slug: string,
  modules: PageModulesDocument | null,
): Promise<PageModulesDocument | null> {
  if (!modules) return modules;
  const result = await resolvePageFaqs(slug, modules.faqs?.items ?? []);
  return {
    ...modules,
    faqs: {
      ...modules.faqs,
      items: result.data,
    },
  };
}
