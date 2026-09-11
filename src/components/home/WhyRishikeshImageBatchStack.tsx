"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import type { HomeWhyRishikeshTrustLogo } from "@/content/types/dedicated-pages";
import { VIEWPORT_ONCE } from "@/lib/motion";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 16,
      staggerChildren: 0.08,
    },
  },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 16 },
  },
};

type WhyRishikeshImageBatchStackProps = {
  /** CMS trust logo / certification image batches. */
  images: HomeWhyRishikeshTrustLogo[];
};

/**
 * Row of circular trust logos capped at 120px width each.
 *
 * @param props - Trust logo images from CMS
 */
export default function WhyRishikeshImageBatchStack({
  images,
}: WhyRishikeshImageBatchStackProps) {
  const filledImages = images.filter((image) => image.src.trim());
  if (filledImages.length === 0) return null;

  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      className="flex w-full items-center justify-center gap-3 sm:gap-4 lg:px-8"
      aria-label="Certifications and trust badges"
    >
      {filledImages.map((image, index) => (
        <motion.li
          key={`${image.src}-${index}`}
          variants={badgeVariants}
          className="relative aspect-square w-[120px] max-w-full shrink-0 overflow-hidden rounded-full border border-ink/10 bg-white shadow-soft ring-1 ring-ink/5 transition-transform duration-300 hover:scale-105 hover:shadow-card"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="120px"
            className="object-cover"
          />
        </motion.li>
      ))}
    </motion.ul>
  );
}
