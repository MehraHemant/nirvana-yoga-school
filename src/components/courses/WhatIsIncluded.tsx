"use client";

import { motion } from "framer-motion";
import { Container, SectionHeader } from "@/components/ui";
import {
  Bed,
  BookOpen,
  Certificate,
  Check,
  Close,
  Compass,
  HeroFlourish,
  Leaf,
  Plane,
  Shield,
  Wallet,
  Wifi,
} from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

interface WhatIsIncludedProps {
  inclusions: string[];
  exclusions: string[];
}

function getInclusionIcon(item: string) {
  const lower = item.toLowerCase();

  if (
    lower.includes("accommodation") ||
    lower.includes("lodging") ||
    lower.includes("nights")
  ) {
    return (
      <Bed
        size={18}
        className="text-secondary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  if (
    lower.includes("meal") ||
    lower.includes("food") ||
    lower.includes("vegetarian") ||
    lower.includes("organic")
  ) {
    return (
      <Leaf
        size={18}
        className="text-secondary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  if (
    lower.includes("certificate") ||
    lower.includes("alliance") ||
    lower.includes("ryt") ||
    lower.includes("qualification")
  ) {
    return (
      <Certificate
        size={18}
        className="text-secondary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  if (
    lower.includes("manual") ||
    lower.includes("textbook") ||
    lower.includes("book") ||
    lower.includes("kit")
  ) {
    return (
      <BookOpen
        size={18}
        className="text-secondary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  if (
    lower.includes("excursion") ||
    lower.includes("visit") ||
    lower.includes("temple") ||
    lower.includes("aarti") ||
    lower.includes("trek") ||
    lower.includes("massage")
  ) {
    return (
      <Compass
        size={18}
        className="text-secondary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  if (
    lower.includes("pickup") ||
    lower.includes("transit") ||
    lower.includes("airport") ||
    lower.includes("transfer") ||
    lower.includes("station")
  ) {
    return (
      <Plane
        size={18}
        className="text-secondary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  if (
    lower.includes("wi-fi") ||
    lower.includes("wifi") ||
    lower.includes("internet")
  ) {
    return (
      <Wifi
        size={18}
        className="text-secondary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  return (
    <Check
      size={14}
      className="text-secondary stroke-[2] group-hover:text-white transition-colors duration-200"
    />
  );
}

function getExclusionIcon(item: string) {
  const lower = item.toLowerCase();

  if (lower.includes("insurance") || lower.includes("recommend")) {
    return (
      <Shield
        size={18}
        className="text-primary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  if (
    lower.includes("flight") ||
    lower.includes("visa") ||
    lower.includes("airfare") ||
    lower.includes("travel")
  ) {
    return (
      <Plane
        size={18}
        className="text-primary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  if (
    lower.includes("personal") ||
    lower.includes("shopping") ||
    lower.includes("laundry") ||
    lower.includes("snack") ||
    lower.includes("spa")
  ) {
    return (
      <Wallet
        size={18}
        className="text-primary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  if (
    lower.includes("sunday") ||
    lower.includes("meals") ||
    lower.includes("meal")
  ) {
    return (
      <Leaf
        size={18}
        className="text-primary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  return (
    <Close
      size={12}
      className="text-primary stroke-[2] group-hover:text-white transition-colors duration-200"
    />
  );
}

export default function WhatIsIncluded({
  inclusions,
  exclusions,
}: WhatIsIncludedProps) {
  return (
    <section
      id="inclusions"
      className="py-16 lg:py-0 lg:min-h-[calc(100svh-4rem)] lg:flex lg:items-center bg-white relative overflow-hidden border-b border-ink/5"
    >
      {/* Background ambient glows */}
      <div className="absolute right-[-10%] top-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute left-[-10%] bottom-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px] pointer-events-none" />

      {/* Background geometric flourishes */}
      <div
        className="absolute left-[-15%] top-[10%] w-[350px] h-[350px] text-accent/8 pointer-events-none rotate-12"
        aria-hidden="true"
      >
        <HeroFlourish size={350} />
      </div>
      <div
        className="absolute right-[-12%] bottom-[-10%] w-[400px] h-[400px] text-primary/3 pointer-events-none"
        aria-hidden="true"
      >
        <HeroFlourish size={400} />
      </div>

      <Container size="xl" className="w-full">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 items-center">
          {/* Left Column: Section Header & Info (col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <SectionHeader
              eyebrow="Fine Print"
              title={
                <>
                  What is <span className="text-primary">Included</span> in Your
                  Fee
                </>
              }
              align="left"
              className="mb-0!"
            />
            <p className="type-body text-muted leading-relaxed font-sans text-base">
              We operate on complete transparency. Your program fee covers all
              essential living, training, and excursion expenses during your
              stay so you can focus entirely on your training.
            </p>

            {/* Minimalist Tip Box */}
            <div className="p-6 rounded-3xl bg-white/60 border border-ink/5 shadow-soft space-y-2 hover:bg-white transition-all duration-300">
              <span className="type-eyebrow text-secondary font-semibold block mb-1">
                Arrival Support
              </span>
              <p className="text-xs text-muted leading-relaxed font-sans font-light">
                We organize airport transfers (Dehradun DED or Haridwar station)
                upon request at cost-price. Contact us on WhatsApp for arrival
                support!
              </p>
            </div>
          </div>

          {/* Right Column: Comparative Card (col-span-7) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="lg:col-span-7 bg-white rounded-3xl p-8 lg:p-10 border border-ink/5 shadow-card hover:shadow-soft transition-all duration-300 grid sm:grid-cols-12 gap-8 relative overflow-hidden"
          >
            {/* Inclusions Panel (7 cols on sm) */}
            <div className="sm:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/15">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"
                  aria-hidden="true"
                />
                <span className="type-eyebrow text-[9px] font-bold tracking-wider">
                  Tuition Inclusions
                </span>
              </div>
              <h3 className="font-serif text-xl font-medium text-ink">
                Included in Your Package
              </h3>

              <ul className="space-y-4">
                {inclusions.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-4 group cursor-default"
                  >
                    <span
                      className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5 border border-secondary/15 group-hover:bg-secondary transition-all duration-300 shadow-2xs"
                      aria-hidden="true"
                    >
                      {getInclusionIcon(item)}
                    </span>
                    <span className="text-xs sm:text-[13px] text-ink/80 font-sans leading-relaxed group-hover:text-ink transition-colors duration-200">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exclusions Panel (5 cols on sm) */}
            <div className="sm:col-span-5 space-y-6 sm:border-l sm:border-ink/5 sm:pl-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/15">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
                  aria-hidden="true"
                />
                <span className="type-eyebrow text-[9px] font-bold tracking-wider">
                  Personal Exclusions
                </span>
              </div>
              <h3 className="font-serif text-xl font-medium text-ink">
                Out of Pocket
              </h3>

              <ul className="space-y-4">
                {exclusions.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-4 group cursor-default"
                  >
                    <span
                      className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary/15 group-hover:bg-primary transition-all duration-300 shadow-2xs"
                      aria-hidden="true"
                    >
                      {getExclusionIcon(item)}
                    </span>
                    <span className="text-xs sm:text-[13px] text-muted font-sans leading-relaxed group-hover:text-ink transition-colors duration-200">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom notice ribbon */}
            <div className="sm:col-span-12 mt-4 pt-6 border-t border-ink/5 text-[11px] text-muted font-sans flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-secondary"
                  aria-hidden="true"
                />
                ✓ No hidden registration fees or local taxes.
              </span>
              <span className="sm:text-right font-medium text-ink/75">
                All tuition-listed features are 100% covered.
              </span>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
