"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Container, SectionHeader } from "@/components/ui";
import { Google, Star, Tripadvisor } from "@/icons";
import { EASE_OUT, reducedTransition, VIEWPORT_ONCE } from "@/lib/motion";

type Testimonial = {
  name: string;
  country: string;
  course: string;
  source: "Google" | "Tripadvisor" | "Trustpilot";
  quote: string;
};

const REVIEWS: Testimonial[] = [
  // Google
  {
    name: "Usha Singh",
    country: "India",
    course: "200hr Yoga Nidra TTC",
    source: "Google",
    quote:
      "My experience at Nirvana Yoga School has been beyond what I ever expected. This place felt more like a family than just a school. Guru Dhruvji paid special attention to our comfort, making sure every student had a calming environment both in the classroom and in our rooms. The food was prepared with utmost care, ensuring it was sattvic and made with cold-pressed sunflower oil, which made the experience feel holistic.",
  },
  {
    name: "Ole Netek",
    country: "Denmark",
    course: "500hr Hatha Ashtanga YTT",
    source: "Google",
    quote:
      "Namaste! 🙏🏼 I’ve just completed the 200/500 hours Hatha Ashtanga Teacher training. The program was well organized & the school is very professional in terms of structure, responding & helping out. I am really thankful for the dedicated & passionate teachers at Nirvana! Overall I can really recommend this school to everyone! It's located in one of the quieter & greener parts of upper Tapovan.",
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
    name: "Valentina Catenacci",
    country: "Italy",
    course: "200hr Kundalini YTT",
    source: "Google",
    quote:
      "Nirvana Yoga school is an amazing place where you will learn so much more than what they state in their program! An amazing place to make meaningful connections and grow as a person. Highly recommended!",
  },
  // Tripadvisor
  {
    name: "Joan Nakazono",
    country: "USA",
    course: "200hr Yoga Teacher Training",
    source: "Tripadvisor",
    quote:
      "Once-in-a-lifetime Experience. I feel incredibly fortunate to have completed my 200-hour Yoga Teacher Training at Nirvana Yoga School. From the start, the professionalism, expertise, and unwavering support of the teachers truly stood out. Each instructor brought a deep understanding of yoga, and their guidance was invaluable throughout the course.",
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
      "Very grateful for this training. I recently completed 300 hour Yoga Teacher Training at Nirvana, and it was an incredible journey. The instructors were so supportive, and truly passionate about yoga. I look up to them not only for their expertise but also for their genuine care in guiding us through the journey.",
  },
  {
    name: "Agathe De Vargas",
    country: "France",
    course: "200hr Yoga Teacher Training",
    source: "Tripadvisor",
    quote:
      "Je souhaite prendre le temps de détailler mon avis sur Nirvana. Les professeurs sont de grande qualité, à l'écoute et enseignent le yoga traditionnellement. Les shalas sont grands et lumineux, et le bâtiment est calme, situé à la fin de Tapovan. La nourriture est saine et délicieuse.",
  },
  // Trustpilot
  {
    name: "Ujjwala Prasad",
    country: "India",
    course: "200hr Ayurveda Yoga TTC",
    source: "Trustpilot",
    quote:
      "I am so lucky and grateful to have been able to learn at such an incredible yoga school. The combination courses is what truly caught my eye at Nirvana and then everything that followed was just magical. The rooms, classes, and especially the kitchen staff for feeding us such nutritional meals. Can't wait to be back!",
  },
  {
    name: "Laetitia Haziza",
    country: "France",
    course: "300hr Advanced YTT",
    source: "Trustpilot",
    quote:
      "I had a great time at Nirvana school that I will never, never forget! The teachers are very professional and sweet. The Guru is so generous and I learned so much there. Be ready to be disciplined, ready to learn, and ready for a transformative experience!",
  },
  {
    name: "Swati Snigdha",
    country: "India",
    course: "500hr Yoga Teacher Training",
    source: "Trustpilot",
    quote:
      "Joining Nirvana Yoga School has been nothing short of life-changing. The 500-hour teacher training pushed me out of my comfort zone while helping me connect deeper with myself physically, mentally, and spiritually. The teachers were super supportive, blending traditional yoga practices with real-world insights.",
  },
  {
    name: "Corinne Germann",
    country: "Switzerland",
    course: "200hr Kundalini Yoga TTC",
    source: "Trustpilot",
    quote:
      "Im April 2025 war ich hier für das 200h Kundalini TTC. Eine Schule, die sich mit Herz für das Weitergeben des Wissens einsetzt. Lehrer:innen, die mit Elan und hoher Professionalität Erfahrungen weitergeben. Räume, in denen du dich wohlzustimmen, und ein traditionelles Kundalini-Yoga, das den Stamm und die Lineage aufzeigt.",
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

function PlatformHeader({
  source,
  count,
  rating,
}: {
  source: Testimonial["source"];
  count: string;
  rating: string;
}) {
  if (source === "Google") {
    return (
      <div className="flex items-center justify-between w-full bg-white/80 backdrop-blur-xs border border-ink/5 rounded-2xl p-3.5 shadow-xs mb-4 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
            <Google size={16} className="text-red-500" />
          </div>
          <div className="text-left">
            <h4 className="type-ui font-bold text-ink leading-tight">
              Google Reviews
            </h4>
            <p className="text-[10px] text-muted">{count}</p>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="type-ui font-bold text-ink text-xs">{rating}</span>
          <div className="flex gap-0.5 mt-0.5">
            {[0, 1, 2, 3, 4].map((starIdx) => (
              <Star
                key={starIdx}
                size={8}
                className="text-[#facc15] fill-[#facc15] shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (source === "Tripadvisor") {
    return (
      <div className="flex items-center justify-between w-full bg-white/80 backdrop-blur-xs border border-ink/5 rounded-2xl p-3.5 shadow-xs mb-4 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <Tripadvisor size={16} className="text-emerald-600" />
          </div>
          <div className="text-left">
            <h4 className="type-ui font-bold text-ink leading-tight">
              Tripadvisor
            </h4>
            <p className="text-[10px] text-muted">{count}</p>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="type-ui font-bold text-ink text-xs">{rating}</span>
          <div className="flex gap-0.5 mt-0.5">
            {[0, 1, 2, 3, 4].map((starIdx) => (
              <Star
                key={starIdx}
                size={8}
                className="text-emerald-500 fill-emerald-500 shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full bg-white/80 backdrop-blur-xs border border-ink/5 rounded-2xl p-3.5 shadow-xs mb-4 select-none">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
          <span className="w-5.5 h-5.5 rounded-full bg-[#00a568] flex items-center justify-center text-[9px] text-white font-bold">
            ★
          </span>
        </div>
        <div className="text-left">
          <h4 className="type-ui font-bold text-ink leading-tight">
            Trustpilot
          </h4>
          <p className="text-[10px] text-muted">{count}</p>
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <span className="type-ui font-bold text-ink text-xs">{rating}</span>
        <div className="flex gap-0.5 mt-0.5">
          {[0, 1, 2, 3, 4].map((starIdx) => (
            <Star
              key={starIdx}
              size={8}
              className="text-[#00a568] fill-[#00a568] shrink-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SourceBadge({ source }: { source: Testimonial["source"] }) {
  if (source === "Google") {
    return (
      <div className="flex items-center gap-1 text-[9px] font-semibold text-muted bg-neutral-50 px-1.5 py-0.5 rounded-full border border-neutral-100">
        <Google size={9} className="text-neutral-500" />
        <span className="font-sans">Google</span>
      </div>
    );
  }
  if (source === "Tripadvisor") {
    return (
      <div className="flex items-center gap-1 text-[9px] font-semibold text-muted bg-neutral-50 px-1.5 py-0.5 rounded-full border border-neutral-100">
        <Tripadvisor size={9} className="text-neutral-500" />
        <span className="font-sans">Tripadvisor</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-[9px] font-semibold text-muted bg-neutral-50 px-1.5 py-0.5 rounded-full border border-neutral-100">
      <span className="w-2.5 h-2.5 rounded-full bg-[#00a568] flex items-center justify-center text-[6px] text-white font-bold font-sans">
        ★
      </span>
      <span className="font-sans">Trustpilot</span>
    </div>
  );
}

export default function TestimonialsSection() {
  const prefersReduced = useReducedMotion() ?? false;

  // Grouped reviews
  const googleReviews = REVIEWS.filter((r) => r.source === "Google");
  const tripadvisorReviews = REVIEWS.filter((r) => r.source === "Tripadvisor");
  const trustpilotReviews = REVIEWS.filter((r) => r.source === "Trustpilot");

  // Stack orders per platform
  const [stackOrders, setStackOrders] = useState<{
    Google: number[];
    Tripadvisor: number[];
    Trustpilot: number[];
  }>({
    Google: googleReviews.map((_, i) => i),
    Tripadvisor: tripadvisorReviews.map((_, i) => i),
    Trustpilot: trustpilotReviews.map((_, i) => i),
  });

  const [swipingCardIndex, setSwipingCardIndex] = useState<{
    Google: number | null;
    Tripadvisor: number | null;
    Trustpilot: number | null;
  }>({
    Google: null,
    Tripadvisor: null,
    Trustpilot: null,
  });

  const handleCardClick = (
    platform: "Google" | "Tripadvisor" | "Trustpilot",
    reviewIndex: number,
    arrayIndex: number,
  ) => {
    if (prefersReduced) {
      setStackOrders((prev) => {
        const order = prev[platform];
        const newOrder = [...order.slice(1), order[0]];
        return { ...prev, [platform]: newOrder };
      });
      return;
    }

    if (arrayIndex !== 0 || swipingCardIndex[platform] !== null) return;

    setSwipingCardIndex((prev) => ({ ...prev, [platform]: reviewIndex }));

    setTimeout(() => {
      setStackOrders((prev) => {
        const order = prev[platform];
        const newOrder = [...order.slice(1), order[0]];
        return {
          ...prev,
          [platform]: newOrder,
        };
      });
      setSwipingCardIndex((prev) => ({ ...prev, [platform]: null }));
    }, 300);
  };

  const platforms = [
    {
      id: "Google" as const,
      reviews: googleReviews,
      count: "1,200+ Reviews",
      rating: "4.9/5.0",
    },
    {
      id: "Tripadvisor" as const,
      reviews: tripadvisorReviews,
      count: "800+ Reviews",
      rating: "5.0/5.0",
    },
    {
      id: "Trustpilot" as const,
      reviews: trustpilotReviews,
      count: "500+ Reviews",
      rating: "4.8/5.0",
    },
  ];

  return (
    <motion.section
      id="reviews"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={reducedTransition(prefersReduced, {
        duration: 0.6,
        ease: EASE_OUT,
      })}
      className="relative overflow-hidden bg-sand py-16 sm:py-20 lg:py-0 lg:h-[calc(100svh-5.5rem)] lg:min-h-[680px] lg:max-h-[880px] lg:flex lg:items-center w-full"
    >
      <div
        className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-primary/3 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-secondary/3 blur-[100px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <Container size="2xl" className="w-full relative z-10 lg:py-4">
        {/* Section Header */}
        <div className="w-full text-center mb-8">
          <SectionHeader
            align="center"
            eyebrow="Student Testimonials"
            title={
              <>
                Global Lineage.{" "}
                <span className="italic text-primary font-serif font-medium">
                  5,000+ Five-Star Reviews.
                </span>
              </>
            }
            description="Read the authentic journeys of practitioners from all corners of the globe who trained at our sanctuary."
            className="mx-auto"
          />

          <p className="type-ui text-muted inline-flex items-center gap-2 mt-3 bg-white/60 px-3.5 py-1.5 rounded-full border border-ink/5 shadow-xs animate-pulse text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Tap the top card of any stack to cycle reviews
          </p>
        </div>

        {/* Multi-Stack Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 mt-2 items-start w-full">
          {platforms.map((platform) => {
            const currentOrder = stackOrders[platform.id];
            const isPlatformSwiping = swipingCardIndex[platform.id] !== null;

            return (
              <div
                key={platform.id}
                className="flex flex-col items-center w-full"
              >
                {/* Platform Header */}
                <PlatformHeader
                  source={platform.id}
                  count={platform.count}
                  rating={platform.rating}
                />

                {/* Stack Container */}
                <div className="relative w-full max-w-[360px] h-[340px] sm:h-[380px] lg:h-[340px] flex items-center justify-center px-4 sm:px-0">
                  <AnimatePresence mode="popLayout">
                    {platform.reviews.map((r, i) => {
                      const pos = currentOrder.indexOf(i);
                      if (pos === -1) return null;

                      const isSwiping = swipingCardIndex[platform.id] === i;

                      // Shift positions up by 1 if a card is currently flying out
                      const displayPos = isPlatformSwiping
                        ? pos > 0
                          ? pos - 1
                          : 0
                        : pos;

                      // 3D positioning styles
                      const zIndex = isSwiping ? 40 : 30 - displayPos * 10;
                      const scale = isSwiping ? 0.95 : 1 - displayPos * 0.05;
                      const y = isSwiping ? 0 : displayPos * 14;
                      // Organic rotation
                      const rotate = isSwiping
                        ? 12
                        : displayPos === 0
                          ? 0
                          : displayPos === 1
                            ? -2
                            : 2;
                      const opacity = isSwiping
                        ? 0
                        : displayPos === 0
                          ? 1
                          : displayPos === 1
                            ? 0.85
                            : 0.6;
                      // Fly out direction
                      const x = isSwiping ? 380 : 0;

                      const initials = r.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("");

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
                          style={{ zIndex, originX: 0.5, originY: 0.5 }}
                          initial={
                            prefersReduced
                              ? false
                              : { opacity: 0, scale: 0.8, y: 50 }
                          }
                          animate={{
                            x,
                            y,
                            scale,
                            rotate,
                            opacity,
                            transition: {
                              type: "spring",
                              stiffness: 280,
                              damping: 24,
                              mass: 1,
                            },
                          }}
                          whileHover={
                            !prefersReduced &&
                            pos === 0 &&
                            swipingCardIndex[platform.id] === null
                              ? { y: -6, scale: 1.015 }
                              : undefined
                          }
                          onClick={() => handleCardClick(platform.id, i, pos)}
                          className={`group absolute inset-x-4 sm:inset-x-0 top-0 bottom-6 flex flex-col justify-between bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-ink/5 hover:border-primary/10 transition-colors duration-500 overflow-hidden cursor-pointer select-none ${
                            pos !== 0
                              ? "pointer-events-none"
                              : "pointer-events-auto"
                          }`}
                        >
                          {/* Decorative double quote mark SVG */}
                          <span
                            className="absolute top-3 right-5 font-serif text-5xl text-primary/5 select-none pointer-events-none transition-colors duration-500 group-hover:text-primary/10"
                            aria-hidden="true"
                          >
                            “
                          </span>

                          {/* Header Info */}
                          <div>
                            <div className="flex items-center justify-between pb-2.5 border-b border-ink/5 mb-3">
                              <div
                                className="flex gap-0.5"
                                role="img"
                                aria-label="5 out of 5 stars"
                              >
                                {[0, 1, 2, 3, 4].map((starIdx) => (
                                  <Star
                                    key={starIdx}
                                    size={10}
                                    className={`${
                                      platform.id === "Google"
                                        ? "text-[#facc15] fill-[#facc15]"
                                        : platform.id === "Tripadvisor"
                                          ? "text-emerald-500 fill-emerald-500"
                                          : "text-[#00a568] fill-[#00a568]"
                                    } shrink-0`}
                                  />
                                ))}
                              </div>
                              <SourceBadge source={r.source} />
                            </div>

                            {/* Quote Text */}
                            <blockquote className="text-[11px] sm:text-xs text-ink/85 leading-relaxed font-sans font-medium italic mt-1.5">
                              &ldquo;{r.quote}&rdquo;
                            </blockquote>
                          </div>

                          {/* Author layout */}
                          <figcaption className="mt-3 pt-3 border-t border-ink/5 flex items-center gap-2.5">
                            <div
                              className={`h-7.5 w-7.5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold border ${avatarColors.bg} ${avatarColors.text} ${avatarColors.border}`}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-serif text-[13px] font-bold text-ink truncate">
                                {r.name}
                              </div>
                              <div className="text-[9px] text-muted uppercase tracking-wider font-semibold truncate mt-0.5">
                                {r.country} · {r.course}
                              </div>
                            </div>
                          </figcaption>
                        </motion.figure>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Pagination Dots */}
                <div className="flex items-center justify-center gap-2 select-none relative z-10 -mt-2">
                  {platform.reviews.map((r, idx) => {
                    const isCurrent = currentOrder[0] === idx;
                    return (
                      <button
                        key={r.name}
                        type="button"
                        onClick={() => {
                          if (swipingCardIndex[platform.id] !== null) return;
                          const clickedPos = currentOrder.indexOf(idx);
                          if (clickedPos === 0) return;

                          setStackOrders((prev) => {
                            const order = prev[platform.id];
                            const clickIdx = order.indexOf(idx);
                            const newOrder = [
                              ...order.slice(clickIdx),
                              ...order.slice(0, clickIdx),
                            ];
                            return { ...prev, [platform.id]: newOrder };
                          });
                        }}
                        className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                          isCurrent
                            ? "bg-primary w-5"
                            : "bg-ink/20 w-1.5 hover:bg-ink/40"
                        }`}
                        aria-label={`Go to review ${idx + 1}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </motion.section>
  );
}
