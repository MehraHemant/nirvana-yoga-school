import {
  DEFAULT_FAQ_CATEGORY,
  FAQ_CATEGORIES,
  FAQ_CATEGORY_LABELS,
  normalizeFaqCategory,
  type FaqCategoryId,
} from "@/content/types/faq-categories";
import type { FaqAdminTagFilter } from "@/content/types/faqs";
import type { FaqUsageResult } from "@/content/types/faqs";

export type FaqWithCategory = {
  question: string;
  answer: string;
  category?: FaqCategoryId | string;
};

export type FaqCategoryGroup<T extends FaqWithCategory> = {
  id: FaqCategoryId;
  label: string;
  items: T[];
};

/**
 * Resolve a FAQ item's category, defaulting legacy rows to General.
 *
 * @param faq - FAQ row from CMS
 */
export function resolveFaqCategory(faq: FaqWithCategory): FaqCategoryId {
  return normalizeFaqCategory(faq.category);
}

/**
 * Group FAQ items under the four fixed categories (empty groups omitted).
 *
 * @param faqs - FAQ list from CMS
 */
export function groupFaqsByCategory<T extends FaqWithCategory>(
  faqs: T[],
): FaqCategoryGroup<T>[] {
  const buckets = new Map<FaqCategoryId, T[]>(
    FAQ_CATEGORIES.map((category) => [category.id, []]),
  );

  for (const faq of faqs) {
    const category = resolveFaqCategory(faq);
    buckets.get(category)?.push(faq);
  }

  return FAQ_CATEGORIES.map((category) => ({
    id: category.id,
    label: FAQ_CATEGORY_LABELS[category.id],
    items: buckets.get(category.id) ?? [],
  })).filter((group) => group.items.length > 0);
}

/**
 * Categories that contain at least one FAQ item.
 *
 * @param faqs - FAQ list from CMS
 */
export function getActiveFaqCategories<T extends FaqWithCategory>(
  faqs: T[],
): FaqCategoryId[] {
  return groupFaqsByCategory(faqs).map((group) => group.id);
}

/** Normalizes FAQ question text for duplicate detection. */
export function normalizeFaqQuestion(question: string): string {
  return question.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Collapsed-card title from FAQ question text. */
export function faqQuestionPreview(
  question: string,
  fallback = "New question",
): string {
  const trimmed = question.trim();
  return trimmed || fallback;
}

/** Collapsed-card subtitle from FAQ answer text. */
export function faqAnswerPreview(
  answer: string,
  fallback = "No answer yet",
  maxLen = 72,
): string {
  const text = answer.replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}…`;
}

/** Blank FAQ row for admin "Add FAQ" actions. */
export function createBlankFaq<
  T extends { question: string; answer: string; category?: FaqCategoryId },
>(partial?: Partial<T>): T {
  return {
    question: "",
    answer: "",
    category: DEFAULT_FAQ_CATEGORY,
    ...partial,
  } as T;
}

type FaqWithAdminTag = {
  adminTag?: string;
};

/**
 * Counts FAQ rows per admin tag filter (for admin chip badges).
 *
 * @param faqs - FAQ list
 */
export function countFaqsByAdminTag(
  faqs: FaqWithAdminTag[],
): Record<FaqAdminTagFilter, number> {
  const counts = {
    all: faqs.length,
    untagged: 0,
    course: 0,
    "online-course": 0,
    retreat: 0,
    home: 0,
    "ytt-hub": 0,
    venue: 0,
  } satisfies Record<FaqAdminTagFilter, number>;

  for (const faq of faqs) {
    const tag = faq.adminTag?.trim() ?? "";
    if (!tag) {
      counts.untagged++;
      continue;
    }
    if (tag in counts) {
      counts[tag as Exclude<FaqAdminTagFilter, "all" | "untagged">]++;
    }
  }

  return counts;
}

/**
 * Whether a FAQ row matches the selected admin tag filter.
 *
 * @param faq - FAQ row
 * @param filter - Active admin tag filter
 */
export function matchesFaqAdminTagFilter(
  faq: FaqWithAdminTag,
  filter: FaqAdminTagFilter,
): boolean {
  if (filter === "all") return true;
  const tag = faq.adminTag?.trim() ?? "";
  if (filter === "untagged") return tag === "";
  return tag === filter;
}

type FaqSearchable = {
  question: string;
  answer: string;
};

/**
 * Case-insensitive match against FAQ question and answer text.
 *
 * @param faq - FAQ row
 * @param query - Raw search string
 */
export function matchesFaqSearch(faq: FaqSearchable, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const haystack = `${faq.question} ${faq.answer}`.toLowerCase();
  return haystack.includes(normalized);
}

/**
 * Compact usage summary for FAQ catalog cards and picker rows.
 *
 * @param usage - Assignment usage from admin API
 */
export function formatFaqUsageSummary(usage: FaqUsageResult): string {
  if (!usage.inUse) return "Not assigned";
  if (usage.references.length === 1) {
    return `Used on: ${usage.references[0].label}`;
  }
  return `In use on ${usage.references.length} pages`;
}

/**
 * Full comma-separated usage detail for expanded FAQ cards.
 *
 * @param usage - Assignment usage from admin API
 */
export function formatFaqUsageDetail(usage: FaqUsageResult): string {
  if (!usage.inUse) return "Not assigned";
  return usage.references.map((reference) => reference.label).join(", ");
}
