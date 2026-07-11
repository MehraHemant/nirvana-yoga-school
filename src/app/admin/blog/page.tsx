"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

/**
 * Admin blog posts list.
 */
export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/blog")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load posts");
        const body = (await response.json()) as { posts: BlogRow[] };
        setPosts(body.posts);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q),
    );
  }, [posts, query]);

  return (
    <div>
      <h1 className="admin-title">Blog</h1>
      <p className="admin-subtitle">Edit articles and news posts.</p>

      <div className="admin-toolbar">
        <input
          className="admin-input admin-search"
          type="search"
          placeholder="Search posts…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((post) => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>{post.category || "—"}</td>
                <td>{post.published ? "Published" : "Draft"}</td>
                <td>
                  <Link href={`/admin/blog/${post.slug}`}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="admin-hint admin-empty">No posts found.</p>
        ) : null}
      </div>
    </div>
  );
}
