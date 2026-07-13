"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import SectionBlocksRenderer from "@/components/courses/SectionBlocksRenderer";
import { Container, SectionHeader } from "@/components/ui";
import type { SitePageSection } from "@/data/sitePages";
import { Check } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

export default function PageEditorialSection({
  section,
  tone = "paper",
}: {
  section: SitePageSection;
  tone?: "paper" | "white";
}) {
  const images =
    section.images && section.images.length > 0
      ? section.images
      : section.image
        ? [section.image]
        : [];

  return (
    <section
      className={`${tone === "paper" ? "bg-paper" : "bg-white"} py-20 sm:py-28`}
    >
      <Container size="2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="mb-10"
        >
          <SectionHeader
            eyebrow={section.eyebrow ?? "Details"}
            title={<span className="text-balance">{section.title}</span>}
          />
        </motion.div>

        <div
          className={`grid grid-cols-1 gap-10 ${images.length > 0 ? "lg:grid-cols-2 lg:items-start" : ""}`}
        >
          <div className="space-y-6">
            {section.blocks && section.blocks.length > 0 ? (
              <SectionBlocksRenderer blocks={section.blocks} />
            ) : (
              <>
                {section.body?.split("\n\n").map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="type-lead font-sans leading-relaxed text-muted"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.items && section.items.length > 0 && (
                  <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 rounded-2xl border border-ink/6 bg-white p-4 font-sans text-sm text-muted shadow-card"
                      >
                        <Check
                          size={16}
                          className="mt-0.5 shrink-0 text-primary"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.subsections?.map((sub) => (
                  <article
                    key={sub.title}
                    className="rounded-3xl border border-ink/6 bg-white p-6 shadow-card"
                  >
                    <h3 className="type-display-sm mb-3 font-serif text-ink">
                      {sub.title}
                    </h3>
                    {sub.body && (
                      <p className="type-body font-sans leading-relaxed text-muted">
                        {sub.body}
                      </p>
                    )}
                    {sub.items && (
                      <ul className="mt-4 space-y-2">
                        {sub.items.map((item) => (
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
                    )}
                  </article>
                ))}
              </>
            )}
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {images.slice(0, 4).map((url) => (
                <div
                  key={url}
                  className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-sand shadow-card"
                >
                  <Image
                    src={url}
                    alt={section.title}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
