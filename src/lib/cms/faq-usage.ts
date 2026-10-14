import type {
  FaqContextType,
  FaqUsageReference,
  FaqUsageResult,
  GlobalFaqContextKey,
} from "@/content/types/faqs";
import { db } from "@/lib/db";

const YTT_HUB_SLUG = "yoga-teacher-training-in-rishikesh-india";

/** Admin labels and editor links for global FAQ assignment contexts. */
const GLOBAL_FAQ_CONTEXTS: Record<
  GlobalFaqContextKey,
  { label: string; href: string }
> = {
  homeFaqs: { label: "Homepage FAQs", href: "/admin/pages/home" },
  yttHub: { label: "YTT Hub", href: `/admin/pages/${YTT_HUB_SLUG}` },
  venueFaqs: { label: "Venue FAQs", href: "/admin/sections/shared" },
};

/** Human-readable page type prefixes for page-scoped FAQ assignments. */
const PAGE_TYPE_LABELS: Record<string, string> = {
  course: "Course",
  online: "Online course",
  retreat: "Retreat",
  venue: "Venue",
  site: "Page",
};

type PageRow = {
  slug: string;
  title: string | null;
  type: string | null;
};

/**
 * Initializes an empty usage map for a batch of catalog FAQ ids.
 *
 * @param faqIds - FAQ ids to track
 */
function emptyUsageMap(faqIds: string[]): Map<string, FaqUsageResult> {
  return new Map(
    faqIds.map((id) => [id, { inUse: false, references: [] }]),
  );
}

/**
 * Adds a deduplicated usage reference to one FAQ entry.
 *
 * @param map - Usage map keyed by FAQ id
 * @param faqId - Target FAQ id
 * @param reference - Human-readable assignment label (+ optional admin link)
 */
function addReference(
  map: Map<string, FaqUsageResult>,
  faqId: string,
  reference: FaqUsageReference,
): void {
  const current = map.get(faqId) ?? { inUse: false, references: [] };
  const exists = current.references.some(
    (ref) => ref.label === reference.label && ref.href === reference.href,
  );
  if (!exists) {
    current.references.push(reference);
  }
  current.inUse = true;
  map.set(faqId, current);
}

/**
 * Builds a page assignment label from slug and optional CMS page metadata.
 *
 * @param slug - Page slug
 * @param page - Matching page row, when found
 */
function pageContextReference(
  slug: string,
  page?: PageRow,
): FaqUsageReference {
  const type = String(page?.type ?? "site");
  const typeLabel = PAGE_TYPE_LABELS[type] ?? "Page";
  const title = String(page?.title ?? "").trim();
  const name = title || slug;
  return {
    label: `${typeLabel}: ${name}`,
    href: `/admin/pages/${slug}`,
  };
}

/**
 * Builds a global assignment label for known shared FAQ contexts.
 *
 * @param contextKey - Global settings key
 */
function globalContextReference(contextKey: string): FaqUsageReference {
  const known = GLOBAL_FAQ_CONTEXTS[contextKey as GlobalFaqContextKey];
  if (known) return known;
  return {
    label: `Global: ${contextKey}`,
    href: "/admin/sections/shared",
  };
}

/**
 * Resolves one assignment row into a usage reference.
 *
 * @param contextType - page | global
 * @param contextKey - Page slug or global settings key
 * @param pageBySlug - Loaded CMS pages keyed by slug
 */
function assignmentReference(
  contextType: FaqContextType,
  contextKey: string,
  pageBySlug: Map<string, PageRow>,
): FaqUsageReference {
  if (contextType === "global") {
    return globalContextReference(contextKey);
  }
  return pageContextReference(contextKey, pageBySlug.get(contextKey));
}

/**
 * Batch usage lookup for FAQ catalog admin views.
 *
 * @param faqIds - Catalog FAQ ids to resolve
 * @returns Map of FAQ id → usage summary
 */
export async function getFaqsUsage(
  faqIds: string[],
): Promise<Map<string, FaqUsageResult>> {
  if (faqIds.length === 0) return new Map();

  const map = emptyUsageMap(faqIds);
  const idSet = new Set(faqIds);

  const assignments = await db.pageFaqAssignment.findMany({
    where: { faqId: { in: faqIds } },
    select: { faqId: true, contextType: true, contextKey: true },
  });

  const pageSlugs = [
    ...new Set(
      assignments
        .filter((assignment) => assignment.contextType === "page")
        .map((assignment) => assignment.contextKey),
    ),
  ];

  const pages =
    pageSlugs.length > 0
      ? await db.page.findMany({
          where: { slug: { in: pageSlugs } },
          select: { slug: true, title: true, type: true },
        })
      : [];

  const pageBySlug = new Map(pages.map((page) => [page.slug, page]));

  for (const assignment of assignments) {
    if (!idSet.has(assignment.faqId)) continue;
    addReference(
      map,
      assignment.faqId,
      assignmentReference(
        assignment.contextType as FaqContextType,
        assignment.contextKey,
        pageBySlug,
      ),
    );
  }

  for (const result of map.values()) {
    result.references.sort((a, b) => a.label.localeCompare(b.label));
  }

  return map;
}

/**
 * Usage lookup for a single catalog FAQ.
 *
 * @param faqId - FAQ id
 */
export async function getFaqUsage(faqId: string): Promise<FaqUsageResult> {
  const usageMap = await getFaqsUsage([faqId]);
  return usageMap.get(faqId) ?? { inUse: false, references: [] };
}
