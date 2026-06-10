"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { ArrowRight, Check } from "@/icons";

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
  index?: number;
};

const cardVariants = {
  hidden: ({ prefersReduced }: { prefersReduced: boolean }) => ({
    opacity: 0,
    y: prefersReduced ? 0 : 35,
    scale: prefersReduced ? 1 : 0.99,
  }),
  visible: ({ prefersReduced }: { prefersReduced: boolean }) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: prefersReduced
      ? { duration: 0.3 }
      : {
          type: "spring" as const,
          stiffness: 80,
          damping: 16,
          mass: 0.9,
        },
  }),
};

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
  const [mounted, setMounted] = useState(false);
  const reducedMotion = useReducedMotion();
  const prefersReduced = reducedMotion ?? false;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parallax 3D tilt tracking variables
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Map mouse coordinate to rotate limits (-8 to 8 degrees for natural tilt)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-3, 3]);

  // Spring animation parameters for smooth fluid rotations
  const springConfig = { damping: 25, stiffness: 180, mass: 0.5 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  // Mouse coordinate mapping for the radial glossy reflection/shine overlay
  const shineX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const shineY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  // Create a template string for dynamic inline background gradient
  const shineBg = useMotionTemplate`radial-gradient(circle 200px at ${shineX} ${shineY}, rgba(255, 255, 255, 0.2), transparent 80%)`;

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Normalizing coordinates from -0.5 to 0.5
    mouseX.set(x / width - 0.5);
    mouseY.set(y / height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="perspective-1000 w-full h-full">
      <motion.div
        custom={{ prefersReduced }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={cardVariants}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`${className} group relative flex flex-col h-full bg-white border border-ink/5 p-5 rounded-3xl course-card-transition shadow-card hover:border-primary/30 hover:ring-1 hover:ring-primary/20 hover:shadow-[0_30px_60px_-15px_rgba(163,36,50,0.16)]`}
        style={{
          rotateX: prefersReduced ? 0 : rotateXSpring,
          rotateY: prefersReduced ? 0 : rotateYSpring,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Glossy specular reflection overlay that follows cursor on hover */}
        {mounted && !prefersReduced && (
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl z-30"
            style={{ background: shineBg }}
          />
        )}

        {/* Course image container with transformZ for a layers/depth pop out */}
        <div
          className="relative aspect-[16/10] w-full overflow-hidden mb-5 rounded-2xl border border-ink/5 bg-sand"
          style={{
            transform: prefersReduced ? "none" : "translateZ(30px)",
            transformStyle: "preserve-3d",
          }}
        >
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={revealDelay === 0}
          />

          {/* Floating Certification Seal Logo (Top-Right) */}
          <div
            className="absolute top-3.5 right-3.5 z-30 h-10 w-10 rounded-full bg-white/90 p-1 border border-white/20 shadow-sm flex items-center justify-center pointer-events-none select-none backdrop-blur-xs"
            style={{
              transform: prefersReduced ? "none" : "translateZ(15px)",
            }}
          >
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src={certBadge}
                alt={certification}
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Floating Glassmorphic Fee Tag (Bottom-Left) */}
          <span
            className="absolute bottom-3.5 left-3.5 z-30 backdrop-blur-md bg-secondary/80 text-sand text-[10px] sm:text-[11px] px-3.5 py-1.5 rounded-full border border-secondary/20 shadow-xs font-semibold tracking-wide select-none"
            style={{
              transform: prefersReduced ? "none" : "translateZ(15px)",
            }}
          >
            {fee}
          </span>
        </div>

        {/* Content section with translateZ for layered parallax */}
        <div
          className="flex flex-col flex-1 px-1"
          style={{
            transform: prefersReduced ? "none" : "translateZ(20px)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Eyebrow */}
          <div className="type-eyebrow text-accent font-semibold tracking-widest text-secondary mb-1.5">
            {certShort(certification)} · YOGA ALLIANCE
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg sm:text-xl font-bold mt-1 mb-3 text-ink group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-snug">
            {title}
          </h3>

          {/* Core specs table - Clean details */}
          <div className="grid grid-cols-2 gap-4 border-t border-b border-ink/5 py-3.5 my-3.5 text-left select-none">
            <div>
              <span className="block type-eyebrow text-muted text-[8px] tracking-wider mb-0.5">
                Duration
              </span>
              <span className="font-sans text-xs font-bold text-ink/90">
                {duration}
              </span>
            </div>
            <div>
              <span className="block type-eyebrow text-muted text-[8px] tracking-wider mb-0.5">
                Level
              </span>
              <span className="font-sans text-xs font-bold text-ink/90">
                {level}
              </span>
            </div>
          </div>

          {/* Curriculum highlights list - Added back for details */}
          {highlights.length > 0 && (
            <div className="mb-5 flex-grow text-left">
              <span className="block type-eyebrow text-muted text-[8px] tracking-wider mb-2 select-none">
                Course Focus Areas
              </span>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
                {highlights.slice(0, 4).map((hl) => (
                  <li
                    key={hl}
                    className="flex items-start gap-1.5 text-[11px] sm:text-xs text-ink/80 font-medium leading-tight select-none"
                  >
                    <Check
                      size={11}
                      strokeWidth={3.5}
                      className="text-primary shrink-0 mt-0.5"
                    />
                    <span className="line-clamp-2">{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom CTA Link */}
          <div className="mt-auto pt-4 border-t border-ink/5 flex items-center justify-between group-hover:border-t-primary/15 transition-colors duration-300">
            <span className="font-serif italic text-sm text-ink/80 group-hover:text-primary transition-colors duration-300 pb-0.5">
              Explore Syllabus & Details
            </span>
            <ArrowRight
              size={14}
              className="text-accent group-hover:text-primary transition-colors duration-300"
            />
          </div>
        </div>

        {/* Card clickable anchor overlay */}
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-30 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer"
          aria-label={`View details for ${title}`}
        />
      </motion.div>
    </div>
  );
}
