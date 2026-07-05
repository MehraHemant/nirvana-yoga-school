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
  description?: string;
  revealDelay?: number;
  className?: string;
  highlights?: string[];
  index?: number;
  layout?: "stacked" | "editorial";
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

function extractHours(title: string) {
  const match = title.match(/\b(\d+\s*Hour(?:s)?)\b/i);
  return match?.[1] ?? null;
}

function MetaPills({
  duration,
  level,
  fee,
}: Pick<CourseCardProps, "duration" | "level" | "fee">) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="rounded-full border border-ink/10 bg-white px-3 py-1 type-ui text-ink/85">
        {duration}
      </span>
      <span className="rounded-full border border-ink/10 bg-white px-3 py-1 type-ui text-ink/85">
        {level}
      </span>
      <span className="rounded-full border border-primary/15 bg-primary/8 px-3 py-1 type-ui font-semibold text-primary">
        {fee}
      </span>
    </div>
  );
}

function FocusList({ highlights }: { highlights: string[] }) {
  if (highlights.length === 0) return null;

  return (
    <ul className="space-y-2.5">
      {highlights.slice(0, 4).map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Check size={11} strokeWidth={3} className="text-primary" />
          </span>
          <span className="type-body text-sm leading-snug text-ink/80">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CourseCardImage({
  title,
  image,
  certBadge,
  certification,
  fee,
  hours,
  revealDelay,
  prefersReduced,
  editorial,
}: {
  title: string;
  image: string;
  certBadge: string;
  certification: string;
  fee: string;
  hours: string | null;
  revealDelay: number;
  prefersReduced: boolean;
  editorial: boolean;
}) {
  return (
    <div
      className={
        editorial
          ? "relative w-full shrink-0 md:w-[40%] lg:w-[38%]"
          : "relative aspect-[16/10] w-full shrink-0 p-4"
      }
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className={
          editorial
            ? "relative aspect-[4/3] h-full min-h-[220px] overflow-hidden p-4 md:absolute md:inset-0 md:aspect-auto md:min-h-0 md:p-5"
            : "relative h-full w-full overflow-hidden rounded-xl"
        }
      >
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
          <Image
            src={image}
            alt={title}
            fill
            sizes={
              editorial
                ? "(max-width: 768px) 100vw, 40vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={revealDelay === 0}
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-ink/35 via-transparent to-transparent"
            aria-hidden="true"
          />
        </div>

        {hours ? (
          <span
            className="absolute left-7 top-7 z-20 rounded-full bg-primary px-3 py-1 type-eyebrow font-bold text-white shadow-sm sm:left-8 sm:top-8"
            style={{
              transform: prefersReduced ? "none" : "translateZ(15px)",
            }}
          >
            {hours}
          </span>
        ) : null}

        <div
          className="absolute right-7 top-7 z-20 flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/90 p-1 shadow-sm backdrop-blur-xs sm:right-8 sm:top-8"
          style={{
            transform: prefersReduced ? "none" : "translateZ(15px)",
          }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-full">
            <Image
              src={certBadge}
              alt={certification}
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
        </div>

        {!editorial ? (
          <span
            className="absolute bottom-7 left-7 z-20 rounded-full border border-secondary/20 bg-secondary/80 px-3.5 py-1.5 text-[10px] font-semibold tracking-wide text-sand shadow-xs backdrop-blur-md sm:bottom-8 sm:left-8 sm:text-[11px]"
            style={{
              transform: prefersReduced ? "none" : "translateZ(15px)",
            }}
          >
            {fee}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function CourseCardBody({
  title,
  duration,
  level,
  certification,
  fee,
  description,
  highlights,
  editorial,
}: Pick<
  CourseCardProps,
  | "title"
  | "duration"
  | "level"
  | "certification"
  | "fee"
  | "description"
  | "highlights"
  | "layout"
> & { editorial: boolean }) {
  const items = highlights ?? [];

  return (
    <div
      className={
        editorial
          ? "flex flex-1 flex-col px-5 pb-5 pt-4 md:px-6 md:py-6"
          : "flex flex-1 flex-col px-5 pb-2 pt-1"
      }
    >
      <div className="type-eyebrow text-secondary">
        {certShort(certification)} · Yoga Alliance
      </div>

      <h3 className="type-display-sm mt-2 line-clamp-2 font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-primary">
        {title}
      </h3>

      {description ? (
        <p className="type-body mt-3 line-clamp-3 text-muted leading-relaxed">
          {description}
        </p>
      ) : null}

      <div className={description ? "mt-4" : "mt-3"}>
        <MetaPills duration={duration} level={level} fee={fee} />
      </div>

      {items.length > 0 ? (
        <div className="mt-5 flex-grow">
          <p className="type-eyebrow mb-3 text-muted">What you&apos;ll learn</p>
          {editorial ? (
            <FocusList highlights={items} />
          ) : (
            <div className="flex flex-wrap gap-2">
              {items.slice(0, 4).map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-ink/8 bg-white px-3 py-1.5 text-xs font-medium text-ink/80"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
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
  description,
  revealDelay = 0,
  className = "",
  highlights = [],
  layout = "stacked",
}: CourseCardProps) {
  const [mounted, setMounted] = useState(false);
  const reducedMotion = useReducedMotion();
  const prefersReduced = reducedMotion ?? false;
  const editorial = layout === "editorial";
  const hours = extractHours(title);
  const isExternal = href.startsWith("http");

  useEffect(() => {
    setMounted(true);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-3, 3]);
  const springConfig = { damping: 25, stiffness: 180, mass: 0.5 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);
  const shineX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const shineY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);
  const shineBg = useMotionTemplate`radial-gradient(circle 200px at ${shineX} ${shineY}, rgba(255, 255, 255, 0.2), transparent 80%)`;

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="perspective-1000 h-full w-full">
      <motion.div
        custom={{ prefersReduced }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={cardVariants}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`${className} group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink/5 bg-sand shadow-card course-card-transition hover:border-primary/30 hover:shadow-[0_30px_60px_-15px_rgba(163,36,50,0.16)] hover:ring-1 hover:ring-primary/20`}
        style={{
          rotateX: prefersReduced ? 0 : rotateXSpring,
          rotateY: prefersReduced ? 0 : rotateYSpring,
          transformStyle: "preserve-3d",
        }}
      >
        {mounted && !prefersReduced ? (
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: shineBg }}
          />
        ) : null}

        <div
          className={
            editorial
              ? "flex min-h-0 flex-1 flex-col md:flex-row"
              : "flex min-h-0 flex-1 flex-col"
          }
          style={{
            transform: prefersReduced ? "none" : "translateZ(20px)",
            transformStyle: "preserve-3d",
          }}
        >
          <CourseCardImage
            title={title}
            image={image}
            certBadge={certBadge}
            certification={certification}
            fee={fee}
            hours={hours}
            revealDelay={revealDelay}
            prefersReduced={prefersReduced}
            editorial={editorial}
          />
          <CourseCardBody
            title={title}
            duration={duration}
            level={level}
            certification={certification}
            fee={fee}
            description={description}
            highlights={highlights}
            layout={layout}
            editorial={editorial}
          />
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-ink/5 p-4 transition-colors duration-300 group-hover:border-t-primary/15 group-hover:bg-primary">
          <span className="pb-0.5 font-serif text-sm font-medium tracking-wider text-ink/80 transition-colors duration-300 group-hover:text-white">
            View course details
          </span>
          <ArrowRight
            size={14}
            className="text-accent transition-colors duration-300 group-hover:text-white"
          />
        </div>

        <Link
          href={href}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="absolute inset-0 z-40 cursor-pointer rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label={`View details for ${title}`}
        />
      </motion.div>
    </div>
  );
}
