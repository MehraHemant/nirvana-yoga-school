"use client";

import { motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { EASE_OUT } from "@/lib/motion";

export type OnlineTestimonial = {
  name: string;
  quote: string;
};

export const testimonialCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};

type OnlineTestimonialCardProps = {
  testimonial: OnlineTestimonial;
};

/**
 * Initials for a name-only testimonial (course data has no avatar).
 *
 * @param name - Student display name
 */
function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Online course testimonial card with quote hierarchy and initials avatar.
 *
 * @param props.testimonial - Name and quote from the course document
 */
export default function OnlineTestimonialCard({
  testimonial,
}: OnlineTestimonialCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const quoteId = useId();
  const initials = initialsFromName(testimonial.name);

  useEffect(() => {
    if (isExpanded) return;

    const quote = quoteRef.current;
    if (!quote) return;

    const updateTruncation = () => {
      setIsTruncated(quote.scrollHeight > quote.clientHeight);
    };
    updateTruncation();

    const observer = new ResizeObserver(updateTruncation);
    observer.observe(quote);
    return () => observer.disconnect();
  }, [isExpanded]);

  return (
    <motion.blockquote
      variants={testimonialCardVariants}
      className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-primary/10 bg-primary/3 p-6 shadow-card sm:p-7"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-2 right-5 select-none text-[5.5rem] leading-none text-primary/12"
      >
        “
      </span>

      <div className="relative flex-1 pr-8">
        <p
          ref={quoteRef}
          id={quoteId}
          className={`type-body text-ink ${isExpanded ? "" : "line-clamp-4"}`}
        >
          {testimonial.quote}
        </p>
        {isTruncated && !isExpanded ? (
          <button
            type="button"
            aria-controls={quoteId}
            aria-expanded={false}
            onClick={() => setIsExpanded(true)}
            className="mt-3 cursor-pointer type-ui font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Read more
          </button>
        ) : null}
        {isExpanded ? (
          <button
            type="button"
            aria-controls={quoteId}
            aria-expanded={true}
            onClick={() => setIsExpanded(false)}
            className="mt-3 cursor-pointer type-ui font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Show less
          </button>
        ) : null}
      </div>

      <footer className="mt-auto flex items-center gap-3 pt-5">
        {initials ? (
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold tracking-wide text-primary"
          >
            {initials}
          </span>
        ) : null}
        <cite className="not-italic type-ui font-semibold text-ink">
          {testimonial.name}
        </cite>
      </footer>
    </motion.blockquote>
  );
}
