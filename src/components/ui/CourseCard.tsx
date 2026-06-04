"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "@/icons";
import { EASE_OUT } from "@/lib/motion";

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
  className?: string;
  highlights?: string[];
};

const cardVariants = {
  hidden: ({ prefersReduced }: { prefersReduced: boolean }) => ({
    opacity: 0,
    y: prefersReduced ? 0 : 30,
    scale: prefersReduced ? 1 : 0.98,
    boxShadow:
      "0 2px 8px -2px rgba(26, 20, 16, 0.08), 0 12px 32px -8px rgba(26, 20, 16, 0.12)",
  }),
  visible: ({
    delay,
    prefersReduced,
  }: {
    delay: number;
    prefersReduced: boolean;
  }) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    boxShadow:
      "0 2px 8px -2px rgba(26, 20, 16, 0.08), 0 12px 32px -8px rgba(26, 20, 16, 0.12)",
    transition: prefersReduced
      ? { duration: 0.3 }
      : {
          type: "spring" as const,
          stiffness: 80,
          damping: 16,
          mass: 0.9,
          delay: delay,
        },
  }),
  hover: ({ prefersReduced }: { prefersReduced: boolean }) =>
    prefersReduced
      ? {}
      : {
          y: -3,
          boxShadow:
            "0 20px 40px -12px rgba(26, 20, 16, 0.16), 0 0 0 1px rgba(26, 20, 16, 0.04)",
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
  className = "",
  highlights = [],
}: CourseCardProps) {
  const reducedMotion = useReducedMotion();
  const prefersReduced = reducedMotion ?? false;
  const hours = hourLabel(title);

  return (
    <motion.div
      custom={{ delay: revealDelay / 1000, prefersReduced }}
      initial="hidden"
      whileInView="visible"
      whileHover={prefersReduced ? undefined : "hover"}
      viewport={{ once: true, margin: "-40px" }}
      variants={cardVariants}
      className={`${className} group relative flex flex-col h-full bg-white border border-ink/5 p-4 sm:p-5 hover:border-primary/15 transition-all duration-300`}
      style={{
        borderTopLeftRadius: "3.5rem",
        borderBottomRightRadius: "3.5rem",
        borderTopRightRadius: "1rem",
        borderBottomLeftRadius: "1rem",
      }}
    >
      {/* Gallery Print Styled Image Frame with Asymmetrical Leaf Curves */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden mb-5 bg-sand"
        style={{
          borderTopLeftRadius: "2.75rem",
          borderBottomRightRadius: "2.75rem",
          borderTopRightRadius: "0.75rem",
          borderBottomLeftRadius: "0.75rem",
        }}
      >
        {/* Subtle vignette/gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-85 z-10 pointer-events-none" />

        {/* Image */}
        <div className="w-full h-full relative">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority={revealDelay === 0}
          />
        </div>

        {/* Hours Pill (Top-Left) */}
        {hours && (
          <span className="absolute top-3.5 left-3.5 z-20 backdrop-blur-md bg-white/95 text-primary border border-primary/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-xs">
            {hours}
          </span>
        )}

        {/* Certification Logo Badge (Top-Right) */}
        <div className="absolute top-3.5 right-3.5 z-20 h-11 w-11 rounded-full bg-white p-1 border border-ink/5 shadow-md flex items-center justify-center pointer-events-none select-none">
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src={certBadge}
              alt={certification}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
        </div>

        {/* Fee tag (Bottom-Left) */}
        <span className="absolute bottom-3.5 left-3.5 z-20 backdrop-blur-md bg-secondary/90 text-sand text-[11px] px-3.5 py-1.5 rounded-full border border-secondary/20 shadow-xs font-semibold tracking-wide">
          {fee}
        </span>
      </div>

      {/* Text Content */}
      <div className="flex flex-col flex-1 px-1">
        {/* Eyebrow */}
        <div className="type-eyebrow text-accent font-semibold tracking-widest text-[#0e4956] mb-1.5">
          {certShort(certification)} · YOGA ALLIANCE
        </div>

        {/* Title */}
        <h3 className="font-serif text-lg sm:text-xl font-medium mt-1 mb-3 text-ink group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Metadata split - Hotel Menu Style */}
        <div className="flex items-center justify-between border-t border-b border-ink/5 py-3 my-3 select-none">
          <div className="flex-1 text-center border-r border-ink/5">
            <span className="block type-eyebrow text-muted text-[8px] tracking-wider mb-0.5">
              Duration
            </span>
            <span className="font-sans text-xs font-bold text-ink/90">
              {duration}
            </span>
          </div>
          <div className="flex-1 text-center">
            <span className="block type-eyebrow text-muted text-[8px] tracking-wider mb-0.5">
              Level
            </span>
            <span className="font-sans text-xs font-bold text-ink/90">
              {level}
            </span>
          </div>
        </div>

        {/* Curriculum highlights grid (Stable size) */}
        {highlights.length > 0 && (
          <div className="mb-4 flex-grow">
            <span className="block type-eyebrow text-muted text-[8px] tracking-wider mb-2">
              Key Focus Areas
            </span>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-2 mt-1">
              {highlights.slice(0, 4).map((hl) => (
                <li
                  key={hl}
                  className="flex items-start gap-1.5 text-[11px] sm:text-xs text-ink/80 font-medium leading-tight"
                >
                  <Check
                    size={11}
                    strokeWidth={3.5}
                    className="text-accent shrink-0 mt-0.5"
                  />
                  <span className="line-clamp-2">{hl}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bottom Action Footer Row */}
        <div className="mt-auto pt-3 border-t border-ink/5 flex items-center justify-between group-hover:border-t-primary/15 transition-colors duration-300">
          <span className="font-serif italic text-sm text-ink/80 group-hover:text-primary transition-colors duration-300 pb-0.5">
            Explore Syllabus & Details
          </span>
          <ArrowRight
            size={14}
            className="text-accent group-hover:text-primary transition-colors duration-300"
          />
        </div>
      </div>

      {/* Full-card Transparent Link Overlay for clean SEO and perfect clicking */}
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-30 rounded-tl-[3.5rem] rounded-br-[3.5rem] rounded-tr-2xl rounded-bl-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer"
        aria-label={`View details for ${title}`}
      />
    </motion.div>
  );
}
