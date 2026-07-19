"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

/**
 * Server action to delete a navigation item and revalidate navigation cache.
 *
 * @param formData - Must include `id`
 */
export async function deleteNavigationItemAction(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await db.navigationItem.delete({ where: { id } });
  revalidatePath("/admin/navigation");
  revalidatePath("/admin/components/navigation");
}

/**
 * Server action to create a navigation group and revalidate navigation cache.
 *
 * @param formData - Must include `key` and `label`
 */
export async function createNavigationGroupAction(formData: FormData) {
  const key = formData.get("key") as string;
  const label = formData.get("label") as string;
  if (!key || !label) return;
  await db.navigationGroup.create({
    data: { key, label },
  });
  revalidatePath("/admin/navigation");
  revalidatePath("/admin/components/navigation");
}

/**
 * Adds a page or static href item into an existing navigation group.
 *
 * @param formData - groupId, itemType, label, and page/href fields
 */
export async function createNavigationItemAction(formData: FormData) {
  const groupId = String(formData.get("groupId") ?? "");
  const itemType = String(formData.get("itemType") ?? "page");
  const label = String(formData.get("label") ?? "").trim();
  if (!groupId || !label) return;

  const max = await db.navigationItem.aggregate({
    where: { groupId },
    _max: { sortOrder: true },
  });
  const sortOrder = (max._max.sortOrder ?? 0) + 1;

  if (itemType === "static") {
    const href = String(formData.get("href") ?? "").trim();
    if (!href) return;
    await db.navigationItem.create({
      data: {
        groupId,
        sortOrder,
        itemType: "static",
        href,
        label,
      },
    });
  } else {
    const pageType = String(formData.get("pageType") ?? "").trim();
    const pageSlug = String(formData.get("pageSlug") ?? "").trim();
    if (!pageType || !pageSlug) return;
    await db.navigationItem.create({
      data: {
        groupId,
        sortOrder,
        itemType: "page",
        pageType,
        pageSlug,
        label,
      },
    });
  }

  revalidatePath("/admin/navigation");
  revalidatePath("/admin/components/navigation");
}

/**
 * Duplicates a navigation item inside the same group.
 *
 * @param formData - Must include `id`
 */
export async function duplicateNavigationItemAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const item = await db.navigationItem.findUnique({ where: { id } });
  if (!item) return;

  const max = await db.navigationItem.aggregate({
    where: { groupId: item.groupId },
    _max: { sortOrder: true },
  });

  await db.navigationItem.create({
    data: {
      groupId: item.groupId,
      sortOrder: (max._max.sortOrder ?? item.sortOrder) + 1,
      itemType: item.itemType,
      pageType: item.pageType,
      pageSlug: item.pageSlug,
      href: item.href,
      label: item.label ? `${item.label} (copy)` : "Copy",
    },
  });

  revalidatePath("/admin/navigation");
  revalidatePath("/admin/components/navigation");
}
