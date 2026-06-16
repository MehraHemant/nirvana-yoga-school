"use client";

import { motion } from "framer-motion";
import { Container, SectionHeader } from "@/components/ui";
import { Check } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

interface CourseOverviewProps {
  overview: string;
  highlights: string[];
  level: string;
  duration: string;
}

export default function CourseOverview({
  overview,
  highlights,
  level,
  duration,
}: CourseOverviewProps) {
  return (
    <section
      id="overview"
      className="py-20 sm:py-28 bg-sand relative overflow-hidden"
    >
      {/* Decorative organic background shape */}
      <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <Container size="xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="grid gap-16 lg:grid-cols-12 lg:gap-20 items-start"
        >
          {/* Left: Editorial Content Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <SectionHeader
                eyebrow="The Inner Path"
                title={
                  <>
                    Transform your practice &amp;{" "}
                    <span className="text-primary italic">awaken</span> your
                    true purpose.
                  </>
                }
                align="left"
              />
            </div>

            {/* Dropcap paragraph */}
            <p className="type-lead text-muted leading-relaxed first-letter:text-5xl first-letter:font-serif first-letter:font-semibold first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-1">
              {overview}
            </p>

            {/* Editorial Blockquote */}
            <div className="border-l-2 border-primary/45 pl-6 py-2 my-8 bg-primary/[0.01]">
              <p className="font-serif italic text-base sm:text-lg md:text-xl text-ink leading-relaxed">
                "Yoga is not just physical posture; it is a sacred pathway to
                quieting the mind, understanding the self, and returning to the
                lineage of ancient wisdom."
              </p>
              <span className="type-eyebrow text-primary block mt-3">
                — Himalayan Lineage Teachings
              </span>
            </div>

            <p className="type-body text-muted leading-relaxed font-sans">
              Our residential yoga training program is designed to facilitate
              physical purification, emotional release, and intellectual
              understanding. By immersing yourself completely in the ashram
              lifecycle, you step away from modern distractions to cultivate
              discipline, self-inquiry, and authentic teachings handed down
              through generations.
            </p>

            {/* Metas Row */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-ink/10">
              <div className="bg-white/50 p-4 rounded-2xl border border-ink/5">
                <span className="type-eyebrow text-primary block mb-1">
                  Focus Level
                </span>
                <span className="type-display-sm text-ink font-medium">
                  {level}
                </span>
              </div>
              <div className="bg-white/50 p-4 rounded-2xl border border-ink/5">
                <span className="type-eyebrow text-primary block mb-1">
                  Immersive Duration
                </span>
                <span className="type-display-sm text-ink font-medium">
                  {duration}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Learning Outcomes Card Column */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-card border border-ink/5 relative overflow-hidden">
              {/* Subtle top decorative accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/50 to-primary" />

              <h3 className="type-h3 text-ink mb-8 pb-4 border-b border-ink/10">
                Key Learning Outcomes
              </h3>

              <div className="space-y-6">
                {highlights.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={VIEWPORT_ONCE}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-4 p-3.5 rounded-2xl hover:bg-sand/30 border border-transparent hover:border-ink/5 transition-all duration-300 group"
                  >
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <Check size={14} className="stroke-[3]" />
                    </span>
                    <div className="space-y-1">
                      <span className="type-ui text-ink font-semibold leading-normal font-sans block">
                        Module 0{index + 1}
                      </span>
                      <span className="text-sm text-muted font-sans font-medium leading-relaxed block">
                        {item}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom Transmission Badge */}
              <div className="mt-10 p-5 bg-paper rounded-2xl border border-accent/25">
                <span className="type-eyebrow text-primary font-semibold block mb-1">
                  Lineage Transmission
                </span>
                <p className="text-xs text-muted leading-relaxed font-sans">
                  Every class is taught by certified master teachers with
                  lineages rooted in the Himalayan caves, the Bihar School of
                  Yoga, and traditional ashrams.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
