import type { FaqCategoryId } from "@/content/types/faq-categories";

/** Known admin-only FAQ tags used in CMS editors (never public). */
export const FAQ_ADMIN_TAG_IDS = [
  "course",
  "online-course",
  "retreat",
  "home",
  "ytt-hub",
  "venue",
] as const;

/** Stored admin tag value on FAQ catalog rows. */
export type FaqAdminTagId = (typeof FAQ_ADMIN_TAG_IDS)[number];

/** Admin catalog filter — all rows, untagged rows, or one known tag. */
export type FaqAdminTagFilter = "all" | "untagged" | FaqAdminTagId;

/** Query param / repository sentinel for FAQs with an empty admin tag. */
export const FAQ_ADMIN_TAG_UNTAGGED = "untagged" as const;

export type FaqAdminTagOption = {
  id: FaqAdminTagId;
  label: string;
};

/** Human-readable labels for each known admin tag. */
export const FAQ_ADMIN_TAGS: FaqAdminTagOption[] = [
  { id: "course", label: "Course" },
  { id: "online-course", label: "Online" },
  { id: "retreat", label: "Retreat" },
  { id: "home", label: "Home" },
  { id: "ytt-hub", label: "YTT hub" },
  { id: "venue", label: "Venue" },
];

/** Lookup table for admin tag labels. */
export const FAQ_ADMIN_TAG_LABELS: Record<FaqAdminTagId, string> =
  Object.fromEntries(
    FAQ_ADMIN_TAGS.map((tag) => [tag.id, tag.label]),
  ) as Record<FaqAdminTagId, string>;

/**
 * Returns true when a string is a known admin tag id.
 *
 * @param value - Raw admin tag value
 */
export function isFaqAdminTagId(value: string): value is FaqAdminTagId {
  return (FAQ_ADMIN_TAG_IDS as readonly string[]).includes(value);
}

/**
 * Resolves a display label for an admin tag (known ids or raw value).
 *
 * @param adminTag - Stored admin tag
 */
export function faqAdminTagLabel(adminTag: string): string {
  const trimmed = adminTag.trim();
  if (!trimmed) return "Untagged";
  return isFaqAdminTagId(trimmed)
    ? FAQ_ADMIN_TAG_LABELS[trimmed]
    : trimmed;
}

/** FAQ row in the shared `faqs` catalog table. */
export type FaqRecord = {
  id: string;
  question: string;
  answer: string;
  category: FaqCategoryId;
  /** Admin-only label for editors (never shown on the public site). */
  adminTag: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

/** One place a catalog FAQ is assigned in the CMS. */
export type FaqUsageReference = {
  label: string;
  href?: string;
};

/** Admin usage summary for a catalog FAQ. */
export type FaqUsageResult = {
  inUse: boolean;
  references: FaqUsageReference[];
};

/** FAQ catalog row returned by admin APIs with assignment usage. */
export type FaqRecordWithUsage = FaqRecord & {
  usage: FaqUsageResult;
};

/** Where an FAQ assignment applies — page slug or global settings key. */
export type FaqContextType = "page" | "global";

/** Known global FAQ context keys stored in `page_faq_assignments`. */
export type GlobalFaqContextKey = "homeFaqs" | "yttHub" | "venueFaqs";

/** Assignment linking a catalog FAQ to a page or global section. */
export type FaqAssignmentRecord = {
  id: string;
  contextType: FaqContextType;
  contextKey: string;
  faqId: string;
  sortOrder: number;
  /** Context-specific public extras (e.g. home FAQ image/tag). */
  extras?: FaqAssignmentExtras;
  createdAt?: string | Date;
};

/** Optional per-assignment fields that are not part of the catalog row. */
export type FaqAssignmentExtras = {
  image?: string;
  tag?: string;
};

/** FAQ resolved for a page/global context (catalog fields + assignment extras). */
export type ResolvedFaq = {
  id: string;
  question: string;
  answer: string;
  category: FaqCategoryId;
  assignmentId: string;
  sortOrder: number;
  extras?: FaqAssignmentExtras;
  /** Present only in admin API responses. */
  adminTag?: string;
};

export type UpsertFaqInput = {
  question: string;
  answer: string;
  category: FaqCategoryId;
  adminTag?: string;
};

export type SyncFaqAssignmentsInput = {
  contextType: FaqContextType;
  contextKey: string;
  /** Ordered FAQ ids; extras keyed by faq id when needed. */
  faqIds: string[];
  extrasByFaqId?: Record<string, FaqAssignmentExtras>;
};
