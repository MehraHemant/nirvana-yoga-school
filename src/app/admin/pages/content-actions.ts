"use server";

import { revalidatePath } from "next/cache";
import { invalidateContentCache } from "@/lib/cms/cache";
import { db } from "@/lib/db";

/**
 * Revalidates admin and public paths for a page after publish changes.
 *
 * @param pageSlug - Page slug
 * @param pageType - Optional page type for product routes
 */
function revalidatePage(pageSlug: string, pageType?: string) {
  revalidatePath(`/admin/pages/${pageSlug}`);
  revalidatePath("/admin/pages");
  if (pageType === "course") revalidatePath(`/course/${pageSlug}`);
  else if (pageType === "online") revalidatePath(`/online-course/${pageSlug}`);
  else if (pageType === "retreat") revalidatePath(`/retreat/${pageSlug}`);
  else revalidatePath(`/${pageSlug}`);
}

/**
 * Publishes or unpublishes a page from the admin list table.
 *
 * @param formData - Must include `id` and `published` (`true` | `false`)
 */
export async function setPagePublishedAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const published = String(formData.get("published") ?? "") === "true";
  if (!id) return;

  const page = await db.page.update({
    where: { id },
    data: { published },
  });

  invalidateContentCache(page.slug);
  revalidatePage(page.slug, page.type);
}
