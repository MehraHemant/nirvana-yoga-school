"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "@/icons";

interface CourseBookingFabProps {
  fee?: string;
  title?: string;
  href?: string;
  /** Selected room price — shown when booking is ready */
  selectedPrice?: string;
  /** Selected batch date label — shown when booking is ready */
  selectedDate?: string;
  /** When false, FAB prompts user to pick room & date and links to pricing anchor */
  ready?: boolean;
  /** Section id to scroll to when selections are incomplete */
  pricingAnchor?: string;
}

/**
 * Floating book-now CTA on course/retreat pages.
 * Reflects UpcomingDates selections when `ready`; otherwise nudges user to the pricing section.
 *
 * @param props - Fee fallback, booking href, and optional room/date selection state
 */
export default function CourseBookingFab({
  fee,
  href = "#pricing",
  selectedPrice,
  selectedDate,
  ready = true,
  pricingAnchor = "#pricing",
}: CourseBookingFabProps) {
  const [pastHero, setPastHero] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;

  useEffect(() => {
    const onScroll = () => {
      setPastHero(window.scrollY > window.innerHeight * 0.65);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visible = pastHero;
  const linkHref = ready ? href : pricingAnchor;
  const priceLabel = ready && selectedPrice ? selectedPrice : fee;
  const showPricePanel = Boolean(priceLabel);
  const primaryLabel = ready ? "Book Now" : "Select room & date";
  const secondaryLabel = ready
    ? selectedDate || "Secure your spot"
    : "Choose package & date below";
  const ariaLabel = ready
    ? selectedPrice && selectedDate
      ? `Book now — ${selectedPrice} · ${selectedDate}`
      : fee
        ? `Book now — from ${fee}`
        : "Book now"
    : "Select room and training date";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={
            prefersReduced
              ? { duration: 0 }
              : { type: "spring", stiffness: 400, damping: 30 }
          }
          className="fixed bottom-5 right-5 z-40 hidden md:block"
        >
          <Link
            href={linkHref}
            aria-label={ariaLabel}
            className="group flex items-stretch overflow-hidden rounded-full shadow-[0_10px_36px_-10px_rgba(26,20,16,0.55),0_8px_28px_-8px_rgba(163,36,50,0.45)] ring-1 ring-white/10 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_14px_44px_-10px_rgba(26,20,16,0.6),0_12px_36px_-8px_rgba(163,36,50,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
          >
            {showPricePanel ? (
              <div className="flex shrink-0 flex-col justify-center border-r border-white/10 bg-ink px-4 py-2.5">
                <span className="text-[10px] font-medium uppercase leading-[1.3] tracking-[0.14em] text-white/45">
                  {ready && selectedPrice ? "Total" : "From"}
                </span>
                <span className="mt-0.5 text-base font-semibold leading-none tabular-nums text-white sm:text-[1.05rem]">
                  {priceLabel}
                </span>
              </div>
            ) : null}

            <span className="relative flex items-center gap-2.5 overflow-hidden bg-primary py-2.5 pl-4 pr-1.5 transition-colors duration-200 group-hover:bg-primary-dark">
              <span
                className="pointer-events-none absolute inset-0 bg-linear-to-r from-white/0 via-white/16 to-white/0 -translate-x-full transition-transform duration-500 group-hover:translate-x-full"
                aria-hidden="true"
              />

              <span className="relative z-10 flex flex-col leading-[1.3]">
                <span className="text-sm font-semibold tracking-wide text-white">
                  {primaryLabel}
                </span>
                <span className="mt-0.5 max-w-[11rem] truncate text-[11px] font-medium text-white/65">
                  {secondaryLabel}
                </span>
              </span>

              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/25 text-white ring-1 ring-white/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-ink/40">
                <ArrowRight size={14} />
              </span>
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
