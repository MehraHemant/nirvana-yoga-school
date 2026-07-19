"use server";

import { revalidatePath } from "next/cache";
import { invalidateContentCache } from "@/lib/cms/cache";
import { isDbEnabled, db } from "@/lib/db";

/** Slugs that already have dedicated file routes or reserved meaning. */
const RESERVED_SLUGS = new Set([
  "",
  "admin",
  "api",
  "contact",
  "teacher",
  "booking",
  "retreat-booking",
  "enquire-now",
  "blog",
  "gallery",
]);

/** Turns free text into a URL-safe slug. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function revalidatePage(pageSlug: string, pageType?: string) {
  revalidatePath(`/admin/pages/${pageSlug}`);
  revalidatePath("/admin/pages");
  if (pageType === "course") revalidatePath(`/course/${pageSlug}`);
  else if (pageType === "online") revalidatePath(`/online-course/${pageSlug}`);
  else if (pageType === "retreat") revalidatePath(`/retreat/${pageSlug}`);
  else revalidatePath(`/${pageSlug}`);
}

/**
 * Creates a new live site page from the admin.
 *
 * @param formData - Must include `title`; optional `slug` and `description`
 * @returns `{ slug }` on success or `{ error }` on failure
 */
export async function createPageAction(
  formData: FormData,
): Promise<{ slug?: string; error?: string }> {
  if (!isDbEnabled()) {
    return { error: "Database is not connected." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const slug = slugify(rawSlug || title);
  if (!slug) return { error: "Enter a valid slug." };
  if (RESERVED_SLUGS.has(slug)) {
    return { error: `“/${slug}” is reserved — choose another slug.` };
  }

  const existing = await db.page.findUnique({ where: { slug } });
  if (existing) return { error: `A page at “/${slug}” already exists.` };

  await db.page.create({
    data: {
      slug,
      type: "site",
      title,
      description,
      published: true,
    },
  });

  revalidatePath("/admin/pages");
  revalidatePath(`/${slug}`);
  return { slug };
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
