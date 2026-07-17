"use server";

import { revalidatePath } from "next/cache";
import { getServerSession, requireAdmin } from "@/lib/cms/auth";
import { allocateCopySlug } from "@/lib/cms/unique-slug";
import { prisma } from "@/lib/db";

/**
 * Duplicates a blog post as an unpublished copy with a unique slug.
 *
 * @param formData - Must include `id`
 */
export async function duplicateBlogPostAction(formData: FormData) {
  requireAdmin(await getServerSession());

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return;

  const slug = await allocateCopySlug(post.slug, async (candidate) => {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return Boolean(existing);
  });

  await prisma.blogPost.create({
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
