"use client";

import { motion } from "framer-motion";
import { Container, SectionHeader } from "@/components/ui";
import { Check, Close } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

interface WhatIsIncludedProps {
  inclusions: string[];
  exclusions: string[];
}

export default function WhatIsIncluded({
  inclusions,
  exclusions,
}: WhatIsIncludedProps) {
  return (
    <section id="inclusions" className="py-20 sm:py-28 bg-sand/40 relative">
      <Container size="lg">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <SectionHeader
            eyebrow="Fine Print"
            title={
              <>
                What is <span className="text-primary italic">Included</span> in
                Your Fee
              </>
            }
            align="center"
          />
          <p className="type-lead text-muted mt-6 font-sans text-base sm:text-lg">
            We operate on complete transparency. Your program fee covers all
            essential living, training, and excursion expenses during your stay
            so you can immerse yourself fully in your learning.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto items-stretch">
          {/* Inclusions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT_ONCE}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-500/10 shadow-card flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 mb-6 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="type-eyebrow tracking-wider text-[9px]">
                  All-Inclusive Package
                </span>
              </div>
              <h3 className="type-h3 text-ink mb-6 flex items-center gap-3">
                Included in Your Tuition
              </h3>

              <ul className="space-y-4">
                {inclusions.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <Check size={11} className="stroke-[3]" />
                    </span>
                    <span className="text-sm sm:text-base text-ink/80 font-sans leading-relaxed font-medium">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-ink/5">
              <p className="text-xs text-muted font-sans italic">
                ✓ No extra taxes or surprise fees. Everything listed above is
                100% covered.
              </p>
            </div>
          </motion.div>

          {/* Exclusions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT_ONCE}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-3xl p-8 sm:p-10 border border-ink/5 shadow-card flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand text-muted mb-6 border border-ink/5">
                <span className="type-eyebrow tracking-wider text-[9px]">
                  Personal Planning
                </span>
              </div>
              <h3 className="type-h3 text-ink mb-6 flex items-center gap-3">
                Pre-Arrival Arrangements
              </h3>

              <ul className="space-y-4">
                {exclusions.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <span className="w-5 h-5 rounded-full bg-ink/5 text-muted flex items-center justify-center shrink-0 mt-0.5 border border-ink/10">
                      <Close size={10} className="stroke-[3]" />
                    </span>
                    <span className="text-sm sm:text-base text-muted font-sans leading-relaxed font-medium">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-ink/5 bg-sand/20 -mx-8 -mb-8 p-6 rounded-b-3xl border-t border-ink/5">
              <p className="text-xs text-muted font-sans leading-relaxed">
                ℹ <strong>Planning Tip:</strong> We are happy to help arrange
                taxi airport transfers (from Dehradun DED or Delhi DEL) upon
                request at cost-price. Contact us on WhatsApp after registering!
              </p>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
