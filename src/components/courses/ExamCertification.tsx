"use client";

import Image from "next/image";
import { useState } from "react";
import { Container, MediaLightbox, SectionHeader } from "@/components/ui";

const EVALUATION_STEPS = [
  {
    title: "Applied Practical Exam",
    tag: "Practical Evaluation",
    desc: "Your growth will be tested in an applied practical exam wherein you must demonstrate your knowledge of asanas, pranayama, meditation, sequencing, and safe alignment, as well as care and clarity in guiding others.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Written Examinations",
    tag: "Theoretical Evaluation",
    desc: "You will be subjected to written examinations representing your understanding of the core areas of yoga philosophy, anatomy, breathwork, meditation, and the vast knowledge on which authentic teaching rests.",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Classroom Participation",
    tag: "Daily Engagement",
    desc: "Your classroom participation and active engagement throughout the yoga teacher training in India will be observed gently, as how you show up - with presence, enthusiasm, and openness, is equally important as what you know.",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Teaching Seat Assessment",
    tag: "Final Practice",
    desc: "Being the last chance to teach, an assessment will let you slip into the teacher’s seat, working your way through all of your learning and receiving nurturing critiques to grow from.",
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Attendance & Consistency",
    tag: "Yogic Discipline",
    desc: "Attendance and sincere participation in all activities of the yoga teacher training in Rishikesh are plenty enough requirements for certification, for Yoga is as much about discipline and consistency as inspiration.",
    image:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80",
  },
];

const CERTIFICATES = [
  {
    title: "Hatha Ashtanga Vinyasa YTTC Certificate",
    subtitle: "Yoga Alliance USA Accredited Course Certificate",
    image:
      "https://www.nirvanayogaschoolindia.com/img/certificate/200h-hatha-ashtanga-yttc-certificate.webp",
  },
  {
    title: "Nirvana Yoga School Certificate",
    subtitle: "Official Institutional Graduation Certificate",
    image:
      "https://www.nirvanayogaschoolindia.com/img/certificate/200-nirvana-yttc-certificate.webp",
  },
];

export default function ExamCertification() {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeCertIndex, setActiveCertIndex] = useState(0);

  return (
    <section
      id="exam"
      className="relative bg-white py-20 sm:py-28"
    >
      <Container size="2xl">
        <div className="space-y-16">
          {/* Section Header */}
          <SectionHeader
            eyebrow="Evaluation & Alignment"
            title={
              <>
                Exam &amp; <span className="text-primary">Certification</span>{" "}
                Process
              </>
            }
            description="Yoga teaching is a skill that is given due relevance at Nirvana Yoga School. It is recognized that yoga is not just something one learns; it is actually something that one lives and breathes into existence."
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
                  aria-label={`Preview ${CERTIFICATES[0].title}`}
                >
                  <Image
                    src={CERTIFICATES[0].image}
                    alt={CERTIFICATES[0].title}
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
                  aria-label={`Preview ${CERTIFICATES[1].title}`}
                >
                  <Image
                    src={CERTIFICATES[1].image}
                    alt={CERTIFICATES[1].title}
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
              {EVALUATION_STEPS.map((step, index) => (
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
                      {step.desc}
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
        items={CERTIFICATES.map((c) => ({
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
