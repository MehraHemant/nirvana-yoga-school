import { isDbEnabled, prisma } from "@/lib/db";
import type { AdminBlogRow, AdminPageRow } from "@/lib/types/db";

export type { AdminBlogRow, AdminPageRow } from "@/lib/types/db";

/**
 * Load CMS pages for the admin pages list.
 *
 * @returns Page rows ordered by most recently updated
 */
export async function listAdminPages(): Promise<AdminPageRow[]> {
  if (!isDbEnabled()) return [];

  return prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      type: true,
      title: true,
      published: true,
      updatedAt: true,
    },
  });
}

/**
 * Load residential and online courses for the admin courses list.
 *
 * @returns Course rows ordered by most recently updated
 */
export async function listAdminCourses(): Promise<AdminPageRow[]> {
  if (!isDbEnabled()) return [];

  return prisma.page.findMany({
    where: { type: { in: ["course", "online"] } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      type: true,
      title: true,
      published: true,
      updatedAt: true,
    },
  });
}

/**
 * Load blog posts for the admin blog list.
 *
 * @returns Blog rows ordered by most recently updated
 */
export async function listAdminBlogPosts(): Promise<AdminBlogRow[]> {
  if (!isDbEnabled()) return [];

  return prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      published: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Resolve the admin editor URL for a CMS page row.
 *
 * @param page - Page list row
 * @returns Editor path under `/admin`
 */
export function adminPageEditHref(page: AdminPageRow): string {
  if (page.type === "course" || page.type === "online") {
    return `/admin/courses/${page.slug}`;
  }
  return `/admin/pages/${page.slug}`;
}
