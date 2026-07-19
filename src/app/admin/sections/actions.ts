"use server";

import { revalidatePath } from "next/cache";
import { getServerSession, requireAdmin } from "@/lib/cms/auth";
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
      contentTypeId: page.contentTypeId,
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
