"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Container, Pill } from "@/components/ui";
import { ArrowRight, Check, YogaAllianceSeal } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

const CERTS = [
  {
    hours: "200",
    label: "RYS 200",
    title: "Foundational Teacher Training",
    level: "Foundation",
    desc: "Build your teaching foundation with philosophy, anatomy, asana, pranayama & methodology.",
    points: ["Philosophy & Ethics", "Anatomy", "Pranayama", "Teaching Methods"],
    href: "https://www.nirvanayogaschoolindia.com/200-hour-yoga-teacher-training-in-rishikesh-india",
  },
  {
    hours: "300",
    label: "RYS 300",
    title: "Advanced Teacher Training",
    level: "Advanced",
    desc: "Deepen mastery with advanced sequencing, therapeutic applications, adjustments & alignment.",
    points: ["Sequencing", "Therapeutics", "Adjustments", "Mastery"],
    href: "https://www.nirvanayogaschoolindia.com/300-hour-yoga-teacher-training-in-rishikesh-india",
  },
  {
    hours: "500",
    label: "RYS 500",
    title: "Master Teacher Certification",
    level: "Master",
    desc: "The highest credential — complete RYS 200 + 300 curriculum. Teach with authority worldwide.",
    points: [
      "Full Curriculum",
      "Global Credentials",
      "Master Practice",
      "Lifetime Cert",
    ],
    href: "https://www.nirvanayogaschoolindia.com/500-hour-yoga-teacher-training-in-rishikesh-india",
  },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
} as const;

const cardPop = {
  hidden: { opacity: 0, y: 40, rotateX: 8, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 90, damping: 14 },
  },
} as const;

export default function YogaAllianceSection() {
  const _prefersReduced = useReducedMotion() ?? false;

  return (
    <section className="relative w-full overflow-hidden lg:min-h-[calc(100svh-5.5rem)] flex items-center text-white py-16 sm:py-20 lg:py-0">
      {/* ── BG ── */}
      <Image
        src="https://www.nirvanayogaschoolindia.com/img/banner.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        quality={85}
      />
      <div className="absolute inset-0 bg-ink/60" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-linear-to-br from-primary/15 via-transparent to-secondary/10"
        aria-hidden="true"
      />

      {/* Decorative mandala-like ring — top-left */}
      <div
        className="absolute -left-32 top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-dashed border-accent/[0.07] pointer-events-none hidden lg:block"
        aria-hidden="true"
      />
      <div
        className="absolute -left-28 top-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-accent/[0.05] pointer-events-none hidden lg:block"
        aria-hidden="true"
      />
      <div
        className="absolute -left-24 top-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full border border-dashed border-accent/[0.04] pointer-events-none hidden lg:block"
        aria-hidden="true"
      />

      {/* Ambient glows */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[180px] rounded-full pointer-events-none -translate-x-1/3 -translate-y-1/4"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-accent/6 blur-[140px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <Container size="2xl" className="relative z-10 w-full py-4 lg:py-8">
        {/* ═══ TOP ROW: Hero numbers + Seal ═══ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 lg:gap-8 mb-8 lg:mb-10"
        >
          {/* Left: Seal + text */}
          <div className="flex items-center gap-4 lg:gap-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.3, rotate: -30 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 60,
                damping: 10,
              }}
              className="shrink-0"
            >
              <div className="relative">
                <div className="absolute -inset-2.5 rounded-full border border-dashed border-accent/15" />
                <div className="p-3.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md ya-seal-ring">
                  <YogaAllianceSeal size={52} className="text-accent" />
                </div>
              </div>
            </motion.div>
            <div>
              <Pill
                invert
                className="!bg-white/6 !text-accent !border-white/10 backdrop-blur-sm mb-1"
              >
                Yoga Alliance USA
              </Pill>
              <p className="type-eyebrow text-sand/35 tracking-[0.25em] text-[9px]">
                Registered Yoga School · Rishikesh
              </p>
            </div>
          </div>

          {/* Center/Right: Giant hero numbers */}
          <div className="flex items-baseline gap-3 sm:gap-4 lg:gap-6">
            {["200", "300", "500"].map((n, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 80,
                  damping: 14,
                  delay: 0.15 + i * 0.1,
                }}
                className="flex items-baseline"
              >
                <span className="text-5xl sm:text-6xl lg:text-8xl font-serif font-bold leading-none bg-linear-to-b from-accent/50 to-accent/15 bg-clip-text text-transparent select-none">
                  {n}
                </span>
                {i < 2 && (
                  <span className="text-2xl sm:text-3xl lg:text-5xl text-accent/15 font-light ml-3 sm:ml-4 lg:ml-6 select-none">
                    ·
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ═══ Heading ═══ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          custom={0.1}
          className="mb-8 lg:mb-10 max-w-2xl"
        >
          <h2 className="font-serif font-medium text-[clamp(1.5rem,3.5vw,2.5rem)] leading-[1.12] text-white mb-2.5">
            Globally{" "}
            <span className="font-normal text-primary">Recognized</span> Yoga
            Certification
          </h2>
          <p className="type-body text-sand/45 leading-relaxed max-w-lg">
            Our Yoga Alliance USA credentials let you teach with confidence
            anywhere in the world. Choose your path below.
          </p>
        </motion.div>

        {/* ═══ 3 Cards ═══ */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 perspective-1000"
        >
          {CERTS.map((c, _i) => (
            <motion.div key={c.hours} variants={cardPop}>
              <Link
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ya-card group relative block overflow-hidden rounded-2xl lg:rounded-3xl backdrop-blur-md h-full"
              >
                {/* Giant bg watermark */}
                <div
                  className="absolute -right-3 -top-6 text-[8rem] lg:text-[9rem] font-serif font-bold leading-none text-white/[0.015] group-hover:text-white/[0.045] transition-all duration-700 select-none pointer-events-none"
                  aria-hidden="true"
                >
                  {c.hours}
                </div>

                {/* Top gradient accent */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-linear-to-r from-accent/40 via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Corner sparkle */}
                <div
                  className="absolute -top-8 -right-8 w-24 h-24 bg-accent/[0.04] blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  aria-hidden="true"
                />

                <div className="relative p-5 lg:p-6 flex flex-col h-full">
                  {/* Top: label + level badge */}
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <span className="type-eyebrow text-[10px] tracking-[0.25em] text-accent/55">
                      {c.label} · YOGA ALLIANCE
                    </span>
                    <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-accent bg-accent/[0.08] px-2.5 py-1 rounded-full border border-accent/12">
                      {c.level}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-lg lg:text-xl text-sand font-medium leading-snug mb-2 group-hover:text-white transition-colors duration-300">
                    {c.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[13px] text-sand/40 leading-relaxed mb-4 lg:mb-5 flex-grow">
                    {c.desc}
                  </p>

                  {/* Highlights */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-4 lg:mb-5">
                    {c.points.map((p) => (
                      <span
                        key={p}
                        className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-sand/35 font-medium"
                      >
                        <Check
                          size={8}
                          strokeWidth={4}
                          className="text-accent/45 shrink-0"
                        />
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* CTA row */}
                  <div className="flex items-center justify-between pt-3 lg:pt-4 border-t border-white/[0.06] mt-auto">
                    <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-accent/50 group-hover:text-accent transition-colors duration-300 uppercase">
                      Explore Course
                    </span>
                    <div className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/8 flex items-center justify-center group-hover:bg-accent/25 group-hover:border-accent/30 transition-all duration-300">
                      <ArrowRight
                        size={11}
                        className="text-sand/25 group-hover:text-white transition-all duration-300 group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
