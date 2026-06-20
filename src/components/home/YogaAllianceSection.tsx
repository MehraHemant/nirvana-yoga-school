"use client";

import { motion } from "framer-motion";
import { Button, Container, Pill } from "@/components/ui";
import {
  ArrowRight,
  Certificate,
  Compass,
  Leaf,
  YogaAllianceSeal,
} from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

const CERTIFICATIONS = [
  {
    hours: "200",
    title: "RYS 200 Certification",
    level: "Foundational Path",
    description:
      "Ideal for students who are new to yoga or wish to expand their knowledge of the discipline. The principles of yoga philosophy, anatomy, asana, pranayama, meditation, and teaching methodology are covered. Build a safe, effective, and confidence-driven teaching foundation.",
    href: "https://www.nirvanayogaschoolindia.com/200-hour-yoga-teacher-training-in-rishikesh-india",
    icon: Leaf,
  },
  {
    hours: "300",
    title: "RYS 300 Certification",
    level: "Advanced Training",
    description:
      "For yogis who have already completed an RYS 200 course and wish to deepen their teaching skills. This curriculum delves into advanced yoga sequencing, adjustments, therapeutic applications, and alignment, enabling you to teach with deep authority and experience.",
    href: "https://www.nirvanayogaschoolindia.com/300-hour-yoga-teacher-training-in-rishikesh-india",
    icon: Compass,
  },
  {
    hours: "500",
    title: "RYS 500 Certification",
    level: "Master Teacher Path",
    description:
      "A comprehensive combination of RYS 200 and RYS 300 courses. This course offers extensive study and practice covering beginner to advanced levels. Graduate with the highest level of yoga teacher credentials possible and be fully prepared to teach globally.",
    href: "https://www.nirvanayogaschoolindia.com/500-hour-yoga-teacher-training-in-rishikesh-india",
    icon: Certificate,
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
    <section className="relative w-full overflow-hidden bg-primary py-20 md:py-28 text-white">
      {/* Background Soft Glows & Radial Highlights */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/10 blur-[130px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-secondary/15 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-accent/8 blur-[130px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <Container size="2xl" className="relative z-10 w-full">
        {/* Header Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1.1fr] gap-8 lg:gap-16 items-start border-b border-white/10 pb-12 mb-12 lg:mb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="space-y-5"
          >
            {/* Pill & Subtitle */}
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

            {/* Main Title */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.1] text-sand">
              Yoga Alliance Certification — Globally Recognized Credentials
            </h2>

            {/* Seal Ring Panel */}
            <div className="flex items-center gap-4 pt-2 bg-white/5 border border-white/10 rounded-2xl p-4 w-fit backdrop-blur-md shadow-lg">
              <div className="relative w-14 h-14 bg-white rounded-full flex items-center justify-center p-2 shadow-md">
                <YogaAllianceSeal className="text-primary w-10 h-10" />
              </div>
              <div>
                <p className="type-eyebrow text-accent tracking-widest text-[9px] mb-0.5">
                  Official Standards
                </p>
                <p className="type-ui text-sand font-semibold text-xs sm:text-sm">
                  RYS 200 • RYS 300 • RYS 500 Registered
                </p>
              </div>
            </div>
          </motion.div>

          {/* Description Column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            custom={0.12}
            variants={fadeUp}
            className="space-y-4 lg:pt-4"
          >
            <p className="type-lead text-accent font-light leading-relaxed text-sm sm:text-base md:text-lg">
              Nirvana Yoga School is a registered yoga school (RYS 200, 300,
              500) situated in Rishikesh, certified by Yoga Alliance USA.
            </p>
            <p className="type-body text-sand/80 leading-relaxed text-xs sm:text-sm">
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
          {CERTIFICATIONS.map((cert) => {
            const WatermarkIcon = cert.icon;
            return (
              <motion.div
                key={cert.hours}
                variants={cardVariants}
                className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6 lg:p-8 flex flex-col justify-between min-h-[360px] hover:bg-white/10 hover:border-accent/30 hover:-translate-y-2 transition-all duration-500 hover:shadow-soft"
              >
                {/* Ambient light reflection overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-tr from-accent/0 via-accent/5 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
                  aria-hidden="true"
                />

                {/* Giant background hour numeral watermark */}
                <div
                  className="absolute -right-2 top-0 select-none text-[8.5rem] sm:text-[9.5rem] font-serif font-bold text-accent/5 pointer-events-none leading-none z-0"
                  aria-hidden="true"
                >
                  {cert.hours}
                </div>

                {/* Faint watermark outline icon */}
                <div className="absolute -left-6 -bottom-6 w-32 h-32 text-accent/4 pointer-events-none z-0">
                  <WatermarkIcon className="w-full h-full object-contain" />
                </div>

                {/* Card Top Row details */}
                <div className="relative z-10">
                  <div className="flex items-baseline justify-between mb-4 lg:mb-6">
                    <span className="type-eyebrow text-accent bg-accent/10 border border-accent/25 rounded-full px-3 py-1 text-[10px] uppercase font-bold tracking-wider">
                      {cert.level}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-sand font-medium mb-3 mt-4">
                    {cert.title}
                  </h3>

                  <p className="type-body text-sand/80 leading-relaxed mb-6 text-sm">
                    {cert.description}
                  </p>
                </div>

                {/* Card Bottom CTA Button */}
                <div className="relative z-10">
                  <Button
                    href={cert.href}
                    variant="outline-light"
                    size="md"
                    responsive
                    className="w-full justify-between group/btn border-white/20 hover:border-accent hover:bg-accent hover:text-ink transition-all duration-300"
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
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
