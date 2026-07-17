"use client";

import { motion } from "framer-motion";
import type { YttHubContent } from "@/content/types/shared-sections";
import { Check } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";
import YttHubSection from "./YttHubSection";

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
  return (
    <YttHubSection
      id={htmlId}
      title={eligibility.title}
      className="bg-white"
    >
      <ul className="grid max-w-none gap-4">
        {eligibility.paragraphs.map((paragraph) => (
          <motion.li
            key={paragraph.slice(0, 48)}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="flex items-start gap-3 rounded-2xl border border-ink/8 bg-paper px-5 py-4"
          >
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check size={16} className="text-primary" />
            </span>
            <span className="type-body text-ink/85">{paragraph}</span>
          </motion.li>
        ))}
      </ul>
    </YttHubSection>
  );
}
