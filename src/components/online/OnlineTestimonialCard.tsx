"use client";

import { motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { BadgeStar } from "@/icons";
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

export default function OnlineTestimonialCard({
  testimonial,
}: OnlineTestimonialCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const quoteId = useId();

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
      className="rounded-3xl border border-ink/8 bg-white p-6 shadow-xs"
    >
      <BadgeStar size={18} className="text-amber-500" />
      <div className="relative mt-4">
        <p
          ref={quoteRef}
          id={quoteId}
          className={`font-serif text-lg leading-relaxed text-ink/90 ${
            isExpanded ? "" : "line-clamp-4 h-[4lh]"
          }`}
        >
          “{testimonial.quote}”
        </p>
        {isTruncated && !isExpanded ? (
          <button
            type="button"
            aria-controls={quoteId}
            aria-expanded={false}
            onClick={() => setIsExpanded(true)}
            className="absolute right-0 bottom-0 z-10 cursor-pointer whitespace-nowrap bg-linear-to-l from-white from-40% to-transparent pl-10 type-ui leading-relaxed font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
            className="mt-2 cursor-pointer type-ui font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Show less
          </button>
        ) : null}
      </div>
      <footer className="mt-5 type-ui font-semibold text-muted">
        — {testimonial.name}
      </footer>
    </motion.blockquote>
  );
}
