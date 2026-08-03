"use client";

import { motion } from "framer-motion";
import type { StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";
import Container from "./Container";
import FAQItem from "./FAQItem";
import SectionHeader from "./SectionHeader";

export type FAQEntry = {
  question: string;
  answer: string;
  image?: string | StaticImageData;
  tag?: string;
};

export type FAQSectionProps = {
  id?: string;
  faqs: FAQEntry[];
  eyebrow?: string;
  title: ReactNode;
  align?: "left" | "center";
  sectionClassName?: string;
};

export default function FAQSection({
  id = "faq",
  faqs,
  eyebrow,
  title,
  align = "center",
  sectionClassName = "",
}: FAQSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const leftColumnFaqs = faqs.filter((_, index) => index % 2 === 0);
  const rightColumnFaqs = faqs.filter((_, index) => index % 2 !== 0);

  const renderItem = (faq: FAQEntry, index: number) => (
    <FAQItem
      key={faq.question}
      question={faq.question}
      answer={faq.answer}
      image={faq.image}
      tag={faq.tag}
      index={index}
      isActive={activeIndex === index}
      onToggle={() =>
        setActiveIndex((current) => (current === index ? null : index))
      }
    />
  );

  return (
    <section
      id={id}
      className={`overflow-hidden py-12 sm:py-14 lg:py-16 ${sectionClassName || "bg-light-gray"}`}
    >
      <Container size="2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className={`mb-8 sm:mb-10 md:mb-16 ${
            align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"
          }`}
        >
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            align={align}
            className={align === "center" ? "mx-auto" : undefined}
          />
        </motion.div>

        {faqs.length > 0 ? (
          <div className="grid grid-cols-1 items-start gap-5 sm:gap-6 lg:grid-cols-2">
            <div className="space-y-4 sm:space-y-5">
              {leftColumnFaqs.map((faq, index) => renderItem(faq, index * 2))}
            </div>
            <div className="space-y-4 sm:space-y-5">
              {rightColumnFaqs.map((faq, index) =>
                renderItem(faq, index * 2 + 1),
              )}
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
