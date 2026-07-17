import "server-only";

import { isDbEnabled, prisma } from "@/lib/db";

export type SectionPageRow = {
  id: string;
  slug: string;
  type: string;
  title: string;
  image: string;
  published: boolean;
  fee?: string;
  duration?: string;
};

/**
 * List pages by type for the admin section table using scalar columns only
 * (no `page_modules` JSON load).
 *
 * @param type - Page type to filter (course, online, retreat, venue, site)
 * @param excludeSlugs - Slugs to exclude from the list
 * @returns Array of section page rows
 */
export async function listSectionPages(
  type: string,
  excludeSlugs?: string[],
): Promise<SectionPageRow[]> {
  if (!isDbEnabled()) return [];

  const pages = await prisma.page.findMany({
    where: {
      type: type as never,
      ...(excludeSlugs?.length
        ? { slug: { notIn: excludeSlugs } }
        : undefined),
    },
    orderBy: { title: "asc" },
    select: {
      id: true,
      slug: true,
      type: true,
      title: true,
      image: true,
      published: true,
      fee: true,
      duration: true,
    },
  });

  return pages.map((page) => ({
    id: page.id,
    slug: page.slug,
    type: page.type,
    title: page.title,
    image: page.image,
    published: page.published,
    fee: page.fee || undefined,
    duration: page.duration || undefined,
  }));
}
