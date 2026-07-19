"use client";

import Image from "next/image";
import { useState } from "react";
import { Container, MediaLightbox, SectionHeader } from "@/components/ui";
import type { ExamCertificationContent } from "@/content/types/shared-sections";

type ExamCertificationProps = {
  /** Shared CMS content for the exam and certificate section. */
  content: ExamCertificationContent;
};

/**
 * Shared exam and certification section.
 *
 * @param props - Shared CMS content
 */
export default function ExamCertification({ content }: ExamCertificationProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeCertIndex, setActiveCertIndex] = useState(0);
  const certificates = content.certificates;

  return (
    <section id="exam" className="relative bg-white py-20 sm:py-28">
      <Container size="2xl">
        <div className="space-y-16">
          {/* Section Header */}
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            align="center"
            className="mb-12"
          />

          {/* Sticky Left Collage Grid */}
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
            {/* Left Column: Sticky collage of certificates */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 relative pt-4 self-start">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCertIndex(0);
                    setIsLightboxOpen(true);
                  }}
                  className="relative aspect-3/2 w-10/12 rounded-2xl overflow-hidden border border-ink/10 shadow-sm z-20 transition-all duration-300 hover:scale-102 hover:shadow-md cursor-zoom-in text-left block"
                  aria-label={`Preview ${certificates[0]?.title ?? "certificate"}`}
                >
                  <Image
                    src={certificates[0]?.image ?? ""}
                    alt={certificates[0]?.title ?? ""}
                    fill
                    className="object-cover"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCertIndex(1);
                    setIsLightboxOpen(true);
                  }}
                  className="relative aspect-3/2 w-10/12 rounded-2xl overflow-hidden border border-ink/10 shadow-md ml-auto -mt-16 z-10 transition-all duration-300 hover:scale-102 hover:shadow-lg cursor-zoom-in text-left block"
                  aria-label={`Preview ${certificates[1]?.title ?? "certificate"}`}
                >
                  <Image
                    src={certificates[1]?.image ?? ""}
                    alt={certificates[1]?.title ?? ""}
                    fill
                    className="object-cover"
                  />
                </button>
              </div>
              <p className="type-ui mt-6 text-center italic text-muted">
                Click certificates to zoom in.
              </p>
            </div>

            {/* Right Column: Scrollable Steps list */}
            <div className="lg:col-span-7 space-y-8">
              {content.steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-6 items-start relative pb-6 border-b border-ink/5 last:border-0 last:pb-0"
                >
                  <span className="font-serif text-5xl md:text-6xl font-bold text-primary/10 select-none leading-none pt-1">
                    0{index + 1}
                  </span>
                  <div className="space-y-1">
                    <span className="type-eyebrow text-primary/70 font-semibold tracking-wider block uppercase mb-1">
                      {step.tag}
                    </span>
                    <h4 className="font-serif text-base sm:text-lg md:text-xl lg:text-2xl font-semibold tracking-wider text-ink">
                      {step.title}
                    </h4>
                    <p className="type-body pt-1 leading-relaxed text-muted">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Reusable Lightbox Modal */}
      <MediaLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        items={certificates.map((c) => ({
          type: "image" as const,
          url: c.image,
        }))}
        activeIndex={activeCertIndex}
        onChangeActiveIndex={setActiveCertIndex}
        title="Graduation Credentials"
      />
    </section>
  );
}
