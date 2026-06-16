"use client";

import { useState } from "react";
import { beach_yoga, certificate } from "@/assets";
import { Container, SectionHeader } from "@/components/ui";
import FAQItem from "./FAQItem";

const FAQS = [
  {
    q: "How much does yoga teacher training cost in India?",
    a: "Yoga teacher training in India typically costs between $700 and $1,800. At Nirvana, our 200-hour course starts at $649 all-inclusive — covering accommodation, three sattvic meals a day, course manual, excursions and Yoga Alliance certification.",
    image:
      "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1200&auto=format&fit=crop&q=80",
    tag: "Pricing",
  },
  {
    q: "Which certification is best for yoga teachers?",
    a: "Yoga Alliance USA is the most widely recognised yoga certification in the world. We offer RYT 200, RYT 300, and RYT 500-hour programs — all meeting international standards so you can teach confidently anywhere.",
    image: certificate,
    tag: "Certification",
  },
  {
    q: "Do I need prior yoga experience to join?",
    a: "No advanced experience is required for our 200-hour foundational course. An open heart, basic familiarity with yoga, and the willingness to commit fully are all you need. Our courses gently guide you from the ground up.",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80",
    tag: "Prerequisites",
  },
  {
    q: "What kind of food do you serve?",
    a: "Three nourishing sattvic vegetarian meals daily, prepared fresh with Ayurvedic balance and cold-pressed sunflower oil. Vegan and gluten-free options are available on request — just let us know at registration.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop&q=80",
    tag: "Nutrition",
  },
  {
    q: "Why is Rishikesh called the yoga capital of the world?",
    a: "Rishikesh is where ancient sages first practiced and taught yoga, on the banks of the Ganges and beneath the Himalayas. To this day seekers come here to feel its radiant spiritual energy and deep yogic culture firsthand.",
    image: beach_yoga,
    tag: "Heritage",
  },
  {
    q: "What does a typical day look like?",
    a: "Days begin around 6am with meditation and pranayama, followed by Hatha or Ashtanga practice, breakfast, philosophy and anatomy classes, lunch, rest, alignment workshops, evening practice, satsang or kirtan, and dinner. Sundays are reserved for excursions and rest.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80",
    tag: "Daily Vibe",
  },
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Split FAQs into two independent columns based on index
  const faqsWithIndex = FAQS.map((item, idx) => ({
    ...item,
    originalIndex: idx,
  }));
  const leftColumnFaqs = faqsWithIndex.filter((_, idx) => idx % 2 === 0);
  const rightColumnFaqs = faqsWithIndex.filter((_, idx) => idx % 2 !== 0);

  return (
    <section
      id="faq"
      className="bg-light-gray py-12 sm:py-14 lg:py-16 overflow-hidden"
    >
      <Container size="2xl">
        <SectionHeader
          align="center"
          eyebrow="Questions, answered"
          title="Frequently asked"
          className="mb-8 sm:mb-10 md:mb-16 mx-auto"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-5">
            {leftColumnFaqs.map((item) => (
              <FAQItem
                key={item.q}
                q={item.q}
                a={item.a}
                image={item.image}
                tag={item.tag}
                index={item.originalIndex}
                isActive={activeIndex === item.originalIndex}
                onToggle={() =>
                  setActiveIndex(
                    activeIndex === item.originalIndex
                      ? null
                      : item.originalIndex,
                  )
                }
              />
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-5">
            {rightColumnFaqs.map((item) => (
              <FAQItem
                key={item.q}
                q={item.q}
                a={item.a}
                image={item.image}
                tag={item.tag}
                index={item.originalIndex}
                isActive={activeIndex === item.originalIndex}
                onToggle={() =>
                  setActiveIndex(
                    activeIndex === item.originalIndex
                      ? null
                      : item.originalIndex,
                  )
                }
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
