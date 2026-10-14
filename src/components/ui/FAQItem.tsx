"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import { Plus } from "@/icons";
import { EASE_OUT } from "@/lib/motion";

export type FAQItemProps = {
  question: string;
  answer: string;
  index: number;
  isActive: boolean;
  onToggle: () => void;
  image?: string | StaticImageData;
  tag?: string;
};

export default function FAQItem({
  question,
  answer,
  index,
  isActive,
  onToggle,
  image,
  tag,
}: FAQItemProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const hasImage = Boolean(image);

  return (
    <div
      className={`group relative overflow-hidden transition-all duration-300 ${
        hasImage
          ? `rounded-2xl md:rounded-3xl border bg-ink duration-500 ${
              isActive
                ? "border-primary/30 shadow-soft ring-1 ring-primary/10"
                : "border-white/10 hover:border-white/20 hover:shadow-card"
            }`
          : `rounded-2xl border ${
              isActive
                ? "border-primary bg-surface-muted shadow-soft"
                : "surface-panel border-ink/10 hover:border-primary/25"
            }`
      }`}
    >
      {hasImage && image && (
        <div className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none overflow-hidden">
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            className={`object-cover transition-all duration-700 ease-out ${isActive ? "scale-105 opacity-45 grayscale-0" : "scale-100 opacity-25 grayscale group-hover:scale-102 group-hover:opacity-40 group-hover:grayscale-0"}`}
            priority={index === 0}
          />
          <div
            className={`absolute inset-0 transition-colors duration-500 ${isActive ? "bg-linear-to-r from-primary/90 via-primary/75 to-transparent" : "bg-linear-to-r from-primary/80 via-primary/60 to-transparent group-hover:from-primary/70 group-hover:via-primary/50"}`}
          />
        </div>
      )}

      <button
        type="button"
        aria-expanded={isActive}
        aria-controls={`faq-answer-${index}`}
        onClick={onToggle}
        className={`relative z-10 flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:p-6 ${hasImage ? "md:p-7" : ""}`}
      >
        <span
          className={`type-h4 ${hasImage ? "text-white" : "text-ink"}`}
        >
          {question}
        </span>
        <span
          className={`flex shrink-0 items-center justify-center rounded-full transition-colors ${
            hasImage
              ? `h-8 w-8 ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-white/10 text-white group-hover:bg-primary group-hover:text-white"
                }`
              : `h-7 w-7 ${
                  isActive ? "bg-primary text-white" : "bg-ink/5 text-ink"
                }`
          }`}
        >
          <motion.span
            animate={{ rotate: isActive ? 45 : 0 }}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.25 }}
            className="flex items-center justify-center"
          >
            <Plus size={hasImage ? 16 : 14} />
          </motion.span>
        </span>
      </button>

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
                : { duration: hasImage ? 0.35 : 0.3, ease: EASE_OUT }
            }
            className="relative z-10 overflow-hidden"
          >
            <div
              className={`max-w-3xl border-t px-5 pb-5 sm:px-6 sm:pb-6 ${hasImage ? "border-white/10 pt-4 md:px-7 md:pb-7" : "border-ink/5 pt-1"}`}
            >
              {hasImage && tag && (
                <span className="type-eyebrow mb-2 block text-accent">
                  {tag}
                </span>
              )}
              <p
                className={`type-body ${hasImage ? "text-white/85" : "text-ink"}`}
              >
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
