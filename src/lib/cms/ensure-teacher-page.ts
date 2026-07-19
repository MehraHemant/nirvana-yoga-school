import sitePagesJson from "@/content/data/site-pages/site-pages.json";
import {
  DEFAULT_TEACHERS_PRESENTATION,
  TEACHER_PAGE_SLUG,
} from "@/content/repositories/teachers";
import type { SitePageDocument } from "@/content/types";
import { upsertSitePageDocument } from "@/lib/cms/document-to-db";
import { db } from "@/lib/db";

/**
 * Ensures the published `teacher` faculty page exists in MySQL.
 * Seeds from `site-pages.json` when missing or when people rows are empty.
 *
 * @returns Whether a write was performed
 */
export async function ensureTeacherPage(): Promise<{
  created: boolean;
  peopleCount: number;
}> {
  const existing = await db.page.findUnique({
    where: { slug: TEACHER_PAGE_SLUG },
    include: { _count: { select: { people: true } } },
  });

  if (existing?.published && existing._count.people > 0) {
    return { created: false, peopleCount: existing._count.people };
  }

  const raw = (sitePagesJson as Record<string, SitePageDocument>)[
    TEACHER_PAGE_SLUG
  ];
  if (!raw) {
    throw new Error(
      `Missing "${TEACHER_PAGE_SLUG}" in site-pages.json — cannot seed faculty page.`,
    );
  }

  const doc: SitePageDocument = {
    ...raw,
    title: existing?.title || raw.title || "Faculty of Nirvana",
    presentation: {
      ...DEFAULT_TEACHERS_PRESENTATION,
      heroLead: raw.description,
      ...(typeof existing?.contentData === "object" &&
      existing.contentData &&
      !Array.isArray(existing.contentData)
        ? (existing.contentData as SitePageDocument["presentation"])
        : {}),
    },
  };

  await upsertSitePageDocument(doc);
  await db.page.update({
    where: { slug: TEACHER_PAGE_SLUG },
    data: { published: true },
  });

  const peopleCount = await db.pagePerson.count({
    where: { page: { slug: TEACHER_PAGE_SLUG } },
  });

  return { created: true, peopleCount };
}
