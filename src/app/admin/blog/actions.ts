"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession, requireAdmin } from "@/lib/cms/auth";
import { invalidateContentCache } from "@/lib/cms/cache";
import {
  createBlogPostDraft,
  deleteBlogPost,
} from "@/lib/cms/document-to-db";
import { allocateCopySlug } from "@/lib/cms/unique-slug";
import { db } from "@/lib/db";

/**
 * Creates a draft blog post and opens the editor.
 *
 * @param formData - Must include `title`; optional `slug`
 */
export async function createBlogPostAction(formData: FormData) {
  requireAdmin(await getServerSession());

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const slugInput = String(formData.get("slug") ?? "").trim();
  const post = await createBlogPostDraft({
    title,
    slug: slugInput || undefined,
  });

  redirect(`/admin/blog/${post.slug}`);
}

/**
 * Duplicates a blog post as an unpublished copy with a unique slug.
 *
 * @param formData - Must include `id`
 */
export async function duplicateBlogPostAction(formData: FormData) {
  requireAdmin(await getServerSession());

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) return;

  const slug = await allocateCopySlug(post.slug, async (candidate) => {
    const existing = await db.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return Boolean(existing);
  });

  await db.blogPost.create({
    data: {
      slug,
      title: `${post.title} (copy)`,
      category: post.category,
      excerpt: post.excerpt,
      image: post.image,
      publishedAt: null,
      content: post.content,
      bodyHtml: post.bodyHtml,
      published: false,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${slug}`);
  revalidatePath("/blog");
}

/**
 * Permanently deletes a blog post and returns to the list.
 *
 * @param formData - Must include `slug`
 */
export async function deleteBlogPostAction(formData: FormData) {
  requireAdmin(await getServerSession());

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return;

  const deleted = await deleteBlogPost(slug);
  if (!deleted) return;

  redirect("/admin/blog");
}

/**
 * Publishes or unpublishes a blog post from the admin list table.
 *
 * @param formData - Must include `id` and `published` (`true` | `false`)
 */
export async function toggleBlogPublishedAction(formData: FormData) {
  requireAdmin(await getServerSession());

  const id = String(formData.get("id") ?? "");
  const published = String(formData.get("published") ?? "") === "true";
  if (!id) return;

  const post = await db.blogPost.update({
    where: { id },
    data: { published },
  });

  invalidateContentCache(post.slug);
  revalidateTag("blog:all", "max");
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${post.slug}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
}
