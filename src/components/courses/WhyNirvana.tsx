"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Container, PlatformReviewsRows, SectionHeader } from "@/components/ui";
import {
  BadgeStar,
  Bed,
  BookOpen,
  Bowl,
  Compass,
  Layers,
  Leaf,
  Lotus,
  Shield,
  Sunrise,
  Users,
} from "@/icons";
import {
  WHY_NIRVANA_BANNER,
  WHY_NIRVANA_CLOSING,
  WHY_NIRVANA_HIGHLIGHTS,
} from "@/data/whyNirvana";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type IconFC = React.FC<{ size?: number; className?: string }>;

// Mapped 1-to-1 with WHY_NIRVANA_HIGHLIGHTS order
const HIGHLIGHT_ICONS = [
  BookOpen,   // Quality Education
  Compass,    // Serene Setting
  Leaf,       // Fresh Mountain Air
  BadgeStar,  // Private Balconies
  Bowl,       // Whole-Food Sattvic Eating
  Sunrise,    // Sunrise Views
  Users,      // Easy Movement
  Bed,        // Deep Sleep
  Shield,     // Healing Touch
  Layers,     // State-of-the-Art Equipment
  Lotus,      // Cultural & Spiritual Events
] as IconFC[];

export default function WhyNirvana() {
  return (
    <section id="why-nirvana" className="bg-white">
      <Container size="2xl" className="py-16 sm:py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="mx-auto max-w-3xl text-center mb-8"
          >
            <SectionHeader
              eyebrow="Silent Hill · Upper Tapovan"
              title={
                <>
                  Why <span className="text-primary">Nirvana?</span>
                </>
              }
              align="center"
            />
          </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
        >
          <h3 className="type-h3 mb-8 text-center font-serif tracking-wide text-ink">
            What Makes Nirvana a Truly Unique Experience?
          </h3>

          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-8 md:gap-y-5">
            {WHY_NIRVANA_HIGHLIGHTS.map((item, i) => {
              const Icon = HIGHLIGHT_ICONS[i] ?? BookOpen;
              return (
                <li key={item.title}>
                  <article className="group flex h-full gap-4 rounded-2xl border border-ink/6 bg-paper/40 p-4 transition-all duration-300 hover:border-primary/15 hover:bg-white hover:shadow-soft sm:p-5">
                    <span
                      className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-secondary/15 transition-colors group-hover:bg-primary/5 group-hover:ring-primary/20"
                      aria-hidden="true"
                    >
                      <Icon size={18} className="text-primary" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="type-display-sm mb-1.5 font-serif leading-snug text-ink">
                        {item.title}
                      </h4>
                      <p className="font-sans text-sm leading-relaxed text-muted">
                        {item.body}
                      </p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          <p className="mx-auto mt-12 max-w-3xl border-t border-ink/10 pt-10 text-center font-sans text-sm leading-relaxed text-muted sm:text-base">
            {WHY_NIRVANA_CLOSING}
          </p>
        </motion.div>
      </Container>

      <div className="relative mt-8 overflow-hidden bg-white pb-16 sm:pb-20">
        <div
          className="pointer-events-none absolute -right-20 top-0 h-[320px] w-[320px] rounded-full bg-primary/5 blur-[90px]"
          aria-hidden="true"
        />
        <Container size="2xl" className="relative z-10">
          <PlatformReviewsRows />
        </Container>
      </div>
    </section>
  );
}
