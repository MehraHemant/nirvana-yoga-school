import Link from "next/link";
import type { BlogRailCourse } from "@/content/mappers/resolve-blog-rail-courses";
import { bookingReserveHref } from "@/components/courses/upcomingDatesShared";
import { Bed, Bowl, Lotus } from "@/icons";
import { BlogPricingCarousel } from "./BlogPricingCarousel";

type BlogCourseRailProps = {
  courses: BlogRailCourse[];
};

const INCLUSION_ITEMS = [
  { label: "Meals", Icon: Bowl },
  { label: "Stay", Icon: Bed },
  { label: "Yoga", Icon: Lotus },
] as const;

/**
 * Small calendar glyph for duration badges (no shared Calendar icon).
 *
 * @param props - Pixel size
 */
function CalendarGlyph({ size = 12 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M3 10h18M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Uppercases duration for the solid badge.
 *
 * @param duration - CMS duration string
 */
function durationBadgeLabel(duration: string): string {
  return duration.trim().toUpperCase();
}

/**
 * True when the program reads as a retreat (CTA copy).
 *
 * @param course - Resolved rail course
 */
function isRetreatProgram(course: BlogRailCourse): boolean {
  const haystack =
    `${course.href} ${course.title} ${course.courseSlug ?? ""}`.toLowerCase();
  return haystack.includes("retreat");
}

/**
 * Booking type for reserve deep-links from the rail.
 *
 * @param course - Resolved rail course
 */
function bookingTypeForCourse(
  course: BlogRailCourse,
): "course" | "retreat" | null {
  if (isRetreatProgram(course)) return "retreat";
  if (course.href.includes("/online")) return null;
  if (course.courseSlug || course.href.includes("/course/")) return "course";
  return null;
}

/**
 * Single program block: title, duration + link, room pricing carousel.
 *
 * @param props - Resolved course card
 */
function ProgramCard({ course }: { course: BlogRailCourse }) {
  const isExternal = course.href.startsWith("http");
  const duration = course.duration?.trim() ?? "";
  const viewLabel = isRetreatProgram(course)
    ? "View retreat →"
    : "View program →";
  const bookingType = bookingTypeForCourse(course);
  const programSlug = course.courseSlug?.trim() || null;
  const tiers =
    course.pricing.length > 0
      ? course.pricing
      : course.fee?.trim()
        ? [
            {
              roomType: "Program fee",
              price: course.fee.trim(),
              ...(course.fromDate ? { fromDate: course.fromDate } : {}),
              ...(course.batchDates ? { batchDates: course.batchDates } : {}),
              ...(course.roomImages[0]
                ? { image: course.roomImages[0] }
                : course.image?.trim()
                  ? { image: course.image.trim() }
                  : {}),
            },
          ]
        : [];

  return (
    <article className="space-y-0">
      <div className="space-y-2.5">
        <h3 className="type-display-sm text-ink">{course.title}</h3>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {duration ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-white">
              <CalendarGlyph size={12} />
              {durationBadgeLabel(duration)}
            </span>
          ) : null}
          {course.fromDate ? (
            <span className="text-xs font-medium text-ink/60">
              Next start{" "}
              <span className="text-ink/80">{course.fromDate}</span>
            </span>
          ) : null}
        </div>

        <Link
          href={course.href}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="inline-flex text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
        >
          {viewLabel}
        </Link>
      </div>

      {tiers.length > 0 ? (
        <BlogPricingCarousel
          tiers={tiers.map((tier) => {
            const batch = tier.batchDates?.trim() || course.batchDates;
            const bookHref =
              bookingType && programSlug && batch
                ? bookingReserveHref(
                    bookingType,
                    programSlug,
                    tier.roomType,
                    batch,
                  )
                : undefined;
            return bookHref ? { ...tier, bookHref } : tier;
          })}
          label={`${course.title} room pricing`}
        />
      ) : null}
    </article>
  );
}

/**
 * Sticky Programs & pricing rail — commerce aside with room fee carousel.
 * On desktop the card fills the sticky column; all card content scrolls together.
 *
 * @param props - Resolved hub courses with all priced rooms / upcoming dates
 */
export function BlogCourseRail({ courses }: BlogCourseRailProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_1px_0_rgba(28,25,23,0.04)] lg:h-full lg:min-h-0">
      <div className="h-1 w-full shrink-0 bg-primary" aria-hidden="true" />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6 lg:scrollbar-thin-primary">
        <header className="pb-5">
          <p className="type-eyebrow text-primary">Stay with us</p>
          <h2
            id="blog-programs-heading"
            className="mt-2 type-h3 tracking-tight text-ink"
          >
            Programs & pricing
          </h2>

          <p className="mt-2.5 max-w-[36ch] text-sm leading-6 text-ink/70">
            Stay, meals, and yoga included—browse every accommodation tier and
            upcoming start date.
          </p>

          <ul className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-ink/8 pt-4 text-xs font-medium text-ink/65">
            {INCLUSION_ITEMS.map(({ label, Icon }, index) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                {index > 0 ? (
                  <span className="mx-1.5 text-ink/25" aria-hidden="true">
                    ·
                  </span>
                ) : null}
                <Icon size={13} className="text-primary" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </header>

        {courses.length > 0 ? (
          <div className="space-y-0 divide-y divide-ink/10 border-t border-ink/10">
            {courses.map((course, index) => (
              <div
                key={
                  course.courseSlug || course.href || `${course.title}-${index}`
                }
                className="py-6 first:pt-5 last:pb-1"
              >
                <ProgramCard course={course} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-1 rounded-2xl border border-ink/10 bg-surface-muted/60 px-4 py-5">
            <p className="text-sm leading-6 text-ink/80">
              New dates coming soon.
            </p>
            <Link
              href="/yoga-teacher-training-in-rishikesh-india"
              className="mt-3 inline-flex text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              Browse programs →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
