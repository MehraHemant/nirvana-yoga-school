"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, SectionHeader } from "@/components/ui";
import { DEFAULT_ONLINE_HUB_WHY_ONLINE } from "@/content/page-modules-defaults";
import type { WhyOnlineModule } from "@/content/types";
import { BookOpen, Clock, Layers, Users } from "@/icons";
import { resolveSectionHtmlId } from "@/lib/html-id";
import { EASE_OUT, fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

const BENEFIT_ICONS = [Clock, BookOpen, Users, Layers] as const;

const listContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

const ruleVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.7, ease: EASE_OUT, delay: 0.18 },
  },
};

const indexVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

type OnlineHubBenefitsProps = {
  /** CMS why-online module; falls back to defaults when omitted */
  content?: WhyOnlineModule | null;
  /** Public section HTML id override */
  htmlId?: string;
};

/**
 * Why-online trust band for the online courses hub.
 *
 * @param props - Optional CMS module and section HTML id
 */
export default function OnlineHubBenefits({
  content,
  htmlId,
}: OnlineHubBenefitsProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const module = content ?? DEFAULT_ONLINE_HUB_WHY_ONLINE;
  const items = module.items.filter(
    (item) => item.title.trim() || item.description.trim(),
  );
  if (items.length === 0) return null;

  const sectionId = htmlId ?? resolveSectionHtmlId("why-online", module._id);
  const eyebrow =
    module.eyebrow?.trim() || DEFAULT_ONLINE_HUB_WHY_ONLINE.eyebrow || "";
  const title =
    module.title?.trim() || DEFAULT_ONLINE_HUB_WHY_ONLINE.title || "";
  const description =
    module.description?.trim() ||
    DEFAULT_ONLINE_HUB_WHY_ONLINE.description ||
    "";
  const accentWord = "from anywhere";
  const titleParts = title.includes(accentWord)
    ? title.split(accentWord)
    : null;
  const countLabel = String(items.length).padStart(2, "0");
  const motionSafe = !prefersReduced;

  return (
    <section
      id={sectionId}
      className="online-why relative scroll-mt-28 overflow-hidden bg-white py-20 md:py-28"
    >
      <Container size="2xl" className="relative z-10">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start lg:gap-20 xl:gap-28">
          <motion.div
            initial={motionSafe ? "hidden" : false}
            whileInView={motionSafe ? "visible" : undefined}
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="lg:sticky lg:top-28"
          >
            <div className="online-why-intro max-w-md lg:max-w-lg">
              <p
                className="online-why-count mb-6 font-serif text-[0.7rem] tracking-[0.22em] text-primary uppercase sm:mb-7"
                aria-hidden="true"
              >
                {countLabel} reasons
              </p>

              <SectionHeader
                eyebrow={eyebrow}
                title={
                  titleParts ? (
                    <>
                      {titleParts[0]}
                      <span className="text-primary">{accentWord}</span>
                      {titleParts[1]}
                    </>
                  ) : (
                    title
                  )
                }
                description={description}
                align="left"
              />

              <motion.div
                className="online-why-rule mt-9 origin-left sm:mt-10"
                aria-hidden="true"
                initial={motionSafe ? "hidden" : false}
                whileInView={motionSafe ? "visible" : undefined}
                viewport={VIEWPORT_ONCE}
                variants={ruleVariants}
              />
            </div>
          </motion.div>

          <motion.ol
            className="online-why-list relative"
            initial={motionSafe ? "hidden" : false}
            whileInView={motionSafe ? "visible" : undefined}
            viewport={VIEWPORT_ONCE}
            variants={listContainerVariants}
          >
            {items.map(
              ({ title: itemTitle, description: itemDescription }, index) => {
                const Icon = BENEFIT_ICONS[index % BENEFIT_ICONS.length];
                const number = String(index + 1).padStart(2, "0");
                return (
                  <motion.li
                    key={`${itemTitle}-${index}`}
                    variants={listItemVariants}
                    className="online-why-item group relative grid grid-cols-[auto_minmax(0,1fr)] gap-5 py-8 sm:gap-7 sm:py-9"
                  >
                    <motion.span
                      className="online-why-index relative z-10 flex flex-col items-start gap-3 pt-0.5"
                      variants={indexVariants}
                      aria-hidden="true"
                    >
                      <span className="font-serif text-[1.65rem] leading-none tracking-tight text-primary/85 tabular-nums sm:text-[1.85rem]">
                        {number}
                      </span>
                      <span className="online-why-icon flex size-8 items-center justify-center text-primary sm:size-9">
                        <Icon size={16} />
                      </span>
                    </motion.span>

                    <div className="min-w-0 pt-1">
                      <h3 className="font-serif text-[1.3rem] leading-[1.2] tracking-[-0.01em] text-ink sm:text-[1.5rem]">
                        {itemTitle}
                      </h3>
                      {itemDescription ? (
                        <p className="mt-2.5 max-w-md type-body leading-relaxed text-muted sm:mt-3">
                          {itemDescription}
                        </p>
                      ) : null}
                    </div>
                  </motion.li>
                );
              },
            )}
          </motion.ol>
        </div>
      </Container>
    </section>
  );
}
