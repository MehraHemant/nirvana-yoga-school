"use client";

import { motion } from "framer-motion";
import { Container, SectionHeader } from "@/components/ui";
import { BookOpen, Certificate, Clock, Shield } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

const BENEFITS = [
  {
    title: "Yoga Alliance certified",
    description:
      "Course completion certificates accredited by Yoga Alliance USA.",
    icon: Certificate,
  },
  {
    title: "Teach worldwide",
    description:
      "Internationally recognized credentials eligible for teaching globally.",
    icon: Shield,
  },
  {
    title: "Lifetime access",
    description: "Keep videos, manuals, and resources for as long as you need.",
    icon: BookOpen,
  },
  {
    title: "Study on your schedule",
    description:
      "Self-paced learning with live Q&A support from Rishikesh teachers.",
    icon: Clock,
  },
] as const;

type OnlineHubBenefitsProps = {
  /** Public section HTML id */
  htmlId?: string;
};

/**
 * Why-online trust band for the online courses hub.
 *
 * @param props - Optional section HTML id
 */
export default function OnlineHubBenefits({
  htmlId = "why-online",
}: OnlineHubBenefitsProps) {
  return (
    <section id={htmlId} className="scroll-mt-28 bg-white py-16 md:py-24">
      <Container size="2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="mb-10 max-w-2xl md:mb-14"
        >
          <SectionHeader
            eyebrow="Why learn online"
            title={
              <>
                Rishikesh teachers,{" "}
                <span className="text-primary">from anywhere</span>
              </>
            }
            description="Flexible Yoga Alliance programs with the same curriculum depth as our in-person trainings — studied at your pace."
            align="left"
            className="max-w-none"
          />
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {BENEFITS.map(({ title, description, icon: Icon }, index) => (
            <motion.div
              key={title}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              variants={fadeUp}
              custom={index * 0.05}
              className="border border-ink/8 bg-sand/40 px-5 py-6"
            >
              <span className="flex size-11 items-center justify-center bg-primary text-white">
                <Icon size={20} />
              </span>
              <h3 className="mt-5 font-serif text-xl text-ink">{title}</h3>
              <p className="mt-2 type-body text-muted">{description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
