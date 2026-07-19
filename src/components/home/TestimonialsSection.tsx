"use client";

import { Container, PlatformReviewsRows, SectionHeader } from "@/components/ui";
import { DEFAULT_HOME_PAGE_CONTENT } from "@/content/data/dedicated-page-defaults";
import type { HomeReviewsSectionContent } from "@/content/types/dedicated-pages";
import type { ReviewsContent } from "@/content/types/shared-sections";
import { resolveSectionHtmlId } from "@/lib/html-id";

type TestimonialsSectionProps = {
  /** Server-provided reviews (skips client fetch) */
  reviews?: ReviewsContent | null;
  /** Optional CMS section header copy (includes `_id` for public anchor) */
  content?: Pick<
    HomeReviewsSectionContent,
    "_id" | "eyebrow" | "title" | "description"
  >;
};

/**
 * Homepage testimonials band with platform review rows.
 *
 * @param props - Optional server-provided reviews and CMS header
 */
export default function TestimonialsSection({
  reviews,
  content,
}: TestimonialsSectionProps = {}) {
  const eyebrow =
    content?.eyebrow ?? DEFAULT_HOME_PAGE_CONTENT.testimonials.eyebrow;
  const title = content?.title ?? DEFAULT_HOME_PAGE_CONTENT.testimonials.title;
  const description =
    content?.description ?? DEFAULT_HOME_PAGE_CONTENT.testimonials.description;

  return (
    <section
      id={resolveSectionHtmlId("reviews", content?._id)}
      className="relative w-full overflow-hidden bg-white py-20 md:py-28"
    >
      <div
        className="pointer-events-none absolute -top-32 right-1/4 h-[600px] w-[600px] rounded-full bg-primary/3 blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-accent/8 blur-[120px]"
        aria-hidden="true"
      />

      <Container size="2xl" className="relative z-10 w-full">
        <div className="mx-auto mb-16 w-full max-w-2xl text-center">
          <SectionHeader
            align="center"
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
        </div>

        <PlatformReviewsRows content={reviews} />
      </Container>
    </section>
  );
}
