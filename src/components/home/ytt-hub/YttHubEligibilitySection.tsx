"use client";

import { motion } from "framer-motion";
import { Container, SectionHeader } from "@/components/ui";
import type { YttHubContent } from "@/content/types/shared-sections";
import { EASE_OUT, fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type YttHubEligibilitySectionProps = {
  eligibility: YttHubContent["eligibility"];
  /** Public section HTML id (defaults to `certification`) */
  htmlId?: string;
};

/**
 * YTT hub eligibility / certification section — content from MySQL.
 *
 * @param props - Eligibility title and paragraphs
 */
export default function YttHubEligibilitySection({
  eligibility,
  htmlId = "certification",
}: YttHubEligibilitySectionProps) {
  const paragraphs = eligibility.paragraphs.filter((p) => p.trim());
  if (!eligibility.title.trim() && paragraphs.length === 0) return null;

  const [lead, ...rest] = paragraphs;

  return (
    <section id={htmlId} className="scroll-mt-28 bg-white py-20 md:py-28">
      <Container size="2xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="lg:sticky lg:top-28"
          >
            <SectionHeader
              eyebrow={eligibility.eyebrow?.trim() || "Certification"}
              title={eligibility.title}
              align="left"
              className="max-w-xl"
            />
          </motion.div>

          {paragraphs.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              variants={fadeUp}
              transition={{ delay: 0.06, duration: 0.55, ease: EASE_OUT }}
              className="border-l-2 border-primary/35 pl-6 md:pl-8"
            >
              {lead ? (
                <p className="type-lead leading-relaxed text-ink/90">{lead}</p>
              ) : null}
              {rest.length > 0 ? (
                <div className={lead ? "mt-6 space-y-5" : "space-y-5"}>
                  {rest.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 48)}
                      className="type-body leading-relaxed text-ink/75"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
