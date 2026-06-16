"use client";

import { motion } from "framer-motion";
import { Container, SectionHeader } from "@/components/ui";
import { Check } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

export default function ExamCertification() {
  const steps = [
    {
      title: "Written Examination",
      desc: "Comprehensive evaluation of your understanding of core subject areas including anatomy, yogic philosophy, pranayama mechanics, and history.",
    },
    {
      title: "Applied Practical Exam",
      desc: "Demonstration of your teaching capability, cueing clarity, sequencing logic, safety alignments, and adjustments on real students.",
    },
    {
      title: "Classroom Presence & Participation",
      desc: "Evaluates your dedication, group cooperation, receptive learning, daily attendance, and overall alignment with yogic discipline.",
    },
  ];

  return (
    <section
      id="exam"
      className="py-20 sm:py-28 bg-white border-b border-ink/5"
    >
      <Container size="xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          {/* Left: Certification Card */}
          <div className="lg:col-span-6 lg:order-last">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              variants={fadeUp}
              className="bg-ink text-white rounded-3xl p-8 sm:p-10 border border-white/10 shadow-card relative overflow-hidden"
            >
              {/* Decorative radial blur */}
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

              <span className="type-eyebrow text-accent font-semibold block mb-2 tracking-widest">
                GRADUATION & CREDENTIALS
              </span>
              <h3 className="type-h3 text-white mb-6 leading-tight">
                Global Recognition &amp; Registered Yoga Teacher (RYT) Status
              </h3>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed font-sans mb-8">
                Upon successful completion of all evaluation processes, you will
                be awarded the official graduation certificate from Nirvana Yoga
                School. As a registered school (RYS) with Yoga Alliance USA,
                this certificate qualifies you to register as a Registered Yoga
                Teacher (RYT), allowing you to teach in studios, ashrams, and
                retreats worldwide.
              </p>

              <div className="border-t border-white/10 pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                    <Check size={12} className="stroke-[3]" />
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    Yoga Alliance USA Accredited Certificate
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                    <Check size={12} className="stroke-[3]" />
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    Qualified to Teach Internationally
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Steps description */}
          <div className="lg:col-span-6 space-y-8">
            <SectionHeader
              eyebrow="Evaluation"
              title={
                <>
                  Exam &amp;{" "}
                  <span className="text-primary italic">Certification</span>{" "}
                  Process
                </>
              }
              align="left"
            />
            <p className="type-body text-muted leading-relaxed font-sans text-base sm:text-lg">
              We focus on standard parameters to assess your transition from
              student to teacher. The evaluation is less about being perfect and
              more about how deeply the teachings have integrated into your
              life, body, and breath.
            </p>

            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-serif text-sm font-semibold select-none">
                    0{index + 1}
                  </span>
                  <div className="space-y-1">
                    <h4 className="type-display-sm font-semibold text-ink">
                      {step.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted leading-relaxed font-sans">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
