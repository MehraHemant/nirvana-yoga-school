"use client";

import { motion } from "framer-motion";
import { Button, Container, Pill } from "@/components/ui";
import { ArrowRight, YogaAllianceSeal } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

const CERTIFICATIONS = [
  {
    hours: "200",
    title: "RYS 200 Certification",
    level: "Foundational Path",
    description:
      "Ideal for students who are new to yoga or wish to expand their knowledge of the discipline. The principles of yoga philosophy, anatomy, asana, pranayama, meditation, and teaching methodology are covered. Build a safe, effective, and confidence-driven teaching foundation.",
    href: "https://www.nirvanayogaschoolindia.com/200-hour-yoga-teacher-training-in-rishikesh-india",
  },
  {
    hours: "300",
    title: "RYS 300 Certification",
    level: "Advanced Training",
    description:
      "For yogis who have already completed an RYS 200 course and wish to deepen their teaching skills. This curriculum delves into advanced yoga sequencing, adjustments, therapeutic applications, and alignment, enabling you to teach with deep authority and experience.",
    href: "https://www.nirvanayogaschoolindia.com/300-hour-yoga-teacher-training-in-rishikesh-india",
  },
  {
    hours: "500",
    title: "RYS 500 Certification",
    level: "Master Teacher Path",
    description:
      "A comprehensive combination of RYS 200 and RYS 300 courses. This course offers extensive study and practice covering beginner to advanced levels. Graduate with the highest level of yoga teacher credentials possible and be fully prepared to teach globally.",
    href: "https://www.nirvanayogaschoolindia.com/500-hour-yoga-teacher-training-in-rishikesh-india",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 20,
    },
  },
} as const;

export default function YogaAllianceSection() {
  return (
    <section className="relative w-full overflow-hidden bg-linear-to-br from-primary to-primary-dark py-16 md:py-20 lg:py-0 lg:min-h-screen lg:flex lg:items-center text-white">
      {/* Background Soft Glow / Radial highlights */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-accent/8 blur-[130px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <Container size="2xl" className="relative z-10 w-full">
        {/* Header split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 lg:gap-16 items-end border-b border-white/10 pb-8 mb-10 lg:mb-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <Pill
                invert
                className="!bg-white/10 !text-accent !border-white/10"
              >
                Yoga Alliance USA
              </Pill>
              <span className="type-eyebrow text-accent tracking-widest text-[10px] sm:text-xs">
                Globally Accredited RYS
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-medium leading-[1.1] text-sand">
              Yoga Alliance Certification – Globally Recognized Yoga Training
            </h2>
            <div className="flex items-center gap-4 pt-1">
              <YogaAllianceSeal size={56} className="text-accent shrink-0" />
              <div>
                <p className="type-eyebrow text-accent tracking-wider mb-0.5 text-[9px] sm:text-[10px]">
                  Certified Standards
                </p>
                <p className="type-ui text-sand font-medium text-xs sm:text-sm">
                  RYS 200 · RYS 300 · RYS 500
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            custom={0.12}
            variants={fadeUp}
            className="space-y-3"
          >
            <p className="type-lead text-sand font-light leading-relaxed text-sm sm:text-base md:text-lg">
              Nirvana Yoga School is a registered yoga school (RYS 200, 300,
              500) situated in Rishikesh, certified by Yoga Alliance USA.
            </p>
            <p className="type-body text-sand/90 leading-relaxed text-xs sm:text-sm">
              Our credentials allow you to teach yoga with confidence anywhere
              in the world. Each curriculum is designed carefully with proper
              traditional knowledge, safety standards, and personal
              transformation. Here, certification is more than just paper—you
              truly live and become a yogi.
            </p>
          </motion.div>
        </div>

        {/* Certification Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {CERTIFICATIONS.map((cert) => (
            <motion.div
              key={cert.hours}
              variants={cardVariants}
              className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/8 p-6 lg:p-8 flex flex-col justify-between hover:bg-white/10 hover:border-white/15 transition-all duration-500 hover:shadow-soft"
            >
              {/* Card top border active color strip */}
              <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-accent/50 to-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div>
                <div className="flex items-baseline justify-between mb-4 lg:mb-6">
                  <span className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-accent/40 group-hover:text-accent/65 transition-colors duration-500">
                    {cert.hours}
                  </span>
                  <span className="type-eyebrow text-accent bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5 text-[9px]">
                    {cert.level}
                  </span>
                </div>

                <h3 className="font-serif text-lg sm:text-xl lg:text-2xl text-sand font-medium mb-2 lg:mb-3">
                  {cert.title}
                </h3>

                <p className="type-body text-sand/90 leading-relaxed mb-6 lg:mb-8 text-xs sm:text-sm">
                  {cert.description}
                </p>
              </div>

              <div>
                <Button
                  href={cert.href}
                  variant="outline-light"
                  size="md"
                  responsive
                  className="w-full justify-between group/btn"
                >
                  <span className="flex items-center gap-2">
                    Course Details
                  </span>
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover/btn:translate-x-1"
                  />
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
