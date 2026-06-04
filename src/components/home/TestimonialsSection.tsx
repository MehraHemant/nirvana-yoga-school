"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Container, SectionHeader } from "@/components/ui";
import { Google, Star, Tripadvisor } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type Testimonial = {
  name: string;
  country: string;
  course: string;
  source: "Google" | "Tripadvisor";
  quote: string;
};

const REVIEWS: Testimonial[] = [
  {
    name: "Usha Singh",
    country: "India",
    course: "200hr Yoga Nidra TTC",
    source: "Google",
    quote:
      "What a great experience! My experience at Nirvana Yoga School has been beyond what I ever expected. This place felt more like a family than just a school. Guru Dhruvji, in particular, paid special attention to our comfort, making sure every student had a calming environment both in the classroom and in our rooms. The music and speakers provided to each student were a wonderful touch that helped maintain a serene atmosphere.",
  },
  {
    name: "Ole Netek",
    country: "Denmark",
    course: "500hr Hatha Ashtanga YTT",
    source: "Google",
    quote:
      "Well Organized & Very Professional. Namaste! I've just completed the 200/500 hours Hatha Ashtanga Teacher training. The program was well organized & the school is very professional in terms of structure, responding & helping out. I am really thankful for the dedicated & passionate teachers at Nirvana! Overall I can really recommend this school to everyone! It's located in one of the quieter & greener parts of upper Tapovan.",
  },
  {
    name: "Niall Phelan",
    country: "Ireland",
    course: "500hr Advanced YTT",
    source: "Google",
    quote:
      "Best investment I have ever made, both in terms of my own wellbeing and in that I will be able to impart on others through the teaching knowledge and skills. Guru Dhruvaji made the experience especially magical and informative.",
  },
  {
    name: "Joan Nakazono",
    country: "USA",
    course: "200hr Yoga Teacher Training",
    source: "Tripadvisor",
    quote:
      "Once-in-a-lifetime Experience. I feel incredibly fortunate to have completed my 200-hour Yoga Teacher Training at Nirvana Yoga School. From the start, the professionalism, expertise, and unwavering support of the teachers truly stood out. Each instructor brought a deep understanding of yoga, not only in theory but also in practice, and their guidance was invaluable throughout the course.",
  },
  {
    name: "Beatrice Ani-Asamoah",
    country: "Ghana",
    course: "200hr Yoga Nidra TTC",
    source: "Tripadvisor",
    quote:
      "Incredible & Life Changing Experience. Nirvana Yoga School was an incredible experience for me, more than I ever imagined it would be. I spent a month in the 200 TTC focusing on yoga Nidra (and also Hatha, Philosophy, and more). It was my first time both in India and doing a TTC and I felt completely supported. The management and teachers are wonderful, patient, and very experienced.",
  },
  {
    name: "Eve Lesage",
    country: "France",
    course: "300hr Advanced YTT",
    source: "Tripadvisor",
    quote:
      "Very grateful for this training. I recently completed 300 hour Yoga Teacher Training at Nirvana, and it was an incredible journey. The instructors were so supportive, and truly passionate about yoga. I look up to them not only for their expertise but also for their genuine care in guiding us through the journey. The program offered a mix of theory, practice, and personal growth.",
  },
];

const AVATAR_COLORS = [
  { bg: "bg-primary/10", text: "text-primary", border: "border-primary/10" },
  {
    bg: "bg-secondary/10",
    text: "text-secondary",
    border: "border-secondary/10",
  },
  { bg: "bg-accent/20", text: "text-[#4a5f43]", border: "border-accent/20" },
  {
    bg: "bg-primary/5",
    text: "text-primary-dark",
    border: "border-primary/10",
  },
  { bg: "bg-[#e5ebe4]", text: "text-[#1a1410]", border: "border-ink/5" },
  { bg: "bg-[#fdf8f4]", text: "text-[#a32432]", border: "border-primary/5" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 120, damping: 18 },
  },
} as const;

function SourceBadge({ source }: { source: Testimonial["source"] }) {
  if (source === "Google") {
    return (
      <div className="flex items-center gap-1 text-[11px] font-semibold text-muted bg-neutral-50 px-2.5 py-0.5 rounded-full border border-neutral-100">
        <Google size={12} className="text-neutral-500" />
        <span className="font-sans">Google</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-[11px] font-semibold text-muted bg-neutral-50 px-2.5 py-0.5 rounded-full border border-neutral-100">
      <Tripadvisor size={12} className="text-neutral-500" />
      <span className="font-sans">Tripadvisor</span>
    </div>
  );
}

export default function TestimonialsSection() {
  const prefersReduced = useReducedMotion() ?? false;
  const [activeTab, setActiveTab] = useState<"Google" | "Tripadvisor">(
    "Google",
  );

  // Grouped reviews
  const activeReviews = REVIEWS.filter((r) => r.source === activeTab);

  return (
    <section
      id="reviews"
      className="relative w-full overflow-hidden bg-sand py-20 md:py-28 lg:py-0 lg:min-h-screen lg:flex lg:flex-col lg:justify-center"
    >
      {/* Subtle Ambient Radial Highlight */}
      <div
        className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-primary/3 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-secondary/3 blur-[100px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <Container size="2xl" className="w-full relative z-10">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
        >
          <SectionHeader
            align="center"
            eyebrow="Student Testimonials"
            title={
              <>
                5.0★ rating across{" "}
                <span className="italic text-primary">5,000+ reviews.</span>
              </>
            }
            description="Read the genuine experiences of seekers who completed their training at our sanctuary in Rishikesh."
            className="mx-auto !mb-8"
          />
        </motion.div>

        {/* Stripe-style Pill Source Tab Selector */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          custom={0.08}
          variants={fadeUp}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex p-1 bg-ink/5 rounded-full border border-ink/5 relative select-none">
            <button
              type="button"
              onClick={() => setActiveTab("Google")}
              className={`relative z-10 px-6 py-2.5 rounded-full type-ui font-bold transition-colors duration-300 cursor-pointer ${
                activeTab === "Google"
                  ? "text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              <span className="flex items-center gap-2 relative z-10">
                <Google
                  size={14}
                  className={
                    activeTab === "Google" ? "text-white" : "text-muted"
                  }
                />
                Google Reviews (1,200+)
              </span>
              {activeTab === "Google" && (
                <motion.div
                  layoutId="activeReviewsTabPill"
                  className="absolute inset-0 rounded-full bg-primary z-0"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("Tripadvisor")}
              className={`relative z-10 px-6 py-2.5 rounded-full type-ui font-bold transition-colors duration-300 cursor-pointer ${
                activeTab === "Tripadvisor"
                  ? "text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              <span className="flex items-center gap-2 relative z-10">
                <Tripadvisor
                  size={14}
                  className={
                    activeTab === "Tripadvisor" ? "text-white" : "text-muted"
                  }
                />
                Tripadvisor (800+)
              </span>
              {activeTab === "Tripadvisor" && (
                <motion.div
                  layoutId="activeReviewsTabPill"
                  className="absolute inset-0 rounded-full bg-secondary z-0"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          </div>
        </motion.div>

        {/* 3-Column Reviews Card Grid with Staggered Entrance */}
        <div className="w-full min-h-[360px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch"
            >
              {activeReviews.map((r, i) => {
                const initials = r.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("");
                // Select color set based on global index
                const globalIdx = REVIEWS.findIndex(
                  (rev) => rev.name === r.name,
                );
                const avatarColors =
                  AVATAR_COLORS[
                    globalIdx !== -1
                      ? globalIdx % AVATAR_COLORS.length
                      : i % AVATAR_COLORS.length
                  ];

                return (
                  <motion.figure
                    key={r.name}
                    variants={cardVariants}
                    whileHover={prefersReduced ? undefined : { y: -5 }}
                    className="group relative flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-7 md:p-8 h-full shadow-card border border-ink/5 hover:border-primary/10 transition-all duration-500 overflow-hidden"
                  >
                    {/* Decorative double quote mark SVG */}
                    <span
                      className="absolute top-4 right-8 font-serif text-7xl text-primary/5 select-none pointer-events-none transition-colors duration-500 group-hover:text-primary/10"
                      aria-hidden="true"
                    >
                      “
                    </span>

                    {/* Header Info */}
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-ink/5 mb-4">
                        <div
                          className="flex gap-0.5"
                          role="img"
                          aria-label="5 out of 5 stars"
                        >
                          {[0, 1, 2, 3, 4].map((starIdx) => (
                            <Star
                              key={starIdx}
                              size={13}
                              className="text-[#facc15] fill-[#facc15] shrink-0"
                            />
                          ))}
                        </div>
                        <SourceBadge source={r.source} />
                      </div>

                      {/* Quote Text */}
                      <blockquote className="text-xs sm:text-sm text-ink/85 leading-relaxed font-sans font-medium italic">
                        &ldquo;{r.quote}&rdquo;
                      </blockquote>
                    </div>

                    {/* Author layout */}
                    <figcaption className="mt-6 pt-5 border-t border-ink/5 flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border ${avatarColors.bg} ${avatarColors.text} ${avatarColors.border}`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-serif text-sm sm:text-base font-bold text-ink truncate">
                          {r.name}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-muted uppercase tracking-wider font-semibold truncate mt-0.5">
                          {r.country} · {r.course}
                        </div>
                      </div>
                    </figcaption>
                  </motion.figure>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
