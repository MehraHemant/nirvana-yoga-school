"use client";

import { useEffect, useState } from "react";
import { TEACHER_PAGE_SLUG, teacherSlug } from "@/content/teachers-slug";
import type { SitePagePerson } from "@/content/types/site-page";
import { parseApiJson } from "@/lib/types/api";

export type FacultyOption = {
  /** Stable slug from teacher name */
  slug: string;
  /** Full faculty person row from `/teacher` */
  person: SitePagePerson;
};

type TeachersPickerProps = {
  /** Currently selected faculty slugs */
  selectedSlugs: string[];
  /** Called when the selection changes */
  onChange: (selectedSlugs: string[], people: SitePagePerson[]) => void;
  /** Optional hint under the picker */
  hint?: string;
};

/**
 * Multi-select faculty picker backed by the published `/teacher` page.
 * Does not invent orphan teacher records — only selects from the store.
 *
 * @param props - Selected slugs and change handler
 */
export function TeachersPicker({
  selectedSlugs,
  onChange,
  hint = "Faculty is managed under Teachers. Select who appears on this page.",
}: TeachersPickerProps) {
  const [faculty, setFaculty] = useState<FacultyOption[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/pages/${TEACHER_PAGE_SLUG}`)
      .then((res) =>
        parseApiJson<{ page: { people?: SitePagePerson[] } }>(res),
      )
      .then((body) => {
        if (cancelled) return;
        const people = body.page.people ?? [];
        setFaculty(
          people.map((person) => ({
            slug: teacherSlug(person.name),
            person,
          })),
        );
        setError("");
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Failed to load faculty");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(slug: string) {
    const next = selectedSlugs.includes(slug)
      ? selectedSlugs.filter((s) => s !== slug)
      : [...selectedSlugs, slug];
    const people = faculty
      .filter((item) => next.includes(item.slug))
      .map((item) => item.person);
    onChange(next, people);
  }

  if (loading) {
    return <p className="admin-hint">Loading faculty…</p>;
  }

  if (error) {
    return (
      <p className="admin-error">
        {error}. Ensure the Teachers page is seeded (`npm run db:seed`), then
        retry.
      </p>
    );
  }

  if (faculty.length === 0) {
    return (
      <p className="admin-hint">
        No faculty yet. Add teachers under{" "}
        <a href="/admin/sections/teachers" className="admin-link">
          Teachers
        </a>
        , then return here to select them.
      </p>
    );
  }

  return (
    <div className="admin-field">
      <span className="admin-label">Teachers on this page</span>
      {hint ? <p className="admin-hint admin-hint--tight">{hint}</p> : null}
      <ul className="admin-flags-grid" style={{ marginTop: "0.5rem" }}>
        {faculty.map((item) => (
          <li key={item.slug}>
            <label className="admin-checkbox admin-checkbox-row">
              <input
                type="checkbox"
                checked={selectedSlugs.includes(item.slug)}
                onChange={() => toggle(item.slug)}
              />
              <span>{item.person.name}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="admin-hint" style={{ marginTop: "0.5rem" }}>
        <a href="/admin/sections/teachers" className="admin-link">
          Edit faculty profiles →
        </a>
      </p>
    </div>
  );
}
