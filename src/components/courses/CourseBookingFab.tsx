"use client";

import { AnimatePresence, motion } from "framer-motion";
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
  title,
  href = "#pricing",
}: CourseBookingFabProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.65);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.94 }}
          transition={{ duration: 0.35, ease: [0.25, 0, 0, 1] }}
          className="fixed bottom-6 right-6 z-40 hidden md:block"
        >
          <Link
            href={href}
            className="group relative flex min-w-[220px] items-center gap-3 overflow-hidden rounded-2xl border border-ink/8 bg-primary px-5 py-3.5 shadow-[0_12px_48px_-12px_rgba(26,20,16,0.35)] ring-1 ring-ink/5 transition-colors hover:bg-primary-dark sm:min-w-[260px] sm:gap-4 sm:px-6"
          >
            <span
              className="pointer-events-none absolute inset-0 bg-linear-to-r from-white/0 via-white/12 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden="true"
            />

            {fee ? (
              <div className="relative z-10 flex shrink-0 flex-col border-r border-white/20 pr-3 sm:pr-4">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-white/55">
                  {title ? "Starting from" : "From"}
                </span>
                <span className="font-serif text-base font-semibold leading-none tabular-nums text-white sm:text-lg">
                  {fee}
                </span>
              </div>
            ) : null}

            <div className="relative z-10 min-w-0 flex-1">
              <span className="block font-sans text-sm font-bold tracking-wide text-white sm:text-base">
                Book Now
              </span>
              <span className="mt-0.5 block text-[10px] font-medium text-white/65 sm:text-[11px]">
                Secure your spot
              </span>
            </div>

            <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:bg-white/25">
              <ArrowRight size={16} />
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
