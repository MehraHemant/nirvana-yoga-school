"use client";

import { motion, type Variants } from "framer-motion";
import OnlineSectionShell from "./OnlineSectionShell";
import OnlineTestimonialCard, {
  type OnlineTestimonial,
} from "./OnlineTestimonialCard";

const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

type OnlineTestimonialsSectionProps = {
  testimonials: OnlineTestimonial[];
};

/**
 * Staggered testimonials band for an online course page.
 *
 * @param props.testimonials - Course reviews; empty list renders nothing
 */
export default function OnlineTestimonialsSection({
  testimonials,
}: OnlineTestimonialsSectionProps) {
  if (testimonials.length === 0) return null;

  return (
    <OnlineSectionShell id="testimonials" title="Testimonials">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        variants={gridVariants}
        className="grid items-stretch gap-5 md:grid-cols-2 md:gap-6"
      >
        {testimonials.map((item) => (
          <OnlineTestimonialCard key={item.name} testimonial={item} />
        ))}
      </motion.div>
    </OnlineSectionShell>
  );
}
