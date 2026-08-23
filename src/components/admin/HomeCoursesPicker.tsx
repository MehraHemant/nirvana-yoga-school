"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { HomeCourseRef } from "@/content/types/dedicated-pages";
import { ExternalLink, Pencil } from "@/icons";
import { publicViewHref } from "@/lib/cms/page-layout-registry";
import { cloudinaryThumbUrl } from "@/lib/cdn/cloudinary-thumb-url";
import { parseApiJson } from "@/lib/types/api";
import type { CourseOption } from "./CoursesPicker";
import {
  DragHandle,
  type DragHandleProps,
  reorderItems,
  SortableList,
  SortableRow,
} from "./SortableList";
import { SectionLiveField } from "./SectionLiveField";

type HomeCoursesPickerProps = {
  /** Ordered homepage course placements */
  value: HomeCourseRef[];
  /** Called when visibility or order changes */
  onChange: (refs: HomeCourseRef[]) => void;
};

const COURSES_CACHE_TTL_MS = 60_000;
let coursesCache: { expiresAt: number; options: CourseOption[] } | null = null;
let coursesRequest: Promise<CourseOption[]> | null = null;

/**
 * Loads residential course pages for the homepage picker.
 */
function loadResidentialCourses(): Promise<CourseOption[]> {
  if (coursesCache && coursesCache.expiresAt > Date.now()) {
    return Promise.resolve(coursesCache.options);
  }

  if (!coursesRequest) {
    coursesRequest = fetch("/api/admin/courses")
      .then((res) => parseApiJson<{ courses: CourseOption[] }>(res))
      .then((body) => {
        const options = (body.courses ?? []).filter(
          (course) => course.type === "course",
        );
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
 * Formats fee and duration for compact row meta.
 *
 * @param course - Residential course option
 */
function courseMetaLabel(course: CourseOption): string {
  const parts = [course.fee?.trim(), course.duration?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "No fee or duration set";
}

/**
 * Residential course picker for the homepage — rich rows, drag reorder
 * for homepage courses, and bulk actions.
 *
 * @param props - Placements and change handler
 */
export function HomeCoursesPicker({ value, onChange }: HomeCoursesPickerProps) {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    loadResidentialCourses()
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

  const visibleRefs = useMemo(
    () => value.filter((ref) => ref.live !== false),
    [value],
  );

  const visibleSlugs = useMemo(
    () => visibleRefs.map((ref) => ref.courseSlug),
    [visibleRefs],
  );

  const courseBySlug = useMemo(
    () => new Map(courses.map((course) => [course.slug, course])),
    [courses],
  );

  const groupedCourses = useMemo(() => {
    const visibleSet = new Set(visibleSlugs);
    const visible = visibleSlugs.flatMap((slug) => {
      const course = courseBySlug.get(slug);
      return course ? [course] : [];
    });
    const hidden = courses
      .filter((course) => !visibleSet.has(course.slug))
      .sort((a, b) => a.title.localeCompare(b.title));

    return { visible, hidden };
  }, [courses, courseBySlug, visibleSlugs]);

  const onHomepageCount = visibleRefs.length;

  /**
   * Sets homepage visibility for one course slug.
   *
   * @param courseSlug - Residential course page slug
   * @param live - Whether the course appears on the homepage
   */
  function setCourseLive(courseSlug: string, live: boolean) {
    const existing = value.find((ref) => ref.courseSlug === courseSlug);
    if (live) {
      if (existing?.live === false) {
        onChange(
          value.map((ref) =>
            ref.courseSlug === courseSlug ? { courseSlug } : ref,
          ),
        );
        return;
      }
      if (existing) return;
      onChange([...value, { courseSlug }]);
      return;
    }

    if (!existing) return;
    onChange(value.filter((ref) => ref.courseSlug !== courseSlug));
  }

  /** Reorders visible homepage courses. */
  function reorderVisible(fromIndex: number, toIndex: number) {
    const nextSlugs = reorderItems(visibleSlugs, fromIndex, toIndex);
    const hidden = value.filter((ref) => ref.live === false);
    onChange([...nextSlugs.map((courseSlug) => ({ courseSlug })), ...hidden]);
  }

  /** Adds every published course not already on the homepage. */
  function addAllPublished() {
    const visibleSet = new Set(visibleSlugs);
    const toAdd = courses
      .filter((course) => course.published && !visibleSet.has(course.slug))
      .map((course) => ({ courseSlug: course.slug }));
    if (toAdd.length === 0) return;
    onChange([...value.filter((ref) => ref.live !== false), ...toAdd]);
  }

  /** Removes all courses from the homepage. */
  function clearHomepage() {
    if (onHomepageCount === 0) return;
    onChange([]);
  }

  /**
   * Renders one rich course row with thumbnail, meta, status, and actions.
   *
   * @param course - Residential course option
   * @param options - Row display options
   */
  function renderCourseRow(
    course: CourseOption,
    options: {
      order?: number;
      dragHandleProps?: DragHandleProps;
      isLive: boolean;
    },
  ) {
    const thumbSrc = course.image ? cloudinaryThumbUrl(course.image, 120) : "";
    const viewHref = publicViewHref(course.type, course.slug);

    return (
      <div
        className={`admin-home-courses-picker__row${options.isLive ? " admin-home-courses-picker__row--live" : " admin-home-courses-picker__row--hidden"}`}
      >
        <span
          className="admin-home-courses-picker__order"
          aria-hidden={!options.isLive}
        >
          {options.isLive && options.order ? options.order : "—"}
        </span>

        {options.isLive && options.dragHandleProps ? (
          <DragHandle dragHandleProps={options.dragHandleProps} />
        ) : (
          <span
            className="admin-home-courses-picker__drag-spacer"
            aria-hidden
          />
        )}

        <div className="admin-home-courses-picker__thumb">
          {thumbSrc ? (
            <Image
              src={thumbSrc}
              alt=""
              width={56}
              height={40}
              className="admin-home-courses-picker__thumb-img"
              sizes="56px"
              unoptimized
            />
          ) : (
            <span
              className="admin-home-courses-picker__thumb-empty"
              aria-hidden
            />
          )}
        </div>

        <div className="admin-home-courses-picker__copy">
          <span className="admin-home-courses-picker__title">
            {course.title}
          </span>
          <span className="admin-home-courses-picker__slug">{course.slug}</span>
          <span className="admin-home-courses-picker__meta">
            {courseMetaLabel(course)}
          </span>
        </div>

        <span
          className={`admin-status-chip${course.published ? " admin-status-chip--ok" : " admin-status-chip--warn"}`}
        >
          {course.published ? "Published" : "Draft"}
        </span>

        <div className="admin-home-courses-picker__actions">
          <Link
            href={`/admin/pages/${course.slug}`}
            className="admin-icon-btn admin-icon-btn--sm"
            aria-label={`Edit ${course.title}`}
            title="Edit course page"
          >
            <Pencil size={15} />
          </Link>
          <a
            href={viewHref}
            target="_blank"
            rel="noreferrer"
            className="admin-icon-btn admin-icon-btn--sm"
            aria-label={`View ${course.title}`}
            title="View live page"
          >
            <ExternalLink size={15} />
          </a>
        </div>

        <SectionLiveField
          id={`home-course-live-${course.slug}`}
          value={options.isLive}
          liveLabel="Homepage"
          hiddenLabel="Hidden"
          onChange={(live) => setCourseLive(course.slug, live)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-home-courses-picker">
        <div className="admin-home-courses-picker__list">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="admin-home-courses-picker__skeleton-row">
              <div className="admin-media-skeleton admin-home-courses-picker__skeleton-thumb" />
              <div className="admin-home-courses-picker__skeleton-copy">
                <div className="admin-media-skeleton admin-media-skeleton--line" />
                <div className="admin-media-skeleton admin-media-skeleton--line admin-media-skeleton--short" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="admin-error">
        {error}. Ensure course pages exist in the CMS, then retry.
      </p>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="admin-empty-state">
        <p className="admin-empty-state-title">No residential courses yet</p>
        <p className="admin-hint">
          Add course pages under{" "}
          <a href="/admin/sections/courses" className="admin-link">
            Courses
          </a>
          , then return here to choose homepage cards.
        </p>
      </div>
    );
  }

  const publishedNotOnHomepage = courses.filter(
    (course) => course.published && !visibleSlugs.includes(course.slug),
  ).length;

  return (
    <div className="admin-home-courses-picker">
      <div className="admin-home-courses-picker__bulk">
        <button
          type="button"
          className="admin-btn-sm"
          onClick={addAllPublished}
          disabled={publishedNotOnHomepage === 0}
        >
          Add all published
        </button>
        <button
          type="button"
          className="admin-btn-sm admin-btn-sm--ghost"
          onClick={clearHomepage}
          disabled={onHomepageCount === 0}
        >
          Clear homepage
        </button>
      </div>

      <div className="admin-home-courses-picker__list">
        {groupedCourses.visible.length > 0 ? (
          <div className="admin-home-courses-picker__group">
            <div className="admin-home-courses-picker__group-head">
              <span className="admin-home-courses-picker__group-title">
                On homepage
              </span>
            </div>
            <SortableList
              ids={groupedCourses.visible.map((course) => course.slug)}
              onReorder={reorderVisible}
              className="admin-home-courses-picker__sortable"
            >
              {groupedCourses.visible.map((course, index) => (
                <SortableRow
                  key={course.slug}
                  id={course.slug}
                  className="admin-home-courses-picker__sortable-row"
                >
                  {({ dragHandleProps }) =>
                    renderCourseRow(course, {
                      order: index + 1,
                      dragHandleProps,
                      isLive: true,
                    })
                  }
                </SortableRow>
              ))}
            </SortableList>
          </div>
        ) : null}

        {groupedCourses.hidden.length > 0 ? (
          <div className="admin-home-courses-picker__group">
            <div className="admin-home-courses-picker__group-head">
              <span className="admin-home-courses-picker__group-title">
                Not on homepage
              </span>
            </div>
            <div className="admin-home-courses-picker__static-rows">
              {groupedCourses.hidden.map((course) => (
                <div
                  key={course.slug}
                  className="admin-home-courses-picker__static-row"
                >
                  {renderCourseRow(course, { isLive: false })}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <p className="admin-hint admin-home-courses-picker__footer">
        Card title, fee, image, duration, and highlights come from each course
        page. Toggle Homepage, then drag shown courses to reorder.{" "}
        <a href="/admin/sections/courses" className="admin-link">
          Manage course pages →
        </a>
      </p>
    </div>
  );
}
