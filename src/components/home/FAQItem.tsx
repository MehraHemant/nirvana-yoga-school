"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import { Plus } from "@/icons";
import { EASE_OUT } from "@/lib/motion";

type FAQItemProps = {
  q: string;
  a: string;
  image: string | StaticImageData;
  tag: string;
  index: number;
  isActive: boolean;
  onToggle: () => void;
};

export default function FAQItem({
  q,
  a,
  image,
  tag,
  index,
  isActive,
  onToggle,
}: FAQItemProps) {
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <div
      className={`group relative rounded-2xl md:rounded-3xl border overflow-hidden bg-ink transition-all duration-500 ${
        isActive
          ? "border-primary/30 shadow-soft ring-1 ring-primary/10"
          : "border-white/10 hover:border-white/20 hover:shadow-card"
      }`}
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          className={`object-cover transition-all duration-700 ease-out ${
            isActive
              ? "grayscale-0 scale-105 opacity-45"
              : "grayscale opacity-25 scale-100 group-hover:grayscale-0 group-hover:scale-102 group-hover:opacity-40"
          }`}
          priority={index === 0}
        />
        {/* Linear gradient overlay for absolute text contrast */}
        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            isActive
              ? "bg-linear-to-r from-primary/90 via-primary/75 to-transparent"
              : "bg-linear-to-r from-primary/80 via-primary/60 to-transparent group-hover:from-primary/70 group-hover:via-primary/50"
          }`}
        />
      </div>

      {/* Question Trigger (Stays on top of background image) */}
      <button
        type="button"
        aria-expanded={isActive}
        aria-controls={`faq-answer-${index}`}
        onClick={onToggle}
        className="relative w-full flex items-center justify-between gap-4 p-5 sm:p-6 md:p-7 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 z-10"
      >
        <span className="type-display-sm text-white font-medium leading-tight">
          {q}
        </span>
        <span
          className={`accordion-icon shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
            isActive
              ? "bg-primary text-white"
              : "bg-white/10 text-white group-hover:bg-primary group-hover:text-white"
          }`}
        >
          <motion.span
            animate={{ rotate: isActive ? 45 : 0 }}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.25 }}
            className="flex items-center justify-center"
          >
            <Plus size={16} />
          </motion.span>
        </span>
      </button>

      {/* Answer Content Panel */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            id={`faq-answer-${index}`}
            initial={
              prefersReduced
                ? { opacity: 1, height: "auto" }
                : { height: 0, opacity: 0 }
            }
            animate={{ height: "auto", opacity: 1 }}
            exit={
              prefersReduced
                ? { opacity: 0, height: 0 }
                : { height: 0, opacity: 0 }
            }
            transition={
              prefersReduced
                ? { duration: 0 }
                : { duration: 0.35, ease: EASE_OUT }
            }
            className="relative overflow-hidden z-10"
          >
            <div className="px-5 sm:px-6 md:px-7 pb-5 sm:pb-6 md:pb-7 border-t border-white/10 pt-4 max-w-3xl">
              <span className="type-eyebrow text-accent tracking-wider font-semibold block mb-2">
                {tag}
              </span>
              <p className="type-body text-white/85 leading-relaxed">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
