"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BlogPostEditor } from "@/components/admin";
import type { BlogPostDocument } from "@/content/types";

/**
 * Blog post editor with metadata and rich-text body.
 */
export default function AdminBlogEditorPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug);

  const [doc, setDoc] = useState<BlogPostDocument | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/blog/${encodeURIComponent(slug)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load post");
        const body = (await response.json()) as { post: BlogPostDocument };
        setDoc(body.post);
      })
      .catch((err: Error) => setError(err.message));
  }, [slug]);

  async function onSave(next: BlogPostDocument) {
    const response = await fetch(
      `/api/admin/blog/${encodeURIComponent(slug)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      },
    );

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      throw new Error(body.error ?? "Save failed");
    }

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
