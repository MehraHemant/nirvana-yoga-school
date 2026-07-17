"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button, Container, Heading, Pill } from "@/components/ui";
import type { YttHubContent } from "@/content/types/shared-sections";
import { optionalSectionHtmlId } from "@/lib/html-id";
import { fadeUp } from "@/lib/motion";

type YttHubHeroSectionProps = {
  heroImage: string;
  intro: YttHubContent["intro"];
  /** Optional CMS section `_id` for the hero band */
  htmlId?: string;
};

/**
 * YTT hub hero — image and intro copy from MySQL.
 *
 * @param props - Hero image URL and intro fields
 */
export default function YttHubHeroSection({
  heroImage,
  intro,
  htmlId,
}: YttHubHeroSectionProps) {
  return (
    <section
      id={optionalSectionHtmlId(htmlId)}
      className="relative min-h-[460px] overflow-hidden md:min-h-[520px]"
    >
      <Image
        src={heroImage}
        alt="Yoga teacher training by the Ganges in Rishikesh"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-r from-ink/75 via-ink/45 to-ink/25" />
      <div className="absolute inset-0 bg-linear-to-t from-ink/50 via-transparent to-transparent" />

      <Container
        size="2xl"
        className="relative z-10 flex min-h-[380px] items-end py-12 md:min-h-[440px] md:py-16"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-3xl space-y-5 text-white"
        >
          <Pill invert>{intro.pill}</Pill>
          <Heading as="h1" size="h1" font="serif" invert>
            {intro.title}
          </Heading>
          <p className="type-lead text-white/90">{intro.lead}</p>
          <div className="flex flex-wrap gap-3">
            <Button href="#courses" variant="primary" size="md">
              View Courses
            </Button>
            <Button href="/enquire-now" variant="outline-light" size="md">
              Enquire Now
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
