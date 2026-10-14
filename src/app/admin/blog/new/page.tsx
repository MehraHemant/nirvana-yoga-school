"use client";

import { useRouter } from "next/navigation";
import { BlogPostEditor } from "@/components/admin";
import type { BlogPostDocument } from "@/content/types";
import { createAdminBlogPost } from "@/lib/api/admin-client";

const EMPTY_BLOG_POST: BlogPostDocument = {
  slug: "",
  title: "",
  category: "",
  excerpt: "",
  image: "",
  publishedAt: null,
  published: false,
  content: [],
  bodyHtml: "",
};

/**
 * New blog post editor — full rich-text experience before first save.
 */
export default function AdminNewBlogPage() {
  const router = useRouter();

  async function onSave(doc: BlogPostDocument) {
    if (!doc.title.trim()) {
      throw new Error("Title is required");
    }

    const { post } = await createAdminBlogPost(doc);
    router.replace(`/admin/blog/${encodeURIComponent(post.slug)}`);
  }

  return (
    <BlogPostEditor
      initial={EMPTY_BLOG_POST}
      initialPublished={false}
      onSave={onSave}
      isNew
    />
  );
}
