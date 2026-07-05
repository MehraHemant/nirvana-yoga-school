"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button, Container, Heading, Pill } from "@/components/ui";
import { YTT_HUB_HERO_IMAGE, YTT_HUB_INTRO } from "@/data/yttHubPage";
import { fadeUp } from "@/lib/motion";

export default function YttHubHeroSection() {
  return (
    <section className="relative min-h-[460px] overflow-hidden pt-[4.75rem] md:min-h-[520px] md:pt-[5.5rem]">
      <Image
        src={YTT_HUB_HERO_IMAGE}
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
          <Pill invert>{YTT_HUB_INTRO.pill}</Pill>
          <Heading as="h1" size="h1" font="serif" invert>
            {YTT_HUB_INTRO.title}
          </Heading>
          <p className="type-lead text-white/90">{YTT_HUB_INTRO.lead}</p>
          <div className="flex flex-wrap gap-3">
            <Button href="#courses" variant="primary" size="md">
              View Courses
            </Button>
            <Button
              href="https://wa.me/918218564835"
              variant="outline-light"
              size="md"
            >
              Enquire Now
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
