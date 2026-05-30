"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "@/icons";
import {
  cardHoverShadow,
  cardRestShadow,
  EASE_OUT,
  reducedTransition,
  VIEWPORT_ONCE,
} from "@/lib/motion";
import Button from "./Button";

export type CourseCardProps = {
  title: string;
  duration: string;
  level: string;
  certification: string;
  fee: string;
  image: string;
  certBadge: string;
  href: string;
  revealDelay?: number;
};

const cardVariants = {
  rest: { y: 0, boxShadow: cardRestShadow },
  hover: {
    y: -8,
    boxShadow: cardHoverShadow,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

const shineVariants = {
  rest: { x: "-130%", opacity: 0 },
  hover: {
    x: "130%",
    opacity: 1,
    transition: { duration: 0.9, ease: EASE_OUT },
  },
};

const imageVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.85, ease: EASE_OUT },
  },
};

const metaRevealVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
  },
};

const metaRowVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};

function hourLabel(title: string) {
  const match = title.match(/^(\d+\s+Hour)/i);
  return match?.[1] ?? null;
}

function certShort(certification: string) {
  return certification.split(",")[0]?.trim() ?? certification;
}

function MetaRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      className={`flex items-center justify-between gap-4 px-4 py-3 ${
        accent ? "bg-primary/6" : "bg-white even:bg-sand/40"
      }`}
      variants={metaRowVariants}
    >
      <span
        className={`type-eyebrow shrink-0 tracking-[0.14em] ${
          accent ? "text-primary/70" : "text-muted"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-right leading-snug ${
          accent
            ? "font-serif text-lg font-medium text-primary"
            : "type-ui text-ink/90"
        }`}
      >
        {value}
      </span>
    </motion.div>
  );
}

export default function CourseCard({
  title,
  duration,
  level,
  certification,
  fee,
  image,
  certBadge,
  href,
  revealDelay = 0,
}: CourseCardProps) {
  const reducedMotion = useReducedMotion();
  const prefersReduced = reducedMotion ?? false;
  const hours = hourLabel(title);

  const meta = [
    { label: "Duration", value: duration },
    { label: "Level", value: level },
    { label: "Certification", value: certification },
    { label: "Fee", value: fee, accent: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={reducedTransition(prefersReduced, {
        duration: 0.7,
        delay: revealDelay / 1000,
        ease: EASE_OUT,
      })}
    >
      <motion.article
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white"
        variants={cardVariants}
        initial="rest"
        animate="rest"
        whileHover={prefersReduced ? undefined : "hover"}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background:
              "linear-gradient(110deg, transparent 38%, rgb(255 255 255 / 0.28) 50%, transparent 62%)",
          }}
          variants={shineVariants}
          aria-hidden="true"
        />

        <div className="relative aspect-[3/2] overflow-hidden">
          <motion.div className="absolute inset-0" variants={imageVariants}>
            <Image
              src={image}
              alt={title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </motion.div>

          <div
            className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/25 to-ink/10"
            aria-hidden="true"
          />

          {hours && (
            <div className="type-eyebrow absolute top-4 left-4 rounded-full bg-primary px-3.5 py-1.5 text-white shadow-lg shadow-primary/30">
              {hours}
            </div>
          )}

          <motion.div
            className="absolute top-4 right-4"
            initial={{ opacity: 0, scale: 0.75, rotate: -8 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={VIEWPORT_ONCE}
            transition={reducedTransition(prefersReduced, {
              type: "spring",
              stiffness: 280,
              damping: 18,
              delay: revealDelay / 1000 + 0.15,
            })}
          >
            <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-white/90 shadow-lg">
              <Image
                src={certBadge}
                alt={certification}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
          </motion.div>

          <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
            <div className="hero-glass inline-flex flex-col rounded-2xl px-4 py-2.5">
              <span className="type-eyebrow text-white/60">
                Residential · All-inclusive
              </span>
              <span className="font-serif text-2xl leading-none text-white">
                {fee}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 md:p-6">
          <p className="type-eyebrow text-accent">
            {certShort(certification)} · Yoga Alliance
          </p>

          <h3 className="type-display-sm mt-2 line-clamp-3 text-ink transition-colors duration-300 group-hover:text-primary">
            {title}
          </h3>

          <motion.div
            className="mt-5 overflow-hidden rounded-2xl border border-ink/8"
            variants={metaRevealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
          >
            {meta.map((row) => (
              <MetaRow
                key={row.label}
                label={row.label}
                value={row.value}
                accent={row.accent}
              />
            ))}
          </motion.div>

          <motion.div
            className="mt-5"
            whileHover={prefersReduced ? undefined : { y: -2 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <Button
              href={href}
              variant="primary"
              size="sm"
              className="w-full shadow-primary/25 group/btn hover:shadow-lg hover:shadow-primary/30"
              target="_blank"
              rel="noopener noreferrer"
            >
              Course Details
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover/btn:translate-x-1"
              />
            </Button>
          </motion.div>
        </div>
      </motion.article>
    </motion.div>
  );
}
