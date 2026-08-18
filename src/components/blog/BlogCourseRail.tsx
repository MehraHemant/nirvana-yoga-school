import Link from "next/link";
import type {
  BlogRailCourse,
  BlogRailPricingTier,
} from "@/content/mappers/resolve-blog-rail-courses";
import { Bed, Bowl, Lotus } from "@/icons";
import { BlogRoomImagesCarousel } from "./BlogRoomImagesCarousel";

type BlogCourseRailProps = {
  courses: BlogRailCourse[];
};

const INCLUSION_PILLS = [
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
 * Splits a CMS price string into amount + currency for display.
 *
 * @param price - Raw price (e.g. "299 USD", "$649")
 */
function splitPriceLabel(price: string): { amount: string; suffix: string } {
  const trimmed = price.trim();
  const match = trimmed.match(/^\$?\s*([\d,]+(?:\.\d+)?)\s*(USD|INR)?$/i);
  if (match?.[1]) {
    return {
      amount: match[1].replace(/,/g, ""),
      suffix: (match[2] ?? "USD").toUpperCase(),
    };
  }
  return { amount: trimmed, suffix: "" };
}

/**
 * Formats a price for the rail (e.g. "299 USD").
 *
 * @param price - CMS price string
 */
function formatPriceDisplay(price: string): string {
  const { amount, suffix } = splitPriceLabel(price);
  return suffix ? `${amount} ${suffix}` : amount;
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
 * Accommodation tier row: icon tile, room name, struck original + outlined sale.
 *
 * @param props - Tier fields
 */
function PricingTierRow({ tier }: { tier: BlogRailPricingTier }) {
  const current = formatPriceDisplay(tier.price);
  const was = tier.originalPrice?.trim()
    ? formatPriceDisplay(tier.originalPrice)
    : null;

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-[#faf6ef] px-2.5 py-2">
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0e4d4] text-ink/65"
          aria-hidden="true"
        >
          <Bed size={14} />
        </span>
        <span className="truncate text-sm font-medium leading-5 text-ink">
          {tier.roomType}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-0.5">
        {was ? (
          <span className="text-[11px] tabular-nums text-muted line-through">
            {was}
          </span>
        ) : null}
        <span className="inline-flex items-center rounded-lg border border-primary/50 bg-white px-2.5 py-1 text-sm font-semibold tabular-nums text-primary">
          {current}
        </span>
      </span>
    </li>
  );
}

/**
 * Single program block: title, duration badge + link, room image, tier rows.
 *
 * @param props - Resolved course card
 */
function ProgramCard({ course }: { course: BlogRailCourse }) {
  const isExternal = course.href.startsWith("http");
  const duration = course.duration?.trim() ?? "";
  const roomImages = course.roomImages.map((url) => url.trim()).filter(Boolean);
  const viewLabel = isRetreatProgram(course)
    ? "View retreat →"
    : "View program →";
  const tiers =
    course.pricing.length > 0
      ? course.pricing
      : course.fee?.trim()
        ? [{ roomType: "Program fee", price: course.fee.trim() }]
        : [];

  return (
    <article>
      <h3 className="text-[1.05rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
        {course.title}
      </h3>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
        {duration ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-white">
            <CalendarGlyph size={12} />
            {durationBadgeLabel(duration)}
          </span>
        ) : null}
        <Link
          href={course.href}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
        >
          {viewLabel}
        </Link>
      </div>

      {roomImages.length > 0 ? (
        <BlogRoomImagesCarousel
          images={roomImages}
          label={`${course.title} room photos`}
        />
      ) : null}

      {tiers.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {tiers.map((tier) => (
            <PricingTierRow
              key={`${tier.roomType}-${tier.price}`}
              tier={tier}
            />
          ))}
        </ul>
      ) : null}
    </article>
  );
}

/**
 * Sticky Programs & pricing rail — screenshot-faithful commerce aside.
 * On desktop the card fills the sticky column; all card content scrolls together.
 *
 * @param props - Resolved hub courses with lodging tiers / room images
 */
export function BlogCourseRail({ courses }: BlogCourseRailProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_1px_0_rgba(28,25,23,0.04)] lg:h-full lg:min-h-0">
      <div className="h-1 w-full shrink-0 bg-primary" aria-hidden="true" />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6 lg:scrollbar-thin-primary">
        <header>
          <h2
            id="blog-programs-heading"
            className="text-[1.65rem] font-bold leading-tight tracking-[-0.02em] text-ink"
          >
            Programs & pricing
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            Stay, meals, and yoga included—pick an accommodation tier.
          </p>

          <ul className="mt-3.5 flex flex-wrap gap-2">
            {INCLUSION_PILLS.map(({ label, Icon }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/6 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary"
              >
                <Icon size={12} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </header>

        {courses.length > 0 ? (
          <div className="mt-6 space-y-7">
            {courses.map((course, index) => (
              <ProgramCard
                key={
                  course.courseSlug || course.href || `${course.title}-${index}`
                }
                course={course}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-ink/10 bg-surface/60 px-4 py-5">
            <p className="text-sm leading-6 text-muted">
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
