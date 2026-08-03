import { ONLINE_COURSE_SLUGS } from "@/content/pages/slugs";
import { requireDb } from "@/content/repositories/db-fallback";
import type { CourseDocument } from "@/content/types/course";
import type { ResolvedYttHubCourse } from "@/content/types/shared-sections";
import { db } from "@/lib/db";
import { liveImage } from "@/lib/live-site";
import { mapCourseDocumentToYttHubCard } from "./ytt-hub-courses";

const FALLBACK_IMAGE = liveImage("/img/home/banner_3.webp");
const FALLBACK_CERT_BADGE = liveImage("/img/rys200.png");

const NAV_ORDER = new Map<string, number>(
  ONLINE_COURSE_SLUGS.map((slug, index) => [slug, index]),
);

/**
 * Sort key: nav dropdown order first, then remaining published slugs A–Z.
 *
 * @param slug - Online course page slug
 */
function onlineHubSortKey(slug: string): number {
  return NAV_ORDER.get(slug) ?? 1_000 + slug.charCodeAt(0);
}

/**
 * Loads every published online course as hub cards (title, fee, duration, CTA).
 *
 * @returns Resolved cards for the online courses hub grid
 */
export async function resolveOnlineHubCourses(): Promise<
  ResolvedYttHubCourse[]
> {
  const result = await requireDb(async () => {
    const pages = await db.page.findMany({
      where: { type: "online", published: true },
      include: { courseDoc: true },
    });

    const cards: ResolvedYttHubCourse[] = [];
    for (const page of pages) {
      const document = page.courseDoc?.document;
      if (!document || typeof document !== "object") continue;
      const record = document as CourseDocument;
      if (typeof record.title !== "string" || !record.title.trim()) continue;

      const mapped = mapCourseDocumentToYttHubCard(
        {
          ...record,
          slug: typeof record.slug === "string" ? record.slug : page.slug,
          image: record.image?.trim() || FALLBACK_IMAGE,
          certBadge: record.certBadge?.trim() || FALLBACK_CERT_BADGE,
          level: record.level?.trim() || "All levels",
          duration: record.duration?.trim() || "Self-Paced",
          fee: record.fee?.trim() || "Enquire",
        },
        "online",
      );
      cards.push(mapped);
    }

    cards.sort(
      (a, b) =>
        onlineHubSortKey(a.courseSlug ?? a.href) -
        onlineHubSortKey(b.courseSlug ?? b.href),
    );
    return cards;
  });

  return result.data;
}
