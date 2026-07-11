"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CourseRow = {
  id: string;
  slug: string;
  type: string;
  title: string;
  published: boolean;
  updatedAt: string;
};

/**
 * Admin courses list — residential and online YTT programs.
 */
export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "course" | "online">(
    "all",
  );

  useEffect(() => {
    fetch("/api/admin/courses")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load courses");
        const body = (await response.json()) as { courses: CourseRow[] };
        setCourses(body.courses);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((course) => {
      if (typeFilter !== "all" && course.type !== typeFilter) return false;
      if (!q) return true;
      return (
        course.title.toLowerCase().includes(q) ||
        course.slug.toLowerCase().includes(q)
      );
    });
  }, [courses, query, typeFilter]);

  return (
    <div>
      <h1 className="admin-title">Courses</h1>
      <p className="admin-subtitle">
        Edit residential and online yoga teacher training programs.
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
          onChange={(event) =>
            setTypeFilter(event.target.value as "all" | "course" | "online")
          }
        >
          <option value="all">All types</option>
          <option value="course">Residential</option>
          <option value="online">Online</option>
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
            {filtered.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>{course.slug}</td>
                <td>{course.type === "online" ? "Online" : "Residential"}</td>
                <td>{course.published ? "Published" : "Draft"}</td>
                <td>
                  <Link href={`/admin/courses/${course.slug}`}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="admin-hint admin-empty">
            No courses match your search.
          </p>
        ) : null}
      </div>
    </div>
  );
}
