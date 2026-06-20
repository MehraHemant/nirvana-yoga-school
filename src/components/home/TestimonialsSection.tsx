"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Container, SectionHeader } from "@/components/ui";
import { REVIEWS, type Testimonial } from "@/data/reviews";
import { ChevronLeft, ChevronRight, Google, Star, Tripadvisor } from "@/icons";

const getStarColorClass = (source: string) => {
  if (source === "Google") return "text-[#facc15] fill-[#facc15]";
  if (source === "Tripadvisor") return "text-[#00af87] fill-[#00af87]";
  return "text-[#00b67a] fill-[#00b67a]";
};

// Slider transition animation configurations
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 32 },
      opacity: { duration: 0.25 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 32 },
      opacity: { duration: 0.25 },
    },
  }),
};

interface TestimonialCardProps {
  review: Testimonial;
}

function TestimonialCard({ review }: TestimonialCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = review.message.length > 280;

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[380px] md:min-h-[240px] pr-3 items-stretch gap-6 md:gap-8">
      {/* Practitioner Portrait */}
      <div className="w-full md:w-1/3 relative min-h-[220px] md:min-h-full rounded-2xl overflow-hidden bg-sand/20 shrink-0">
        <Image
          src={review.image}
          alt={`${review.name} - Testimonial`}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent md:hidden pointer-events-none" />
      </div>

      {/* Review text content */}
      <div className="w-full md:w-2/3 py-4 md:py-6 flex flex-col justify-center select-text">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-sans text-base md:text-lg font-bold text-ink leading-tight">
              {review.name}
            </h4>
            <div className="flex gap-0.5 mt-1" role="img" aria-label="5 stars">
              {[0, 1, 2, 3, 4].map((num) => (
                <Star
                  key={`card-star-${num}`}
                  size={12}
                  className={`${getStarColorClass(review.source)} shrink-0`}
                />
              ))}
            </div>
          </div>
        </div>

        <h5 className="type-display-sm font-semibold text-ink leading-snug mb-3">
          {review.title}
        </h5>

        <p className="type-body text-ink/75 leading-relaxed">
          {isLong && !isExpanded ? (
            <>
              &ldquo;{review.message.slice(0, 260)}...&rdquo;
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="text-primary font-semibold hover:underline ml-1.5 focus:outline-hidden cursor-pointer"
              >
                Read more
              </button>
            </>
          ) : (
            <>
              &ldquo;{review.message}&rdquo;
              {isLong && isExpanded && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="text-primary font-semibold hover:underline ml-1.5 focus:outline-hidden cursor-pointer"
                >
                  Read less
                </button>
              )}
            </>
          )}
        </p>
      </div>
    </div>
  );
}

interface TestimonialSliderProps {
  reviews: Testimonial[];
  autoplayInterval: number;
}

function TestimonialSlider({
  reviews,
  autoplayInterval,
}: TestimonialSliderProps) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);

  const activeIndex = Math.abs(page % reviews.length);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setPage(([prevPage, _]) => [prevPage + 1, 1]);
    }, autoplayInterval);
    return () => clearInterval(interval);
  }, [isHovered, autoplayInterval]);

  const activeReview = reviews[activeIndex];

  return (
    <section
      aria-label="Testimonial slider"
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden min-h-[380px] md:min-h-[240px] w-full relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full h-full"
          >
            <TestimonialCard review={activeReview} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Arrows */}
      <button
        type="button"
        onClick={() => paginate(-1)}
        className="absolute left-3 md:-left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white shadow-soft border border-ink/5 text-ink/75 hover:bg-primary hover:text-white transition-all cursor-pointer flex items-center justify-center"
        aria-label="Previous review"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        onClick={() => paginate(1)}
        className="absolute right-3 md:-right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white shadow-soft border border-ink/5 text-ink/75 hover:bg-primary hover:text-white transition-all cursor-pointer flex items-center justify-center"
        aria-label="Next review"
      >
        <ChevronRight size={16} />
      </button>
    </section>
  );
}

interface RatingCardProps {
  platform: "Google" | "Tripadvisor" | "Trustpilot";
  title: string;
  ratingText: string;
  link: string;
  ratingValue: number;
}

function RatingCard({
  platform,
  title,
  ratingText,
  ratingValue,
}: RatingCardProps) {
  const getBrandLogo = () => {
    if (platform === "Google") {
      return <Google size={32} />;
    }
    if (platform === "Tripadvisor") {
      return <Tripadvisor size={32} className="text-[#00af87]" />;
    }
    return (
      <div className="flex items-center justify-center bg-[#00b67a] rounded-full p-2 text-white shadow-xs">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-between h-full py-4">
      <div>
        <div className="flex justify-between items-center mb-6">
          {getBrandLogo()}
          <span className="type-eyebrow text-muted bg-white/60 px-2.5 py-1 rounded-full font-bold">
            Verified
          </span>
        </div>

        <h3 className="type-display-sm font-bold text-ink mb-1">{title}</h3>
        <p className="font-sans text-xs text-muted mb-4">
          Official Student Reviews
        </p>

        <div className="flex items-center gap-0.5 mb-2">
          {[0, 1, 2, 3, 4].map((num) => (
            <Star
              key={`rating-star-${num}`}
              size={16}
              className={`${
                num < Math.floor(ratingValue)
                  ? getStarColorClass(platform)
                  : "text-ink/10 fill-transparent"
              } shrink-0`}
            />
          ))}
        </div>
        <p className="font-sans text-2xl font-black text-ink">
          {ratingText}{" "}
          <span className="text-xs font-normal text-muted uppercase tracking-wider">
            rating
          </span>
        </p>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const googleReviews = REVIEWS.filter((r) => r.source === "Google");
  const tripadvisorReviews = REVIEWS.filter((r) => r.source === "Tripadvisor");
  const trustpilotReviews = REVIEWS.filter((r) => r.source === "Trustpilot");

  return (
    <section
      id="reviews"
      className="relative bg-sand py-20 md:py-28 overflow-hidden w-full"
    >
      {/* Decorative radial gradients */}
      <div
        className="absolute -top-32 right-1/4 w-[600px] h-[600px] bg-primary/3 blur-[140px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-secondary/3 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <Container size="2xl" className="relative z-10 w-full">
        {/* Header */}
        <div className="w-full text-center mb-16 max-w-2xl mx-auto">
          <SectionHeader
            align="center"
            eyebrow="Testimonials"
            title={
              <>
                What Students Say About{" "}
                <span className="text-primary font-medium">
                  Nirvana Yoga School
                </span>
              </>
            }
            description="Read the authentic transformation stories of practitioners from all corners of the globe who completed their lineages here."
          />
        </div>

        {/* 3 Rows corresponding to platforms */}
        <div className="space-y-12 md:space-y-16 w-full">
          {/* Row 1: Google Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch w-full pt-12 md:pt-16 first:pt-0">
            <div className="lg:col-span-1">
              <RatingCard
                platform="Google"
                title="Google Reviews"
                ratingText="5.0 / 5.0"
                ratingValue={5}
                link="https://g.co/kgs/cftBiC3"
              />
            </div>
            <div className="lg:col-span-3 relative">
              <TestimonialSlider
                reviews={googleReviews}
                autoplayInterval={3200}
              />
            </div>
          </div>

          {/* Row 2: TripAdvisor Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch w-full pt-12 md:pt-16 first:pt-0">
            <div className="lg:col-span-1">
              <RatingCard
                platform="Tripadvisor"
                title="TripAdvisor Reviews"
                ratingText="5.0 / 5.0"
                ratingValue={5}
                link="https://www.tripadvisor.com/Attraction_Review-g580106-d27745947-Reviews-Nirvana_Yoga_School-Rishikesh_Dehradun_District_Uttarakhand.html"
              />
            </div>
            <div className="lg:col-span-3 relative">
              <TestimonialSlider
                reviews={tripadvisorReviews}
                autoplayInterval={4200}
              />
            </div>
          </div>

          {/* Row 3: Trustpilot Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch w-full pt-12 md:pt-16 first:pt-0">
            <div className="lg:col-span-1">
              <RatingCard
                platform="Trustpilot"
                title="Trustpilot Reviews"
                ratingText="4.7 / 5.0"
                ratingValue={4.7}
                link="https://www.trustpilot.com/review/nirvanayogaschoolindia.com"
              />
            </div>
            <div className="lg:col-span-3 relative">
              <TestimonialSlider
                reviews={trustpilotReviews}
                autoplayInterval={3500}
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
