/** Fixed FAQ categories — exactly four, shared across admin and public UI. */

export const FAQ_CATEGORY_IDS = [
  "general",
  "certification",
  "lodging-meals",
  "travel-health",
] as const;

/** Stored category value on FAQ records. */
export type FaqCategoryId = (typeof FAQ_CATEGORY_IDS)[number];

export type FaqCategoryOption = {
  id: FaqCategoryId;
  label: string;
};

/** Human-readable labels for each fixed FAQ category. */
export const FAQ_CATEGORIES: FaqCategoryOption[] = [
  { id: "general", label: "General" },
  { id: "certification", label: "Certification" },
  { id: "lodging-meals", label: "Lodging & Meals" },
  { id: "travel-health", label: "Travel & Health" },
];

/** Default for legacy FAQ rows without a stored category. */
export const DEFAULT_FAQ_CATEGORY: FaqCategoryId = "general";

/** Admin filter dropdown — "All categories" plus the four fixed options. */
export const FAQ_CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "All categories" },
  ...FAQ_CATEGORIES.map((category) => ({
    value: category.id,
    label: category.label,
  })),
];

const FAQ_CATEGORY_SET = new Set<string>(FAQ_CATEGORY_IDS);

/** Human label → category id (for legacy rows stored with display labels). */
const FAQ_CATEGORY_LABEL_TO_ID: Record<string, FaqCategoryId> =
  Object.fromEntries(
    FAQ_CATEGORIES.map((category) => [
      category.label.toLowerCase(),
      category.id,
    ]),
  ) as Record<string, FaqCategoryId>;

/** Maps retired category ids to the closest current category. */
const LEGACY_FAQ_CATEGORY_MAP: Record<string, FaqCategoryId> = {
  "before-arrival": "travel-health",
  "during-stay": "lodging-meals",
  "practical-info": "general",
};

/**
 * Coerce stored FAQ category values to one of the four fixed categories.
 *
 * @param value - Raw category from CMS JSON
 */
export function normalizeFaqCategory(value: unknown): FaqCategoryId {
  if (typeof value !== "string") {
    return DEFAULT_FAQ_CATEGORY;
  }

  if (FAQ_CATEGORY_SET.has(value)) {
    return value as FaqCategoryId;
  }

  const byLabel = FAQ_CATEGORY_LABEL_TO_ID[value.toLowerCase()];
  if (byLabel) return byLabel;

  return LEGACY_FAQ_CATEGORY_MAP[value] ?? DEFAULT_FAQ_CATEGORY;
}

/** Lookup table for category labels. */
export const FAQ_CATEGORY_LABELS: Record<FaqCategoryId, string> =
  Object.fromEntries(
    FAQ_CATEGORIES.map((category) => [category.id, category.label]),
  ) as Record<FaqCategoryId, string>;
