"use client";

import { motion } from "framer-motion";
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
  return (
    <motion.blockquote
      variants={testimonialCardVariants}
      className="rounded-3xl border border-secondary/10 bg-white p-6 shadow-xs"
    >
      <BadgeStar size={18} className="text-amber-500" />
      <p className="mt-4 font-serif text-lg leading-relaxed text-ink/90">
        “{testimonial.quote}”
      </p>
      <footer className="mt-5 type-ui font-semibold text-secondary">
        — {testimonial.name}
      </footer>
    </motion.blockquote>
  );
}
