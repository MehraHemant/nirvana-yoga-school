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
  /**
   * `stacked` — home grid cards (sand surface).
   * `editorial` — legacy horizontal hub cards.
   * `hub` — YTT + online hub cards; same 16:10 image as stacked, white surface.
   */
  layout?: "stacked" | "editorial" | "hub";
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

/**
 * Shortens certification copy for the card eyebrow.
 *
 * @param certification - Full certification string from CMS
 */
function certShort(certification: string) {
  return certification.split(",")[0]?.trim() ?? certification;
}

/**
 * Pulls an hours phrase from the course title when present.
 *
 * @param title - Course title
 */
function extractHours(title: string) {
  const match = title.match(/\b(\d+\s*Hour(?:s)?)\b/i);
  return match?.[1] ?? null;
}

/**
 * Duration / level / fee chips. Hub uses a denser compact variant.
 *
 * @param props - Meta strings and optional compact density
 */
function MetaPills({
  duration,
  level,
  fee,
  compact = false,
}: Pick<CourseCardProps, "duration" | "level" | "fee"> & {
  compact?: boolean;
}) {
  const chip = compact
    ? "rounded-full border px-2 py-0.5 text-[11px] leading-tight tracking-wide"
    : "rounded-full border px-3 py-1 type-ui";

  return (
    <div className={compact ? "flex flex-wrap gap-1.5" : "flex flex-wrap gap-2"}>
      <span className={`${chip} border-ink/10 bg-white text-ink/85`}>
        {duration}
      </span>
      <span className={`${chip} border-ink/10 bg-white text-ink/85`}>
        {level}
      </span>
      <span
        className={`${chip} border-primary/15 bg-primary/8 font-semibold text-primary`}
      >
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

/**
 * Course card media with chrome inset. Padding is applied via absolute inset
 * (not aspect-ratio + padding on one box) so the photo fills the frame with no gaps.
 * Hub keeps the same 16:10 ratio with a tighter inset so the image block reads smaller in denser grids.
 *
 * @param props - Image, badges, fee overlay, and layout mode
 */
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
  hub,
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
  hub: boolean;
}) {
  const frameClass = editorial
    ? "absolute inset-4 overflow-hidden rounded-2xl md:inset-5"
    : hub
      ? "absolute inset-2.5 overflow-hidden rounded-xl sm:inset-3"
      : "absolute inset-4 overflow-hidden rounded-2xl";

  const badgePad = hub
    ? "left-2 top-2 sm:left-2.5 sm:top-2.5"
    : "left-3 top-3 sm:left-3.5 sm:top-3.5";
  const certPad = hub
    ? "right-2 top-2 sm:right-2.5 sm:top-2.5"
    : "right-3 top-3 sm:right-3.5 sm:top-3.5";
  const feePad = hub
    ? "bottom-2 left-2 sm:bottom-2.5 sm:left-2.5"
    : "bottom-3 left-3 sm:bottom-3.5 sm:left-3.5";

  return (
    <div
      className={
        editorial
          ? "relative w-full shrink-0 md:w-[40%] lg:w-[38%]"
          : "relative aspect-[16/10] w-full shrink-0"
      }
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className={
          editorial
            ? "relative aspect-[4/3] min-h-[220px] md:absolute md:inset-0 md:aspect-auto md:min-h-0"
            : "absolute inset-0"
        }
      >
        <div className={frameClass}>
          <Image
            src={image}
            alt={title}
            fill
            sizes={
              editorial
                ? "(max-width: 768px) 100vw, 40vw"
                : hub
                  ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            priority={revealDelay === 0}
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-ink/35 via-transparent to-transparent"
            aria-hidden="true"
          />

          {hours ? (
            <span
              className={`absolute z-20 rounded-full bg-primary font-bold text-white shadow-sm ${badgePad} ${
                hub
                  ? "px-2 py-0.5 text-[9px] tracking-wide"
                  : "px-3 py-1 type-eyebrow"
              }`}
              style={{
                transform: prefersReduced ? "none" : "translateZ(15px)",
              }}
            >
              {hours}
            </span>
          ) : null}

          {certBadge ? (
            <div
              className={`absolute z-20 flex items-center justify-center rounded-full border border-white/20 bg-white/90 shadow-sm backdrop-blur-xs ${certPad} ${
                hub ? "size-8 p-0.5" : "size-10 p-1"
              }`}
              style={{
                transform: prefersReduced ? "none" : "translateZ(15px)",
              }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image
                  src={certBadge}
                  alt={certification}
                  fill
                  sizes={hub ? "28px" : "36px"}
                  className="object-cover"
                />
              </div>
            </div>
          ) : null}

          {!editorial ? (
            <span
              className={`absolute z-20 rounded-full border border-primary/20 bg-primary/80 font-semibold tracking-wide text-white shadow-xs backdrop-blur-md ${feePad} ${
                hub
                  ? "px-2.5 py-1 text-[9px]"
                  : "px-3.5 py-1.5 text-[10px] sm:text-[11px]"
              }`}
              style={{
                transform: prefersReduced ? "none" : "translateZ(15px)",
              }}
            >
              {fee}
            </span>
          ) : null}
        </div>
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
          : "flex flex-1 flex-col px-5 pb-2 pt-2"
      }
    >
      <div className="type-eyebrow text-primary">
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

/**
 * Hub course card body — compact hierarchy on a white surface for denser grids.
 *
 * @param props - Course copy fields
 */
function HubCourseCardBody({
  title,
  duration,
  level,
  certification,
  fee,
  description,
  highlights,
}: Pick<
  CourseCardProps,
  | "title"
  | "duration"
  | "level"
  | "certification"
  | "fee"
  | "description"
  | "highlights"
>) {
  const items = (highlights ?? []).filter((item) => item.trim()).slice(0, 3);

  return (
    <div className="flex flex-1 flex-col px-4 pb-2.5 pt-2 sm:px-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary sm:text-[11px]">
        {certShort(certification) || "Yoga Alliance"} · Certified
      </p>

      <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-primary sm:text-[1.05rem]">
        {title}
      </h3>

      {description ? (
        <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-muted sm:text-[13px]">
          {description}
        </p>
      ) : null}

      <div className={description ? "mt-2.5" : "mt-2"}>
        <MetaPills duration={duration} level={level} fee={fee} compact />
      </div>

      {items.length > 0 ? (
        <ul className="mt-2.5 flex flex-1 flex-col gap-1">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-1.5">
              <span
                className="mt-1.5 size-1 shrink-0 rounded-full bg-primary"
                aria-hidden="true"
              />
              <span className="line-clamp-1 text-xs leading-snug text-ink/70">
                {item}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}

/**
 * Course card with stacked (home), editorial, or hub layouts.
 * Hub and stacked share the same 16:10 chrome-inset image; hub uses a white surface.
 *
 * @param props - Course fields and optional layout variant
 */
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
  const hub = layout === "hub";
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
    if (prefersReduced || hub) return;
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const shellClass = hub
    ? `${className} group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-card course-card-transition hover:border-primary hover:shadow-[0_18px_36px_-12px_rgba(163,36,50,0.14)] hover:ring-1 hover:ring-primary`
    : `${className} group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink/5 bg-sand shadow-card course-card-transition hover:border-primary hover:shadow-[0_30px_60px_-15px_rgba(163,36,50,0.16)] hover:ring-1 hover:ring-primary`;

  const radiusClass = hub ? "rounded-2xl" : "rounded-3xl";

  return (
    <div className={hub ? "h-full w-full" : "h-full w-full"}>
      <motion.div
        custom={{ prefersReduced }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={cardVariants}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={shellClass}
        style={
          hub
            ? undefined
            : {
                rotateX: prefersReduced ? 0 : rotateXSpring,
                rotateY: prefersReduced ? 0 : rotateYSpring,
                transformStyle: "preserve-3d",
              }
        }
      >
        {mounted && !prefersReduced && !hub ? (
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
          style={
            hub
              ? undefined
              : {
                  transform: prefersReduced ? "none" : "translateZ(20px)",
                  transformStyle: "preserve-3d",
                }
          }
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
            hub={hub}
          />
          {hub ? (
            <HubCourseCardBody
              title={title}
              duration={duration}
              level={level}
              certification={certification}
              fee={fee}
              description={description}
              highlights={highlights}
            />
          ) : (
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
          )}
        </div>

        <div
          className={`mt-auto flex items-center justify-between border-t border-ink/5 transition-colors duration-300 group-hover:border-t-primary/15 group-hover:bg-primary ${
            hub ? "px-4 py-3 sm:px-5" : "p-4"
          }`}
        >
          <span
            className={`pb-0.5 font-serif font-medium tracking-wider text-ink/80 transition-colors duration-300 group-hover:text-white ${
              hub ? "text-xs sm:text-[13px]" : "text-sm"
            }`}
          >
            View course details
          </span>
          <ArrowRight
            size={hub ? 12 : 14}
            className="text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white"
          />
        </div>

        <Link
          href={href}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className={`absolute inset-0 z-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${radiusClass}`}
          aria-label={`View details for ${title}`}
        />
      </motion.div>
    </div>
  );
}
