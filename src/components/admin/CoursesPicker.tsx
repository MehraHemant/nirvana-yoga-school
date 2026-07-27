"use client";

import { useEffect, useMemo, useState } from "react";
import type { YttHubCourseRef } from "@/content/types/shared-sections";
import { parseApiJson } from "@/lib/types/api";
import { ListRowActions } from "./ListRowActions";
import { reorderItems, SortableList, SortableRow } from "./SortableList";
import { TextField } from "./TextField";

export type CourseOption = {
  id: string;
  slug: string;
  type: string;
  title: string;
  published: boolean;
};

type CoursesPickerProps = {
  /** Ordered course placements (entity refs) */
  value: YttHubCourseRef[];
  /** Called when selection, order, or placement descriptions change */
  onChange: (refs: YttHubCourseRef[]) => void;
  /** Optional hint under the picker */
  hint?: string;
  /** Limit options to these page types (default: residential + online) */
  types?: Array<"course" | "online">;
};

const COURSES_CACHE_TTL_MS = 60_000;
let coursesCache: { expiresAt: number; options: CourseOption[] } | null = null;
let coursesRequest: Promise<CourseOption[]> | null = null;

/**
 * Loads and briefly caches course pages for admin pickers.
 *
 * @returns Course options from `/api/admin/courses`
 */
function loadCourses(): Promise<CourseOption[]> {
  if (coursesCache && coursesCache.expiresAt > Date.now()) {
    return Promise.resolve(coursesCache.options);
  }

  if (!coursesRequest) {
    coursesRequest = fetch("/api/admin/courses")
      .then((res) => parseApiJson<{ courses: CourseOption[] }>(res))
      .then((body) => {
        const options = body.courses ?? [];
        coursesCache = {
          options,
          expiresAt: Date.now() + COURSES_CACHE_TTL_MS,
        };
        return options;
      })
      .finally(() => {
        coursesRequest = null;
      });
  }

  return coursesRequest;
}

/**
 * Multi-select course entity picker with optional per-placement description.
 * Persists refs only — title/fee/image resolve from course documents at read time.
 *
 * @param props - Placement refs and change handler
 */
export function CoursesPicker({
  value,
  onChange,
  hint = "Courses are managed as pages. Select which appear here; title, fee, image, and duration come from the course.",
  types = ["course", "online"],
}: CoursesPickerProps) {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    loadCourses()
      .then((options) => {
        if (controller.signal.aborted) return;
        setCourses(options);
        setError("");
      })
      .catch((err: Error) => {
        if (!controller.signal.aborted) {
          setError(err.message || "Failed to load courses");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  const typeSet = useMemo(() => new Set(types), [types]);
  const available = useMemo(
    () =>
      courses.filter(
        (course) =>
          typeSet.has(course.type as "course" | "online") && course.published,
      ),
    [courses, typeSet],
  );

  const selectedSlugs = value.map((ref) => ref.courseSlug);
  const bySlug = useMemo(
    () => new Map(available.map((course) => [course.slug, course])),
    [available],
  );

  const selectedCourses = useMemo(() => {
    return value.map((ref) => ({
      ref,
      option: bySlug.get(ref.courseSlug) ?? null,
    }));
  }, [value, bySlug]);

  /**
   * Applies a new ordered slug selection, preserving placement descriptions.
   *
   * @param nextSlugs - Selected slugs in display order
   */
  function applySelection(nextSlugs: string[]) {
    const descBySlug = new Map(
      value.map((ref) => [ref.courseSlug, ref.description] as const),
    );
    onChange(
      nextSlugs.map((courseSlug) => {
        const description = descBySlug.get(courseSlug)?.trim();
        return description ? { courseSlug, description } : { courseSlug };
      }),
    );
  }

  /** Toggles a course slug in the selection. */
  function toggle(slug: string) {
    const next = selectedSlugs.includes(slug)
      ? selectedSlugs.filter((itemSlug) => itemSlug !== slug)
      : [...selectedSlugs, slug];
    applySelection(next);
  }

  /** Reorders selected placements via drag-and-drop. */
  function reorderSelected(fromIndex: number, toIndex: number) {
    applySelection(reorderItems(selectedSlugs, fromIndex, toIndex));
  }

  /**
   * Patches the optional placement description for one course.
   *
   * @param courseSlug - Course page slug
   * @param description - Placement override (empty clears override)
   */
  function patchDescription(courseSlug: string, description: string) {
    onChange(
      value.map((ref) => {
        if (ref.courseSlug !== courseSlug) return ref;
        const trimmed = description.trim();
        return trimmed ? { courseSlug, description: trimmed } : { courseSlug };
      }),
    );
  }

  const visibleCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return available;
    return available.filter((course) =>
      `${course.title} ${course.slug} ${course.type}`
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [available, query]);

  if (loading) {
    return <p className="admin-hint">Loading courses…</p>;
  }

  if (error) {
    return (
      <p className="admin-error">
        {error}. Ensure course pages exist in the CMS, then retry.
      </p>
    );
  }

  if (available.length === 0) {
    return (
      <p className="admin-hint">
        No published courses yet. Add residential or online course pages, then
        return here to select them.
      </p>
    );
  }

  return (
    <div className="admin-field admin-courses-picker">
      <div className="admin-teachers-picker__header">
        <span className="admin-label">Courses on this page</span>
        <div className="admin-teachers-picker__actions">
          <span className="admin-teachers-picker__count" aria-live="polite">
            {value.length} selected
          </span>
          <button
            type="button"
            className="admin-btn-sm admin-btn-sm--ghost"
            onClick={() => onChange([])}
            disabled={value.length === 0}
          >
            Clear
          </button>
        </div>
      </div>
      {hint ? <p className="admin-hint admin-hint--tight">{hint}</p> : null}

      {selectedCourses.length > 0 ? (
        <div className="admin-teachers-picker__selected">
          <span className="admin-teachers-picker__selected-label">
            Selected order (drag to reorder)
          </span>
          <SortableList
            ids={value.map((ref) => ref.courseSlug)}
            onReorder={reorderSelected}
            className="admin-courses-picker__selected-list"
          >
            {selectedCourses.map(({ ref, option }, index) => (
              <SortableRow
                key={ref.courseSlug}
                id={ref.courseSlug}
                className="admin-courses-picker__selected-row"
              >
                {({ dragHandleProps }) => (
                  <div className="admin-courses-picker__selected-body">
                    <div className="admin-courses-picker__selected-top">
                      <span className="admin-teachers-picker__selected-order">
                        {index + 1}
                      </span>
                      <span className="admin-teachers-picker__person">
                        <span>{option?.title ?? ref.courseSlug}</span>
                        <small className="admin-teachers-picker__role">
                          {option
                            ? `${option.type === "online" ? "Online" : "Residential"} · ${option.slug}`
                            : `Missing course · ${ref.courseSlug}`}
                        </small>
                      </span>
                      <ListRowActions
                        dragHandleProps={dragHandleProps}
                        onRemove={() => toggle(ref.courseSlug)}
                      />
                    </div>
                    <TextField
                      id={`course-placement-desc-${ref.courseSlug}`}
                      label="Placement description (optional)"
                      value={ref.description ?? ""}
                      onChange={(description) =>
                        patchDescription(ref.courseSlug, description)
                      }
                      multiline
                      rows={2}
                      hint="Overrides the course overview on this page only."
                    />
                  </div>
                )}
              </SortableRow>
            ))}
          </SortableList>
        </div>
      ) : null}

      <input
        className="admin-input admin-teachers-picker__search"
        type="search"
        aria-label="Search courses"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search courses"
      />
      <ul className="admin-teachers-picker__grid">
        {visibleCourses.map((course) => (
          <li key={course.id}>
            <label className="admin-teachers-picker__card">
              <input
                type="checkbox"
                checked={selectedSlugs.includes(course.slug)}
                onChange={() => toggle(course.slug)}
              />
              <span className="admin-teachers-picker__person">
                <span>{course.title}</span>
                <small className="admin-teachers-picker__role">
                  {course.type === "online" ? "Online" : "Residential"} ·{" "}
                  {course.slug}
                </small>
              </span>
            </label>
          </li>
        ))}
      </ul>
      {visibleCourses.length === 0 ? (
        <p className="admin-hint">No courses match “{query}”.</p>
      ) : null}
      <p className="admin-hint" style={{ marginTop: "0.5rem" }}>
        <a href="/admin/pages" className="admin-link">
          Manage course pages →
        </a>
      </p>
    </div>
  );
}
