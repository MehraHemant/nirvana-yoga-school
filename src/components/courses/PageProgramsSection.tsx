"use client";

import { motion } from "framer-motion";
import { Container, CourseCard, SectionHeader } from "@/components/ui";
import type { SitePageCard } from "@/content/types";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

export default function PageProgramsSection({
  cards,
  eyebrow = "Programs",
  title = (
    <>
      Explore our <span className="text-primary">offerings</span>
    </>
  ),
}: {
  cards: SitePageCard[];
  eyebrow?: string;
  title?: React.ReactNode;
}) {
  if (cards.length === 0) return null;

  return (
    <section id="programs" className="bg-white py-20 sm:py-28">
      <Container size="2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="mb-10 md:mb-14"
        >
          <SectionHeader eyebrow={eyebrow} title={title} align="center" />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card, index) => (
            <CourseCard
              key={card.title}
              title={card.title}
              duration="Flexible"
              level="All levels"
              certification="Nirvana Yoga School"
              fee="Enquire"
              image="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80"
              certBadge="https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=1600&q=85"
              href={card.href ?? "#contact"}
              highlights={[card.description]}
              revealDelay={index * 0.05}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
