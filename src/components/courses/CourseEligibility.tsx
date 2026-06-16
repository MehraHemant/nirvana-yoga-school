"use client";

import { motion } from "framer-motion";
import { Container, SectionHeader } from "@/components/ui";
import { Check } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

export default function CourseEligibility() {
  const requirements = [
    {
      title: "Practitioner Level",
      desc: "Perfect for beginner to intermediate practitioners wishing to deepen their practice, learn alignment, and obtain credentials to teach. No prior teaching experience required.",
    },
    {
      title: "Sincere Will to Grow",
      desc: "Applicants should nurture a genuine study of and dedication to living by yoga, supporting balance, mindfulness, and inner peace.",
    },
    {
      title: "Language Proficiency",
      desc: "Courses are conducted fully in English. A basic understanding is required to participate in lectures, philosophy debates, and teaching practicums.",
    },
    {
      title: "Age Guideline",
      desc: "To ensure the maturity, responsibility, and physical preparedness required for intensive ashram living, applicants must be at least 16 years of age.",
    },
  ];

  return (
    <section
      id="eligibility"
      className="py-20 sm:py-28 bg-sand border-b border-ink/5"
    >
      <Container size="xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          {/* Left: Section Header & intro */}
          <div className="lg:col-span-5 space-y-6">
            <SectionHeader
              eyebrow="Admissions"
              title={
                <>
                  Who is this{" "}
                  <span className="text-primary italic">Training</span> for?
                </>
              }
              align="left"
            />
            <p className="type-body text-muted leading-relaxed font-sans text-base sm:text-lg">
              Presuming that a 200-hour yoga teacher training is solely about
              physical flexibility or advanced poses is an incomplete view. We
              believe the most important prerequisites are an open heart, a
              disciplined mind, and a readiness for transformation.
            </p>
            <div className="p-6 rounded-3xl bg-white/60 border border-ink/5 shadow-soft">
              <span className="type-eyebrow text-primary font-semibold block mb-2">
                Yoga Alliance Standards
              </span>
              <p className="text-xs text-muted leading-relaxed font-sans">
                Our curriculum aligns with the strict standards set by Yoga
                Alliance USA. We maintain small class sizes (usually 15–20
                students) to guarantee highly personalized guidance.
              </p>
            </div>
          </div>

          {/* Right: Requirements grid */}
          <div className="lg:col-span-7 grid gap-6 sm:grid-cols-2">
            {requirements.map((req, index) => (
              <motion.div
                key={req.title}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_ONCE}
                variants={fadeUp}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-3xl p-6 border border-ink/5 shadow-card hover:shadow-soft transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 shrink-0">
                    <Check size={16} className="stroke-[3]" />
                  </div>
                  <h4 className="font-serif text-lg font-semibold text-ink mb-2">
                    {req.title}
                  </h4>
                  <p className="text-sm text-muted leading-relaxed font-sans">
                    {req.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
