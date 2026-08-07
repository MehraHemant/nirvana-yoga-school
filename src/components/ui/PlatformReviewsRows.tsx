"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type {
  ReviewsContent,
  SharedReview,
} from "@/content/types/shared-sections";
import { ChevronLeft, ChevronRight, Google, Star, Tripadvisor } from "@/icons";

type Testimonial = SharedReview;

const getStarColorClass = (source: string) => {
  if (source === "Google") return "text-[#facc15] fill-[#facc15]";
  if (source === "Tripadvisor") return "text-[#00af87] fill-[#00af87]";
  return "text-[#00b67a] fill-[#00b67a]";
};

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

function TestimonialCard({ review }: { review: Testimonial }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const messageId = useId();

  useEffect(() => {
    if (isExpanded) return;

    const message = messageRef.current;
    if (!message) return;

    const updateTruncation = () => {
      setIsTruncated(message.scrollHeight > message.clientHeight);
    };
    updateTruncation();

    const observer = new ResizeObserver(updateTruncation);
    observer.observe(message);
    return () => observer.disconnect();
  }, [isExpanded]);

  return (
    <div className="flex h-full min-h-[380px] flex-col items-stretch gap-6 pr-3 md:min-h-[240px] md:flex-row md:gap-8">
      <div className="relative h-55 w-full shrink-0 overflow-hidden rounded-2xl md:h-60 md:w-1/3">
        <Image
          src={review.image}
          alt={`${review.name} - Testimonial`}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent md:hidden" />
      </div>

      <div className="flex w-full flex-col justify-center py-4 select-text md:w-2/3 md:py-6">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h4 className="font-sans text-base font-bold leading-tight text-ink md:text-lg">
              {review.name}
            </h4>
            <div className="mt-1 flex gap-0.5" role="img" aria-label="5 stars">
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

        <h5 className="type-display-sm mb-3 font-semibold leading-snug text-ink">
          {review.title}
        </h5>

        <div className="relative">
          <p
            ref={messageRef}
            id={messageId}
            className={`type-body leading-relaxed text-ink/75 ${
              isExpanded ? "" : "line-clamp-4 h-[4lh]"
            }`}
          >
            &ldquo;{review.message}&rdquo;
          </p>
          {isTruncated && !isExpanded ? (
            <button
              type="button"
              aria-controls={messageId}
              aria-expanded={false}
              onClick={() => setIsExpanded(true)}
              className="absolute right-0 bottom-0 z-10 cursor-pointer whitespace-nowrap bg-linear-to-l from-white from-40% to-transparent pl-10 leading-relaxed font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Read more
            </button>
          ) : null}
          {isExpanded ? (
            <button
              type="button"
              aria-controls={messageId}
              aria-expanded={true}
              onClick={() => setIsExpanded(false)}
              className="mt-1.5 w-fit cursor-pointer font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Show less
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TestimonialSlider({
  reviews,
  autoplayInterval,
}: {
  reviews: Testimonial[];
  autoplayInterval: number;
}) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);

  const activeIndex = Math.abs(page % reviews.length);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    if (isHovered || reviews.length <= 1) return;
    const interval = setInterval(() => {
      setPage(([prevPage]) => [prevPage + 1, 1]);
    }, autoplayInterval);
    return () => clearInterval(interval);
  }, [isHovered, autoplayInterval, reviews.length]);

  const activeReview = reviews[activeIndex];
  if (!activeReview) return null;

  return (
    <section
      aria-label="Testimonial slider"
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex w-full items-center gap-2 sm:gap-3">
        {reviews.length > 1 ? (
          <button
            type="button"
            onClick={() => paginate(-1)}
            className="z-20 flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink/5 bg-white p-2.5 text-ink/75 shadow-soft transition-all hover:bg-primary hover:text-white"
            aria-label="Previous review"
          >
            <ChevronLeft size={16} />
          </button>
        ) : null}

        <div className="relative min-h-[380px] min-w-0 flex-1 overflow-hidden md:min-h-[240px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="h-full w-full"
            >
              <TestimonialCard review={activeReview} />
            </motion.div>
          </AnimatePresence>
        </div>

        {reviews.length > 1 ? (
          <button
            type="button"
            onClick={() => paginate(1)}
            className="z-20 flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink/5 bg-white p-2.5 text-ink/75 shadow-soft transition-all hover:bg-primary hover:text-white"
            aria-label="Next review"
          >
            <ChevronRight size={16} />
          </button>
        ) : null}
      </div>
    </section>
  );
}

function RatingCard({
  platform,
  title,
  ratingText,
  ratingValue,
  link,
}: {
  platform: "Google" | "Tripadvisor" | "Trustpilot";
  title: string;
  ratingText: string;
  link: string;
  ratingValue: number;
}) {
  const getBrandLogo = () => {
    if (platform === "Google") return <Google size={32} />;
    if (platform === "Tripadvisor") {
      return <Tripadvisor size={32} className="text-[#00af87]" />;
    }
    return (
      <div className="flex items-center justify-center rounded-full bg-[#00b67a] p-2 text-white shadow-xs">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </div>
    );
  };

  const content = (
    <div className="flex h-full flex-col justify-between py-4">
      <div>
        <div className="mb-6 flex items-center justify-between">
          {getBrandLogo()}
          <span className="type-eyebrow rounded-full bg-white/60 px-2.5 py-1 font-bold text-muted">
            Verified
          </span>
        </div>

        <h3 className="type-display-sm mb-1 font-bold text-ink">{title}</h3>
        <p className="mb-4 font-sans text-xs text-muted">
          Official Student Reviews
        </p>

        <div className="mb-2 flex items-center gap-0.5">
          {[0, 1, 2, 3, 4].map((num) => (
            <Star
              key={`rating-star-${num}`}
              size={16}
              className={`${
                num < Math.floor(ratingValue)
                  ? getStarColorClass(platform)
                  : "fill-transparent text-ink/10"
              } shrink-0`}
            />
          ))}
        </div>
        <p className="font-sans text-2xl font-black text-ink">
          {ratingText}{" "}
          <span className="text-xs font-normal uppercase tracking-wider text-muted">
            rating
          </span>
        </p>
      </div>
    </div>
  );

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-opacity hover:opacity-85"
      >
        {content}
      </a>
    );
  }

  return content;
}

type PlatformReviewsRowsProps = {
  className?: string;
  /** Server-provided reviews content */
  content?: ReviewsContent | null;
};

/**
 * Google, TripAdvisor, and Trustpilot review rows — shared by home and course pages.
 *
 * @param props - Optional className and server-provided reviews content
 */
export default function PlatformReviewsRows({
  className = "",
  content = null,
}: PlatformReviewsRowsProps) {
  if (!content) return null;

  const reviews = content.reviews ?? [];
  const googleReviews = reviews.filter((r) => r.source === "Google");
  const tripadvisorReviews = reviews.filter((r) => r.source === "Tripadvisor");
  const trustpilotReviews = reviews.filter((r) => r.source === "Trustpilot");

  return (
    <div className={`w-full space-y-8 md:space-y-10 ${className}`}>
      <div className="grid w-full grid-cols-1 items-stretch gap-6 rounded-3xl p-5 md:p-6 lg:grid-cols-4 lg:gap-8">
        <div className="lg:col-span-1">
          <RatingCard
            platform="Google"
            title="Google Reviews"
            ratingText="5.0 / 5.0"
            ratingValue={5}
            link="https://g.co/kgs/cftBiC3"
          />
        </div>
        <div className="relative lg:col-span-3">
          <TestimonialSlider reviews={googleReviews} autoplayInterval={3200} />
        </div>
      </div>

      <div className="grid w-full grid-cols-1 items-stretch gap-6 rounded-3xl p-5 md:p-6 lg:grid-cols-4 lg:gap-8">
        <div className="lg:col-span-1">
          <RatingCard
            platform="Tripadvisor"
            title="TripAdvisor Reviews"
            ratingText="5.0 / 5.0"
            ratingValue={5}
            link="https://www.tripadvisor.com/Attraction_Review-g580106-d27745947-Reviews-Nirvana_Yoga_School-Rishikesh_Dehradun_District_Uttarakhand.html"
          />
        </div>
        <div className="relative lg:col-span-3">
          <TestimonialSlider
            reviews={tripadvisorReviews}
            autoplayInterval={4200}
          />
        </div>
      </div>

      <div className="grid w-full grid-cols-1 items-stretch gap-6 rounded-3xl p-5 md:p-6 lg:grid-cols-4 lg:gap-8">
        <div className="lg:col-span-1">
          <RatingCard
            platform="Trustpilot"
            title="Trustpilot Reviews"
            ratingText="4.7 / 5.0"
            ratingValue={4.7}
            link="https://www.trustpilot.com/review/nirvanayogaschoolindia.com"
          />
        </div>
        <div className="relative lg:col-span-3">
          <TestimonialSlider
            reviews={trustpilotReviews}
            autoplayInterval={3500}
          />
        </div>
      </div>
    </div>
  );
}
