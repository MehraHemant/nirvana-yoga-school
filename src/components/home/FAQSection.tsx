"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { beach_yoga, certificate } from "@/assets";
import { Container, SectionHeader } from "@/components/ui";
import { Plus } from "@/icons";
import { EASE_OUT } from "@/lib/motion";

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
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <section
      id="faq"
      className="bg-light-gray py-12 sm:py-14 lg:py-16 overflow-hidden"
    >
      <Container size="lg">
        <SectionHeader
          align="center"
          eyebrow="Questions, answered"
          title="Frequently asked"
          className="mb-8 sm:mb-10 md:mb-16 mx-auto"
        />

        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
          {FAQS.map((item, i) => {
            const isActive = activeIndex === i;
            return (
              <div
                key={item.q}
                className={`group relative rounded-2xl md:rounded-3xl border overflow-hidden bg-ink transition-all duration-500 ${
                  isActive
                    ? "border-primary/30 shadow-soft ring-1 ring-primary/10"
                    : "border-white/10 hover:border-white/20 hover:shadow-card"
                }`}
              >
                {/* Background Image Container */}
                <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 900px"
                    className={`object-cover transition-all duration-700 ease-out ${
                      isActive
                        ? "grayscale-0 scale-105 opacity-45"
                        : "grayscale opacity-25 scale-100 group-hover:grayscale-0 group-hover:scale-102 group-hover:opacity-40"
                    }`}
                    priority={i === 0}
                  />
                  {/* Linear gradient overlay for absolute text contrast */}
                  <div
                    className={`absolute inset-0 transition-colors duration-500 ${
                      isActive
                        ? "bg-linear-to-r from-primary/90 via-primary/75 to-transparent"
                        : "bg-linear-to-r from-primary/80 via-primary/60 to-transparent group-hover:from-primary/70 group-hover:via-primary/50"
                    }`}
                  />
                </div>

                {/* Question Trigger (Stays on top of background image) */}
                <button
                  type="button"
                  aria-expanded={isActive}
                  aria-controls={`faq-answer-${i}`}
                  onClick={() => setActiveIndex(isActive ? -1 : i)}
                  className="relative w-full flex items-center justify-between gap-4 p-5 sm:p-6 md:p-7 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 z-10"
                >
                  <span className="type-display-sm text-white font-medium leading-tight">
                    {item.q}
                  </span>
                  <span
                    className={`accordion-icon shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-white/10 text-white group-hover:bg-primary group-hover:text-white"
                    }`}
                  >
                    <motion.span
                      animate={{ rotate: isActive ? 45 : 0 }}
                      transition={
                        prefersReduced ? { duration: 0 } : { duration: 0.25 }
                      }
                      className="flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </motion.span>
                  </span>
                </button>

                {/* Answer Content Panel */}
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      id={`faq-answer-${i}`}
                      initial={
                        prefersReduced
                          ? { opacity: 1, height: "auto" }
                          : { height: 0, opacity: 0 }
                      }
                      animate={{ height: "auto", opacity: 1 }}
                      exit={
                        prefersReduced
                          ? { opacity: 0, height: 0 }
                          : { height: 0, opacity: 0 }
                      }
                      transition={
                        prefersReduced
                          ? { duration: 0 }
                          : { duration: 0.35, ease: EASE_OUT }
                      }
                      className="relative overflow-hidden z-10"
                    >
                      <div className="px-5 sm:px-6 md:px-7 pb-5 sm:pb-6 md:pb-7 border-t border-white/10 pt-4 max-w-3xl">
                        <span className="type-eyebrow text-accent tracking-wider font-semibold block mb-2">
                          {item.tag}
                        </span>
                        <p className="type-body text-white/85 leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
