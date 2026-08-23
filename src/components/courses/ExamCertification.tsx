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
 * Renders whichever side has content — steps, certificates, or both.
 *
 * @param props - Shared CMS content
 */
export default function ExamCertification({ content }: ExamCertificationProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeCertIndex, setActiveCertIndex] = useState(0);
  const certificates = content.certificates.filter((c) => c.image?.trim());
  const steps = content.steps.filter(
    (s) => s.title?.trim() || s.description?.trim() || s.tag?.trim(),
  );
  const showCertificates = certificates.length > 0;
  const showSteps = steps.length > 0;

  return (
    <section id="exam" className="relative bg-white py-20 sm:py-28">
      <Container size="2xl">
        <div className="space-y-16">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            align="center"
            className="mb-12"
          />

          {showCertificates || showSteps ? (
            <div
              className={
                showCertificates && showSteps
                  ? "grid gap-12 lg:grid-cols-12 lg:gap-16 items-start"
                  : "mx-auto max-w-3xl"
              }
            >
              {showCertificates ? (
                <div
                  className={
                    showSteps
                      ? "lg:col-span-5 lg:sticky lg:top-32 relative pt-4 self-start"
                      : "relative pt-4"
                  }
                >
                  <div className="relative">
                    {certificates.map((cert, index) => (
                      <button
                        key={`${cert.title}-${index}`}
                        type="button"
                        onClick={() => {
                          setActiveCertIndex(index);
                          setIsLightboxOpen(true);
                        }}
                        className={
                          index === 0
                            ? "relative aspect-3/2 w-10/12 rounded-2xl overflow-hidden border border-ink/10 shadow-sm z-20 transition-all duration-300 hover:scale-102 hover:shadow-md cursor-zoom-in text-left block"
                            : "relative aspect-3/2 w-10/12 rounded-2xl overflow-hidden border border-ink/10 shadow-md ml-auto -mt-16 z-10 transition-all duration-300 hover:scale-102 hover:shadow-lg cursor-zoom-in text-left block"
                        }
                        aria-label={`Preview ${cert.title || "certificate"}`}
                      >
                        <Image
                          src={cert.image}
                          alt={cert.title || "Certificate"}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  <p className="type-ui mt-6 text-center italic text-ink">
                    Click certificates to zoom in.
                  </p>
                </div>
              ) : null}

              {showSteps ? (
                <div
                  className={
                    showCertificates ? "lg:col-span-7 space-y-8" : "space-y-8"
                  }
                >
                  {steps.map((step, index) => (
                    <div
                      key={`${step.title}-${index}`}
                      className="flex gap-6 items-start relative pb-6 border-b border-ink/5 last:border-0 last:pb-0"
                    >
                      <span className="text-5xl md:text-6xl font-bold text-primary/10 select-none leading-none pt-1">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="space-y-1">
                        {step.tag?.trim() ? (
                          <span className="type-eyebrow text-primary/90 font-semibold tracking-wider block uppercase mb-1">
                            {step.tag}
                          </span>
                        ) : null}
                        {step.title?.trim() ? (
                          <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-ink">
                            {step.title}
                          </h4>
                        ) : null}
                        {step.description?.trim() ? (
                          <p className="text-base lg:text-lg pt-1">
                            {step.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </Container>

      {showCertificates ? (
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
      ) : null}
    </section>
  );
}
