"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PageRow = {
  id: string;
  slug: string;
  type: string;
  title: string;
  published: boolean;
  updatedAt: string;
};

function editHref(page: PageRow): string {
  if (page.type === "course" || page.type === "online") {
    return `/admin/courses/${page.slug}`;
  }
  return `/admin/pages/${page.slug}`;
}

/**
 * Admin pages list — site, retreat, and venue pages.
 */
export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/admin/pages")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load pages");
        const body = (await response.json()) as { pages: PageRow[] };
        setPages(body.pages);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pages.filter((page) => {
      if (page.type === "course" || page.type === "online") return false;
      if (typeFilter !== "all" && page.type !== typeFilter) return false;
      if (!q) return true;
      return (
        page.title.toLowerCase().includes(q) ||
        page.slug.toLowerCase().includes(q)
      );
    });
  }, [pages, query, typeFilter]);

  return (
    <div>
      <h1 className="admin-title">Pages</h1>
      <p className="admin-subtitle">
        Edit site, retreat, and venue pages. Courses are under{" "}
        <Link href="/admin/courses">Courses</Link>.
      </p>

      <div className="admin-toolbar">
        <input
          className="admin-input admin-search"
          type="search"
          placeholder="Search by title or slug…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className="admin-input admin-filter"
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
        >
          <option value="all">All types</option>
          <option value="site">Site</option>
          <option value="retreat">Retreat</option>
          <option value="venue">Venue</option>
        </select>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Type</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((page) => (
              <tr key={page.id}>
                <td>{page.title}</td>
                <td>{page.slug}</td>
                <td>{page.type}</td>
                <td>{page.published ? "Published" : "Draft"}</td>
                <td>
                  <Link href={editHref(page)}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="admin-hint admin-empty">No pages match your search.</p>
        ) : null}
      </div>
    </div>
  );
}
