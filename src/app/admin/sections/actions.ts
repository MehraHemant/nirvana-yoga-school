"use server";

import { revalidatePath } from "next/cache";
import { getServerSession, requireAdmin } from "@/lib/cms/auth";
import { invalidateAndRevalidatePage } from "@/lib/cms/cache";
import {
  PROTECTED_PAGE_SLUGS,
  publicViewHref,
} from "@/lib/cms/page-layout-registry";
import { allocateCopySlug } from "@/lib/cms/unique-slug";
import { db } from "@/lib/db";

/**
 * Duplicates a CMS page (modules + course document) as an unpublished copy.
 *
 * @param formData - Must include `id`
 */
export async function duplicatePageAction(formData: FormData) {
  requireAdmin(await getServerSession());

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const page = await db.page.findUnique({
    where: { id },
    include: { courseDoc: true },
  });
  if (!page) return;

  const slug = await allocateCopySlug(page.slug, async (candidate) => {
    const existing = await db.page.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return Boolean(existing);
  });

  await db.page.create({
    data: {
      slug,
      type: page.type,
      eyebrow: page.eyebrow,
      title: `${page.title} (copy)`,
      description: page.description,
      image: page.image,
      ctaLabel: page.ctaLabel,
      ctaHref: page.ctaHref,
      published: false,
      contentData: page.contentData,
      pageModules: page.pageModules ?? undefined,
      courseDoc: page.courseDoc
        ? {
            create: {
              document: page.courseDoc.document,
            },
          }
        : undefined,
    },
  });

  revalidatePath("/admin/sections/online");
  revalidatePath("/admin/sections/courses");
  revalidatePath("/admin/sections/retreats");
  revalidatePath("/admin/sections/venues");
  revalidatePath("/admin/sections/teachers");
  revalidatePath("/admin/sections/home");
  revalidatePath("/admin/sections/other");
  revalidatePath(`/admin/pages/${slug}`);
}

export type DeletePageResult = { ok: true } | { ok: false; error: string };

/**
 * Permanently deletes a CMS page. Child rows (sections, dates, room offers,
 * SEO, course document) cascade in the database. Bookings keep their own
 * program slug, so history is unaffected. Refuses core singleton pages and
 * pages still linked from the site navigation.
 *
 * @param formData - Must include `id`
 */
export async function deletePageAction(
  formData: FormData,
): Promise<DeletePageResult> {
  requireAdmin(await getServerSession());

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing page id." };

  const page = await db.page.findUnique({
    where: { id },
    select: { id: true, slug: true, type: true },
  });
  if (!page) return { ok: false, error: "Page not found." };

  if (PROTECTED_PAGE_SLUGS.has(page.slug)) {
    return {
      ok: false,
      error:
        "This is a core site page and can't be deleted. Unpublish it instead.",
    };
  }

  const navLinks = await db.navigationItem.findMany({
    where: {
      OR: [
        { pageSlug: page.slug },
        { href: publicViewHref(page.type, page.slug) },
      ],
    },
    select: { label: true },
  });
  if (navLinks.length > 0) {
    const labels = navLinks.map((item: { label: string }) => `"${item.label}"`);
    return {
      ok: false,
      error: `This page is linked in the site navigation (${labels.join(", ")}). Remove it from Navigation first.`,
    };
  }

  await db.page.delete({ where: { id: page.id } });

  invalidateAndRevalidatePage(page.slug, page.type);
  revalidatePath("/admin/sections", "layout");
  revalidatePath("/admin/pages");
  return { ok: true };
}
