"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BlogPostEditor } from "@/components/admin";
import type { BlogPostDocument } from "@/content/types";
import { fetchAdminBlogPost, saveAdminBlogPost } from "@/lib/api/admin-client";

/**
 * Blog post editor with metadata and rich-text body.
 */
export default function AdminBlogEditorPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug);

  const [doc, setDoc] = useState<BlogPostDocument | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminBlogPost(slug)
      .then((body) => setDoc(body.post))
      .catch((err: Error) => setError(err.message));
  }, [slug]);

  async function onSave(next: BlogPostDocument) {
    await saveAdminBlogPost(slug, next);
    setDoc(next);
  }

  if (error) {
    return <p className="admin-error">{error}</p>;
  }

  if (!doc) {
    return <p className="admin-hint">Loading post…</p>;
  }

  return <BlogPostEditor initial={doc} onSave={onSave} />;
}
