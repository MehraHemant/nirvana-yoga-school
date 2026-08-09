import Link from "next/link";
import type { ResolvedYttHubCourse } from "@/content/types/shared-sections";
import { ArrowRight } from "@/icons";

type BlogCourseRailProps = {
  courses: ResolvedYttHubCourse[];
};

/**
 * Builds a compact meta line from duration, level, and certification.
 *
 * @param course - Resolved published YTT hub course
 */
function getMetaLine(course: ResolvedYttHubCourse): string {
  return [course.duration, course.level, course.certification]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" · ");
}

/**
 * Returns a brief 1–2 line excerpt for the rail.
 *
 * @param value - Course overview or placement description
 * @param maxChars - Soft character budget before ellipsis
 */
function trimExcerpt(value: string, maxChars = 110): string {
  const text = value.trim();
  if (text.length <= maxChars) return text;
  const clipped = text.slice(0, maxChars).replace(/\s+\S*$/, "");
  return `${clipped}…`;
}

/**
 * Concise, image-free program entry for the article-side rail.
 *
 * @param props - Resolved course and display index
 */
function BlogCourseEntry({
  course,
  index,
}: {
  course: ResolvedYttHubCourse;
  index: number;
}) {
  const isExternal = course.href.startsWith("http");
  const meta = getMetaLine(course);
  const excerpt = trimExcerpt(course.description || course.overview);
  const highlights = course.focusAreas
    .filter((item) => item.trim())
    .slice(0, 2);

  return (
    <article className="border-t border-ink/10 pt-6 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2.5">
            <span
              className="shrink-0 font-serif text-xs font-medium tracking-widest text-primary"
              aria-hidden="true"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-serif text-lg font-medium leading-snug tracking-[-0.01em] text-ink">
              {course.title}
            </h3>
          </div>
          {meta ? (
            <p className="mt-2 text-xs leading-5 text-muted">{meta}</p>
          ) : null}
        </div>
        {course.fee ? (
          <p className="shrink-0 pt-0.5 text-right text-sm font-semibold text-ink">
            {course.fee}
          </p>
        ) : null}
      </div>

      {excerpt ? (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/70">
          {excerpt}
        </p>
      ) : null}

      {highlights.length > 0 ? (
        <p className="mt-2.5 text-xs leading-5 text-muted">
          <span className="font-semibold text-ink/55">Focus · </span>
          {highlights.join(" · ")}
        </p>
      ) : null}

      <Link
        href={course.href}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="group mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-4 focus-visible:ring-offset-surface-muted"
        aria-label={`View details for ${course.title}`}
      >
        Explore
        <ArrowRight
          size={14}
          className="transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    </article>
  );
}

/**
 * Sticky program rail from YTT hub placements — concise, image-free entries.
 *
 * @param props - Resolved published course cards
 */
export function BlogCourseRail({ courses }: BlogCourseRailProps) {
  return (
    <div>
      <p className="type-eyebrow text-primary">Teacher trainings</p>
      <h2
        id="blog-programs-heading"
        className="mt-2.5 font-serif text-2xl font-medium leading-tight tracking-[-0.015em] text-ink sm:text-[1.85rem]"
      >
        Study in Rishikesh
      </h2>
      <p className="mt-2.5 max-w-xs text-sm leading-6 text-muted">
        Current Yoga Alliance certified programs.
      </p>

      {courses.length > 0 ? (
        <div className="mt-8 space-y-6">
          {courses.map((course, index) => (
            <BlogCourseEntry
              key={
                course.courseSlug || course.href || `${course.title}-${index}`
              }
              course={course}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 border-t border-ink/10 pt-6">
          <p className="text-sm leading-6 text-muted">New dates coming soon.</p>
          <Link
            href="/yoga-teacher-training-in-rishikesh-india"
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-4 focus-visible:ring-offset-surface-muted"
          >
            Browse programs
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
