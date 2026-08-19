"use server";

import { revalidatePath } from "next/cache";
import { invalidateAndRevalidatePage } from "@/lib/cms/cache";
import { db } from "@/lib/db";

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

  invalidateAndRevalidatePage(page.slug, page.type);
  revalidatePath(`/admin/pages/${page.slug}`);
  revalidatePath("/admin/pages");
}
