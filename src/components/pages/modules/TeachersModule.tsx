"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Container, SectionHeader } from "@/components/ui";
import type { SitePagePerson } from "@/data/sitePages";
import { Check } from "@/icons";
import { fadeUp } from "@/lib/motion";
import { sectionTone } from "../utils";

export default function TeachersModule({
  people,
  toneIndex,
}: {
  people: SitePagePerson[];
  toneIndex: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = people[activeIndex] ?? people[0];

  return (
    <section className={`${sectionTone(toneIndex)} py-16 sm:py-20`}>
      <Container size="2xl">
        <SectionHeader
          eyebrow="Faculty"
          title={
            <>
              Meet our <span className="text-primary">teachers</span>
            </>
          }
          description="Experienced Indian gurus and facilitators guiding practice at Nirvana Yoga School."
          className="mb-10"
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-2">
            {people.map((person, index) => (
              <button
                key={person.name}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`overflow-hidden rounded-2xl border p-1.5 text-left transition-all ${
                  activeIndex === index
                    ? "border-primary bg-white shadow-soft"
                    : "border-ink/6 bg-white/70 hover:border-primary/20"
                }`}
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-sand">
                  {person.image ? (
                    <Image
                      src={person.image}
                      alt={person.name}
                      fill
                      unoptimized
                      sizes="120px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-serif text-xl text-primary/40">
                      {person.name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 px-1 font-sans text-[11px] font-semibold leading-tight text-ink">
                  {person.name}
                </p>
              </button>
            ))}
          </div>

          <motion.article
            key={active.name}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="overflow-hidden rounded-3xl border border-ink/6 bg-white shadow-card"
          >
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
              <div className="relative min-h-[280px] bg-sand md:min-h-full">
                {active.image ? (
                  <Image
                    src={active.image}
                    alt={active.name}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 240px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="p-6 sm:p-8">
                <h2 className="type-display-sm font-serif text-ink">
                  {active.name}
                </h2>
                {active.summary && (
                  <p className="type-ui mt-1 text-primary">{active.summary}</p>
                )}
                {active.bio && (
                  <p className="type-body mt-4 font-sans leading-relaxed text-muted">
                    {active.bio}
                  </p>
                )}
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
                  {[
                    { label: "Education", items: active.education },
                    { label: "Experience", items: active.experience },
                    { label: "Expertise", items: active.expertise },
                  ].map(
                    (block) =>
                      block.items &&
                      block.items.length > 0 && (
                        <div key={block.label}>
                          <h3 className="type-ui mb-2 font-semibold text-ink">
                            {block.label}
                          </h3>
                          <ul className="space-y-1.5">
                            {block.items.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-2 font-sans text-sm text-muted"
                              >
                                <Check
                                  size={14}
                                  className="mt-0.5 shrink-0 text-primary"
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ),
                  )}
                </div>
              </div>
            </div>
          </motion.article>
        </div>
      </Container>
    </section>
  );
}
