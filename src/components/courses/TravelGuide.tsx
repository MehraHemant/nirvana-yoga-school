"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Container, SectionHeader } from "@/components/ui";
import { Plus } from "@/icons";
import { EASE_OUT, fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

export default function TravelGuide() {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const prefersReduced = useReducedMotion() ?? false;

  const topics = [
    {
      title: "Visa Requirements",
      content:
        "You will need a tourist Visa or an e-Visa to do a yoga course in India. The visa duration typically ranges from 30 to 180 days depending on your nationality. It is recommended to apply online for an e-Tourist Visa at least 15-30 days before departure.",
    },
    {
      title: "How to Reach the School",
      content:
        "First, book an international flight to New Delhi's Indira Gandhi International Airport (DEL). From Delhi, we recommend booking a domestic connection to Dehradun Jolly Grant Airport (DED). Dehradun is just a 45-minute drive from Rishikesh, and we offer a complimentary taxi pick-up service from Dehradun Airport directly to our school for all registered students. Alternatively, we can arrange Delhi Airport pickups for a charge of $80 USD.",
    },
    {
      title: "Weather in Rishikesh",
      content:
        "Rishikesh experiences three distinct seasons: Winter (October to February) is cool and crisp, with December and January requiring warm jackets. Summer (March to June) is warm to hot, with May and June reaching peak temperatures. The Monsoon (July to September) brings cooling rain showers that make the surrounding Himalayan hills lush and green.",
    },
    {
      title: "What to Pack",
      content:
        "Pack comfortable, modest clothing suitable for yoga practice. White or light-colored attire is highly traditional and ideal for meditation sessions. Make sure to bring personal toiletries, walking shoes for excursions, and a light jacket if arriving in winter. All other study kits, yoga blocks, mats, and textbooks are fully provided.",
    },
    {
      title: "Currency & Stores",
      content:
        "Our school is located in Tapovan, a safe and peaceful neighborhood popular with international seekers. Local cafes, convenience stores, pharmacies, and certified currency exchange centers are all within a 10-minute walk. ATMs are widely available, and foreign currency can easily be exchanged locally or at the airport.",
    },
    {
      title: "Plugs & Electrical Outlets",
      content:
        "India primarily uses Types C, D, and M plugs with a standard voltage of 230V and 50Hz. We suggest bringing a universal adapter to charge your laptops, phones, and travel accessories comfortably.",
    },
  ];

  return (
    <section
      id="travel"
      className="py-20 sm:py-28 bg-sand border-b border-ink/5"
    >
      <Container size="xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <SectionHeader
            eyebrow="Logistics"
            title={
              <>
                Guide to Travelling to{" "}
                <span className="text-primary italic">India</span>
              </>
            }
            align="center"
          />
          <p className="type-lead text-muted mt-6 max-w-xl mx-auto font-sans text-base sm:text-lg">
            Travelling to a new country can feel daunting. We have compiled this
            practical guide covering visas, flights, and local tips to make your
            journey to Rishikesh as smooth as possible.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {topics.map((topic, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={topic.title}
                className={`rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? "border-primary bg-white shadow-soft"
                    : "border-ink/10 bg-white/70 hover:border-primary/50 hover:bg-white"
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <span className="type-display-sm text-ink">
                    {topic.title}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? "bg-primary text-white" : "bg-ink/5 text-ink"
                    }`}
                  >
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={
                        prefersReduced ? { duration: 0 } : { duration: 0.2 }
                      }
                      className="flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </motion.span>
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
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
                          : { duration: 0.3, ease: EASE_OUT }
                      }
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-ink/5">
                        <p className="type-body text-muted leading-relaxed font-sans text-sm sm:text-base">
                          {topic.content}
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
