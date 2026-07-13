"use client";

import { Container, PlatformReviewsRows, SectionHeader } from "@/components/ui";

export default function TestimonialsSection() {
  return (
    <section
      id="reviews"
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
            eyebrow="Testimonials"
            title={
              <>
                What Students Say About{" "}
                <span className="font-medium text-primary">
                  Nirvana Yoga School
                </span>
              </>
            }
            description="Read the authentic transformation stories of practitioners from all corners of the globe who completed their lineages here."
          />
        </div>

        <PlatformReviewsRows />
      </Container>
    </section>
  );
}
