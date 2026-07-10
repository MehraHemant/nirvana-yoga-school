"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "@/icons";

interface CourseBookingFabProps {
  fee?: string;
  title?: string;
  href?: string;
}

export default function CourseBookingFab({
  fee,
  href = "#pricing",
}: CourseBookingFabProps) {
  const [visible, setVisible] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.65);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const label = fee ? `Book now — from ${fee}` : "Book now";

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
            href={href}
            aria-label={label}
            className="group flex items-stretch overflow-hidden rounded-full shadow-[0_10px_36px_-10px_rgba(26,20,16,0.55),0_8px_28px_-8px_rgba(163,36,50,0.45)] ring-1 ring-white/10 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_14px_44px_-10px_rgba(26,20,16,0.6),0_12px_36px_-8px_rgba(163,36,50,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
          >
            {fee ? (
              <div className="flex shrink-0 flex-col justify-center border-r border-white/10 bg-ink px-4 py-2.5">
                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/45">
                  From
                </span>
                <span className="mt-0.5 font-serif text-base font-semibold leading-none tabular-nums text-white sm:text-[1.05rem]">
                  {fee}
                </span>
              </div>
            ) : null}

            <span className="relative flex items-center gap-2.5 overflow-hidden bg-primary py-2.5 pl-4 pr-1.5 transition-colors duration-200 group-hover:bg-primary-dark">
              <span
                className="pointer-events-none absolute inset-0 bg-linear-to-r from-white/0 via-white/16 to-white/0 -translate-x-full transition-transform duration-500 group-hover:translate-x-full"
                aria-hidden="true"
              />

              <span className="relative z-10 flex flex-col leading-none">
                <span className="text-sm font-bold tracking-wide text-white">
                  Book Now
                </span>
                <span className="mt-0.5 text-[10px] font-medium text-white/65">
                  Secure your spot
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
