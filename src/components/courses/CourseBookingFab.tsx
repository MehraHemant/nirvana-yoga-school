"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

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
          className="fixed bottom-4 right-6 z-40 hidden md:flex items-center gap-0 rounded-2xl overflow-hidden shadow-xl shadow-primary/30"
        >
          {/* Fee panel */}
          {fee && (
            <div className="flex flex-col justify-center px-4 py-3 bg-ink leading-none">
              <span className="text-[8px] font-semibold uppercase tracking-wider text-white/50 mb-0.5">
                {title ? "Starting from" : "Course fee"}
              </span>
              <span className="text-sm font-bold text-white tabular-nums">
                {fee}
              </span>
            </div>
          )}

          {/* CTA button */}
          <Link
            href={href}
            className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-dark transition-colors duration-200 group"
          >
            <span className="text-sm font-bold text-white tracking-wide whitespace-nowrap">
              Book Now
            </span>
            <span className="text-white/80 transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
