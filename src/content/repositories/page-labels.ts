import { unstable_cache } from "next/cache";
import type { PageType } from "@/content/types/page-ref";
import { db } from "@/lib/db";

/**
 * Loads a page title from Postgres for nav labels and enquiry presets.
 *
 * @param slug - Page slug
 */
async function loadPageTitle(slug: string): Promise<string | null> {
  const page = await db.page.findUnique({
    where: { slug },
    include: { courseDoc: true },
  });
  if (!page) return null;

  const title = page.title?.trim();
  if (title) return title;

  const document = page.courseDoc?.document;
  if (document && typeof document === "object" && "title" in document) {
    const courseTitle = (document as { title?: string }).title?.trim();
    if (courseTitle) return courseTitle;
  }

  return null;
}

/**
 * Resolves a human-readable label for a page reference from the database.
 *
 * @param _type - Page kind (reserved for future kind-specific labels)
 * @param slug - Page slug
 */
export async function getPageLabel(
  _type: PageType,
  slug: string,
): Promise<string> {
  const cached = unstable_cache(
    () => loadPageTitle(slug),
    [`page-label-${slug}`],
    { revalidate: 3600, tags: [`page:${slug}`] },
  );
  return (await cached()) ?? slug;
}

/**
 * Batch-resolves page labels for enquiry form presets and admin pickers.
 *
 * @param refs - Page type + slug pairs
 */
export async function getPageLabels(
  refs: Array<{ type: PageType; slug: string }>,
): Promise<Map<string, string>> {
  const entries = await Promise.all(
    refs.map(async (ref) => [ref.slug, await getPageLabel(ref.type, ref.slug)] as const),
  );
  return new Map(entries);
}
