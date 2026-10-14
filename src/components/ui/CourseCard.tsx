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
import { type ReactNode, useEffect, useState } from "react";
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
 * True when the primary pointer can hover (fine mouse/trackpad).
 * Starts false so touch clients never mount 3D parallax springs.
 */
function useFinePointerHover() {
  const [fineHover, setFineHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFineHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return fineHover;
}

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
    : "rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-tight tracking-wide";

  return (
    <div className="flex flex-wrap gap-1.5">
      <span className={`${chip} border-ink/12 bg-white text-ink`}>
        {duration}
      </span>
      <span className={`${chip} border-ink/12 bg-white text-ink`}>{level}</span>
      <span
        className={`${chip} border-primary/15 bg-primary/8 font-semibold text-primary`}
      >
        {fee}
      </span>
    </div>
  );
}

/**
 * Editorial focus list with check icons.
 *
 * @param props - Highlight strings
 */
function FocusList({ highlights }: { highlights: string[] }) {
  if (highlights.length === 0) return null;

  return (
    <ul className="space-y-2.5">
      {highlights.slice(0, 4).map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Check size={11} strokeWidth={3} className="text-primary" />
          </span>
          <span className="text-sm leading-[1.6] text-ink">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Course card media. Stacked uses full-bleed 16:10 with a stronger veil;
 * hub keeps a chrome inset so denser grids stay compact.
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
  const stacked = !editorial && !hub;

  const frameClass = editorial
    ? "absolute inset-4 overflow-hidden rounded-2xl md:inset-5"
    : hub
      ? "absolute inset-2.5 overflow-hidden rounded-xl sm:inset-3"
      : "absolute inset-0 overflow-hidden";

  const badgePad = hub
    ? "left-2 top-2 sm:left-2.5 sm:top-2.5"
    : stacked
      ? "left-3 top-3 sm:left-3.5 sm:top-3.5"
      : "left-2.5 top-2.5 sm:left-3 sm:top-3";
  const certPad = hub
    ? "right-2 top-2 sm:right-2.5 sm:top-2.5"
    : stacked
      ? "right-3 top-3 sm:right-3.5 sm:top-3.5"
      : "right-2.5 top-2.5 sm:right-3 sm:top-3";
  const feePad = hub
    ? "bottom-2 left-2 sm:bottom-2.5 sm:left-2.5"
    : "bottom-2.5 left-2.5 sm:bottom-3 sm:left-3";

  return (
    <div
      className={
        editorial
          ? "relative w-full shrink-0 md:w-[40%] lg:w-[38%]"
          : stacked
            ? "relative aspect-[16/10] w-full shrink-0 overflow-hidden"
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
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            priority={revealDelay === 0}
          />
          <div
            className={
              stacked
                ? "absolute inset-0 bg-linear-to-t from-ink/70 via-ink/25 to-ink/5"
                : "absolute inset-0 bg-linear-to-t from-ink/50 via-ink/10 to-transparent"
            }
            aria-hidden="true"
          />
          {stacked ? (
            <div
              className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-80"
              aria-hidden="true"
            />
          ) : null}

          {hours ? (
            <span
              className={`absolute z-20 font-semibold text-white shadow-sm ${badgePad} ${hub ? "rounded-full bg-primary px-2 py-0.5 text-[9px] tracking-wide" : stacked ? "rounded-md bg-primary px-2.5 py-1 type-eyebrow tracking-[0.14em]" : "rounded-full bg-primary px-3 py-1 type-eyebrow"}`}
              style={{
                transform: prefersReduced ? "none" : "translateZ(15px)",
              }}
            >
              {hours}
            </span>
          ) : null}

          {certBadge ? (
            <div
              className={`absolute z-20 flex items-center justify-center rounded-full border border-white/30 bg-white/95 shadow-sm backdrop-blur-xs ${certPad} ${hub ? "size-8 p-0.5" : stacked ? "size-11 p-1" : "size-10 p-1"}`}
              style={{
                transform: prefersReduced ? "none" : "translateZ(15px)",
              }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image
                  src={certBadge}
                  alt={certification}
                  fill
                  sizes={hub ? "28px" : stacked ? "40px" : "36px"}
                  className="object-cover"
                />
              </div>
            </div>
          ) : null}

          {/* Hub keeps fee on media; stacked shows a body price row instead. */}
          {hub ? (
            <span
              className={`absolute z-20 rounded-full border border-primary/20 bg-primary/80 font-semibold tracking-wide text-white shadow-xs backdrop-blur-md ${feePad} px-2.5 py-1 text-[9px]`}
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

/**
 * Stacked / editorial body — stacked uses a serif price row and lean highlights.
 *
 * @param props - Course copy and layout flags
 */
function CourseCardBody({
  title,
  duration,
  level,
  certification,
  fee,
  description,
  highlights,
  index,
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
  | "index"
  | "layout"
> & { editorial: boolean }) {
  const items = (highlights ?? [])
    .filter((item) => item.trim())
    .slice(0, editorial ? 4 : 3);
  const courseNumber = String((index ?? 0) + 1).padStart(2, "0");

  return (
    <div
      className={
        editorial
          ? "flex flex-1 flex-col px-5 pb-5 pt-4 md:px-6 md:py-6"
          : "relative z-10 mx-3 -mt-5 flex flex-1 flex-col rounded-t-[1.15rem] bg-sand px-4 pb-3 pt-4 shadow-[0_-12px_30px_rgba(31,30,28,0.08)] sm:mx-4 sm:px-5"
      }
    >
      {editorial ? (
        <div className="type-eyebrow text-primary">
          {certShort(certification)} · Yoga Alliance
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="type-eyebrow shrink-0 text-primary">
            {certShort(certification)} · Yoga Alliance
          </span>
          <span className="h-px flex-1 bg-primary/30" aria-hidden="true" />
          <span className="text-sm font-semibold tabular-nums text-ink/45">
            {courseNumber}
          </span>
        </div>
      )}

      <h3
        className={
          editorial
            ? "type-display-sm mt-1.5 line-clamp-2 font-semibold tracking-tight leading-snug text-ink transition-colors duration-300 group-hover:text-primary"
            : "mt-2 line-clamp-2 text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.015em] text-ink transition-colors duration-300 group-hover:text-primary sm:text-[1.35rem] lg:text-[1.25rem] xl:text-[1.3rem] 2xl:text-[1.35rem]"
        }
      >
        {title}
      </h3>

      {description ? (
        <p
          className={
            editorial
              ? "mt-2 line-clamp-2 text-sm leading-[1.55] text-ink sm:text-[0.9375rem]"
              : "mt-1.5 line-clamp-1 text-[12.5px] leading-normal text-ink"
          }
        >
          {description}
        </p>
      ) : null}

      {editorial ? (
        <div className={description ? "mt-2.5" : "mt-2"}>
          <MetaPills duration={duration} level={level} fee={fee} />
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-[0.9fr_1fr_1.15fr] border-y border-ink/10">
          <div className="min-w-0 py-2.5 pr-2">
            <p className="text-[10px] font-semibold uppercase leading-[1.4] tracking-[0.14em] text-ink">
              Duration
            </p>
            <p className="mt-1 truncate text-[12px] font-semibold leading-none text-ink">
              {duration}
            </p>
          </div>
          <div className="min-w-0 border-l border-ink/10 px-2 py-2.5">
            <p className="text-[10px] font-semibold uppercase leading-[1.4] tracking-[0.14em] text-ink">
              Level
            </p>
            <p className="mt-1 truncate text-[12px] font-semibold leading-none text-ink">
              {level}
            </p>
          </div>
          <div className="min-w-0 border-l border-ink/10 py-2.5 pl-3 text-right">
            <p className="text-[10px] font-semibold uppercase leading-[1.4] tracking-[0.14em] text-ink">
              From
            </p>
            <p className="mt-0.5 truncate text-[1.15rem] font-semibold leading-none tracking-tight text-primary">
              {fee}
            </p>
          </div>
        </div>
      )}

      {items.length > 0 ? (
        editorial ? (
          <div className="mt-5 flex-grow">
            <p className="type-eyebrow mb-3 text-ink">What you&apos;ll learn</p>
            <FocusList highlights={items} />
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase leading-[1.4] tracking-[0.14em] text-ink">
              Key outcomes
            </p>
            <ul className="mt-1.5 grid gap-x-3 gap-y-1 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item} className="flex min-w-0 items-start gap-2">
                  <span
                    className="mt-[0.45rem] h-px w-2.5 shrink-0 bg-primary"
                    aria-hidden="true"
                  />
                  <span className="line-clamp-1 text-[12px] leading-normal text-ink">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )
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
      <p className="type-eyebrow text-primary">
        {certShort(certification) || "Yoga Alliance"} · Certified
      </p>

      <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-primary sm:text-[1.05rem]">
        {title}
      </h3>

      {description ? (
        <p className="mt-1.5 line-clamp-2 text-xs leading-normal text-ink sm:text-[13px]">
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
              <span className="line-clamp-1 text-xs leading-normal text-ink">
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

type CourseCardShellProps = {
  className: string;
  prefersReduced: boolean;
  children: ReactNode;
};

/**
 * Plain reveal shell — no mouse parallax springs (touch, reduced-motion, hub).
 *
 * @param props - Shell className, reduced-motion flag, and card children
 */
function CourseCardStaticShell({
  className,
  prefersReduced,
  children,
}: CourseCardShellProps) {
  return (
    <motion.div
      custom={{ prefersReduced }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={cardVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Desktop hover shell with 3D tilt springs and shine (mounted only when enabled).
 *
 * @param props - Shell className, reduced-motion flag, and card children
 */
function CourseCardParallaxShell({
  className,
  prefersReduced,
  children,
}: CourseCardShellProps) {
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
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      custom={{ prefersReduced }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-30 rounded-[1.25rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-3xl"
        style={{ background: shineBg }}
      />
      {children}
    </motion.div>
  );
}

/**
 * Course card with stacked (home), editorial, or hub layouts.
 * Hub and stacked share the same 16:10 image ratio; hub uses inset chrome + white surface.
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
  index,
  layout = "stacked",
}: CourseCardProps) {
  const reducedMotion = useReducedMotion();
  const prefersReduced = reducedMotion ?? false;
  const finePointerHover = useFinePointerHover();
  const editorial = layout === "editorial";
  const hub = layout === "hub";
  const stacked = layout === "stacked";
  const enableParallax = !prefersReduced && !hub && finePointerHover;
  const hours = extractHours(title);
  const isExternal = href.startsWith("http");

  const shellClass = hub
    ? `${className} group surface-bordered relative flex h-full flex-col overflow-hidden shadow-card course-card-transition hover:border-primary hover:shadow-[0_18px_36px_-12px_rgba(163,36,50,0.14)] hover:ring-1 hover:ring-primary`
    : `${className} group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-ink/10 bg-sand shadow-card course-card-transition sm:rounded-3xl hover:border-primary/80 hover:shadow-[0_28px_56px_-18px_rgba(163,36,50,0.18)] hover:ring-1 hover:ring-primary/70`;

  const radiusClass = hub ? "rounded-2xl" : "rounded-[1.25rem] sm:rounded-3xl";
  const Shell = enableParallax
    ? CourseCardParallaxShell
    : CourseCardStaticShell;

  return (
    <div className="h-full w-full">
      <Shell className={shellClass} prefersReduced={prefersReduced}>
        <div
          className={
            editorial
              ? "flex min-h-0 flex-1 flex-col md:flex-row"
              : "flex min-h-0 flex-1 flex-col"
          }
          style={
            enableParallax
              ? {
                  transform: "translateZ(20px)",
                  transformStyle: "preserve-3d",
                }
              : undefined
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
            prefersReduced={!enableParallax}
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
              index={index}
              layout={layout}
              editorial={editorial}
            />
          )}
        </div>

        {stacked ? (
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-ink/10 bg-sand px-5 py-2.5 transition-colors duration-300 group-hover:border-t-primary group-hover:bg-primary">
            <span className="type-eyebrow flex items-center gap-2.5 text-ink transition-colors duration-300 group-hover:text-white">
              <span
                className="h-px w-5 bg-primary transition-colors duration-300 group-hover:bg-white"
                aria-hidden="true"
              />
              Explore program
            </span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary bg-primary text-white transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:text-primary">
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        ) : (
          <div
            className={`mt-auto flex items-center justify-between border-t border-ink/8 transition-colors duration-300 group-hover:border-t-primary/20 group-hover:bg-primary ${hub ? "px-4 py-2.5 sm:px-5" : "px-5 py-3"}`}
          >
            <span
              className={`pb-0.5 font-semibold tracking-wider text-ink transition-colors duration-300 group-hover:text-white ${hub ? "text-xs sm:text-[13px]" : "text-sm"}`}
            >
              View course details
            </span>
            <ArrowRight
              size={hub ? 12 : 14}
              className="text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white"
            />
          </div>
        )}

        <Link
          href={href}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className={`absolute inset-0 z-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${radiusClass}`}
          aria-label={`View details for ${title}`}
        />
      </Shell>
    </div>
  );
}
