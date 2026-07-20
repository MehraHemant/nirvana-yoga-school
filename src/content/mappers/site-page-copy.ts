import type {
  SitePageCard,
  SitePageDocument,
  SitePageSection,
} from "@/content/types";

/** Promo / contact noise lines to drop from list-style CMS bodies. */
const JUNK_LINE =
  /\||Discover the Path|Gurudev|youtube|WHATSAPP|nirvanayogaschool@gmail|\$\{price\}|25% OFF|Till 30th/i;

export type PagePresentation = {
  heroSubtitle: string;
  overviewEyebrow: string;
  overviewLead: string;
  overviewSupporting?: string;
  scheduleDescription: string;
  pricingDescription: string;
};

/**
 * Split a CMS body into clean paragraphs (junk lines removed).
 *
 * @param body - Raw section body
 * @param maxParagraphs - Max paragraphs to keep
 */
function cleanParagraphs(body?: string, maxParagraphs = 3): string[] {
  if (!body) return [];

  return body
    .split("\n\n")
    .map((part) => part.replace(/\n/g, " ").trim())
    .filter((part) => part.length > 0 && !JUNK_LINE.test(part))
    .slice(0, maxParagraphs);
}

/**
 * Normalize a list item from CMS (bullets / whitespace only).
 *
 * @param item - Raw list item
 */
function normalizeListItem(item: string): string {
  return item
    .replace(/^[-•*]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Hero subtitle from the page description (CMS / DB).
 *
 * @param page - Site page document
 */
export function refineHeroSubtitle(page: SitePageDocument): string {
  return (page.description ?? "").trim();
}

/**
 * Overview lead from the overview section body, else page description.
 *
 * @param page - Site page document
 * @param rawBody - Overview section body when known
 */
export function refineOverview(
  page: SitePageDocument,
  rawBody?: string,
): string {
  const fromBody = cleanParagraphs(rawBody, 4).join("\n\n");
  if (fromBody) return fromBody;
  return (page.description ?? "").trim();
}

/**
 * Supporting overview copy is managed in `page_modules.overview.supportingCopy`.
 * Legacy site-page mapping does not invent filler.
 *
 * @param _page - Unused; kept for call-site compatibility
 */
export function refineSupportingCopy(
  _page: SitePageDocument,
): string | undefined {
  return undefined;
}

/**
 * Deduplicate inclusion items from CMS lists / body lines.
 *
 * @param items - Explicit inclusion items
 * @param body - Fallback body when items are empty
 */
export function refineInclusions(items: string[], body?: string): string[] {
  const parsed =
    items.length > 0
      ? items
      : (body ?? "").split("\n\n").map(normalizeListItem).filter(Boolean);

  const seen = new Set<string>();
  const refined: string[] = [];

  for (const raw of parsed) {
    const item = normalizeListItem(raw);
    if (!item || JUNK_LINE.test(item)) continue;

    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    refined.push(item);
  }

  return refined;
}

/**
 * Pass schedule activities through with light cleanup only.
 *
 * @param schedule - Time / activity rows
 */
export function refineScheduleActivities(
  schedule: { time: string; activity: string }[],
): { time: string; activity: string }[] {
  return schedule.map((item) => ({
    time: item.time.trim(),
    activity: item.activity.trim(),
  }));
}

/**
 * Filter junk FAQ rows; keep CMS questions and answers as authored.
 *
 * @param faqs - FAQ pairs from CMS
 */
export function refineFaqs(
  faqs: { question: string; answer: string }[],
): { question: string; answer: string }[] {
  return faqs.filter(
    (faq) =>
      faq.question.trim() &&
      faq.answer.trim() &&
      !JUNK_LINE.test(faq.question) &&
      !JUNK_LINE.test(faq.answer),
  );
}

/**
 * Highlight blurb from CMS description (no improvised rewrites).
 *
 * @param _title - Highlight title (unused; kept for call-site compatibility)
 * @param description - Highlight description from CMS
 */
export function refineHighlight(_title: string, description: string): string {
  return description.trim();
}

/**
 * Pass meta items through unchanged.
 *
 * @param items - Label / value pairs
 */
export function refineMetaItems(
  items: { label: string; value: string }[],
): { label: string; value: string }[] {
  return items.map((item) => ({
    label: item.label.trim(),
    value: item.value.trim(),
  }));
}

/**
 * Pass program cards through unchanged.
 *
 * @param cards - Program / hub cards
 */
export function refinePrograms(cards: SitePageCard[]): SitePageCard[] {
  return cards;
}

/**
 * Light cleanup of an editorial section (junk lines only).
 *
 * @param section - Site page section
 */
export function refineEditorialSection(
  section: SitePageSection,
): SitePageSection {
  return {
    ...section,
    title: section.title.trim(),
    body: cleanParagraphs(section.body, 8).join("\n\n") || undefined,
    items: section.items
      ?.map(normalizeListItem)
      .filter((item) => item && !JUNK_LINE.test(item)),
    subsections: section.subsections
      ?.filter((sub) => sub.title.trim() && !JUNK_LINE.test(sub.title))
      .map((sub) => ({
        ...sub,
        body: sub.body?.trim() || undefined,
        items: sub.items?.map(normalizeListItem).filter(Boolean),
      })),
  };
}

/**
 * Presentation fields derived only from CMS page / section columns.
 * Prefer `page_modules` on the public site when present.
 *
 * @param page - Site page document
 */
export function getPagePresentation(page: SitePageDocument): PagePresentation {
  const overviewSection =
    page.sections.find((s) => /^overview|about|introduction/i.test(s.title)) ??
    page.sections[0];
  const scheduleSection = page.sections.find((s) =>
    /schedule|itinerary|day-wise/i.test(s.title),
  );
  const pricingSection = page.sections.find((s) =>
    /packages|pricing|dates & fees/i.test(s.title),
  );

  return {
    heroSubtitle: refineHeroSubtitle(page),
    overviewEyebrow: (page.eyebrow ?? "").trim(),
    overviewLead: refineOverview(page, overviewSection?.body),
    overviewSupporting: refineSupportingCopy(page),
    scheduleDescription: (
      scheduleSection?.body?.split("\n\n")[0] ?? ""
    ).trim(),
    pricingDescription: (pricingSection?.body?.split("\n\n")[0] ?? "").trim(),
  };
}

/**
 * Teacher bio from CMS (no truncation rewriting).
 *
 * @param bio - Raw bio
 */
export function refineTeacherBio(bio: string): string {
  return bio.trim();
}

/**
 * Teacher summary from CMS (no truncation rewriting).
 *
 * @param summary - Raw summary
 */
export function refineTeacherSummary(summary: string): string {
  return summary.trim();
}
