"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Container, PlatformReviewsRows, SectionHeader } from "@/components/ui";
import {
  WHY_NIRVANA_BANNER,
  WHY_NIRVANA_CLOSING,
  WHY_NIRVANA_HIGHLIGHTS,
  WHY_NIRVANA_INTRO,
} from "@/data/whyNirvana";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

export default function WhyNirvana() {
  return (
    <section id="why-nirvana" className="border-b border-ink/5 bg-white">
      <div className="relative overflow-hidden py-20 sm:py-28 md:py-32">
        <Image
          src={WHY_NIRVANA_BANNER}
          alt="Yoga practice at Nirvana Yoga School on Silent Hill, Upper Tapovan, Rishikesh"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div
          className="absolute inset-0 bg-linear-to-b from-ink/75 via-ink/60 to-ink/80"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-24 bottom-0 h-[280px] w-[280px] rounded-full bg-primary/20 blur-[100px]"
          aria-hidden="true"
        />

        <Container size="2xl" className="relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="mx-auto max-w-3xl text-center"
          >
            <SectionHeader
              eyebrow="Silent Hill · Upper Tapovan"
              title={
                <>
                  Why <span className="text-accent">Nirvana?</span>
                </>
              }
              align="center"
              invert
            />
            <div className="mt-6 space-y-4 text-center font-sans text-sm leading-relaxed text-white/80 sm:text-base">
              {WHY_NIRVANA_INTRO.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          </motion.div>
        </Container>
      </div>

      <Container size="2xl" className="py-16 sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
        >
          <h3 className="type-h3 mb-8 text-center font-serif tracking-wide text-ink">
            What Makes Nirvana a Truly Unique Experience?
          </h3>

          <ul className="columns-1 gap-x-12 md:columns-2">
            {WHY_NIRVANA_HIGHLIGHTS.map((item) => (
              <li
                key={item.title}
                className="mb-6 break-inside-avoid border-l-2 border-primary/25 pl-4"
              >
                <p className="type-body leading-relaxed text-ink/85">
                  <strong className="font-sans font-semibold text-ink">
                    {item.title}:
                  </strong>{" "}
                  <span className="text-muted">{item.body}</span>
                </p>
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-12 max-w-3xl border-t border-ink/10 pt-10 text-center font-sans text-sm leading-relaxed text-muted sm:text-base">
            {WHY_NIRVANA_CLOSING}
          </p>
        </motion.div>
      </Container>

      <div className="relative mt-16 overflow-hidden border-t border-ink/10 bg-sand py-16 sm:py-20">
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
