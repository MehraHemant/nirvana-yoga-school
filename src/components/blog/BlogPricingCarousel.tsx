"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { BlogRailPricingTier } from "@/content/mappers/resolve-blog-rail-courses";
import { Bed, ChevronLeft, ChevronRight } from "@/icons";

type BlogPricingCarouselTier = BlogRailPricingTier & {
  /** Optional precomputed booking deep-link */
  bookHref?: string;
};

type BlogPricingCarouselProps = {
  tiers: BlogPricingCarouselTier[];
  /** Accessible label for the carousel region */
  label?: string;
};

/**
 * Splits a CMS price string into amount + currency for display.
 *
 * @param price - Raw price (e.g. "299 USD", "$649")
 */
function splitPriceLabel(price: string): { amount: string; suffix: string } {
  const trimmed = price.trim();
  const match = trimmed.match(/^\$?\s*([\d,]+(?:\.\d+)?)\s*(USD|INR)?$/i);
  if (match?.[1]) {
    return {
      amount: match[1].replace(/,/g, ""),
      suffix: (match[2] ?? "USD").toUpperCase(),
    };
  }
  return { amount: trimmed, suffix: "" };
}

/**
 * Horizontal scroll-snap carousel of room fee cards for the blog programs rail.
 * Peeks the next card; prev/next + counter when more than one tier.
 *
 * @param props - Priced room tiers (optionally with bookHref)
 */
export function BlogPricingCarousel({
  tiers,
  label = "Room pricing",
}: BlogPricingCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || tiers.length <= 1) return;

    /**
     * Syncs active index from scroll position for controls.
     */
    function syncActive() {
      if (!root) return;
      const children = Array.from(root.children) as HTMLElement[];
      if (children.length === 0) return;
      const left = root.scrollLeft;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      children.forEach((child, index) => {
        const dist = Math.abs(child.offsetLeft - left);
        if (dist < bestDist) {
          bestDist = dist;
          best = index;
        }
      });
      setActiveIndex(best);
    }

    syncActive();
    root.addEventListener("scroll", syncActive, { passive: true });
    return () => root.removeEventListener("scroll", syncActive);
  }, [tiers.length]);

  /**
   * Scrolls the carousel to a slide index.
   *
   * @param index - Target slide
   */
  function scrollTo(index: number) {
    const root = scrollerRef.current;
    if (!root) return;
    const child = root.children[index] as HTMLElement | undefined;
    if (!child) return;
    root.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
    setActiveIndex(index);
  }

  if (tiers.length === 0) return null;

  const showControls = tiers.length > 1;
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < tiers.length - 1;

  return (
    <div
      className="mt-4"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative">
        <div
          ref={scrollerRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth overscroll-x-contain pb-0.5 [-webkit-overflow-scrolling:touch]"
        >
          {tiers.map((tier, index) => {
            const { amount, suffix } = splitPriceLabel(tier.price);
            const was = tier.originalPrice?.trim()
              ? splitPriceLabel(tier.originalPrice)
              : null;
            const bookHref = tier.bookHref?.trim() || null;
            const image = tier.image?.trim() || "";
            const isLast = index === tiers.length - 1;

            return (
              <article
                key={`${tier.roomType}-${tier.price}`}
                className={`flex shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.04)] ${
                  showControls && !isLast
                    ? "w-[min(100%,15.75rem)]"
                    : "w-[min(100%,16.5rem)]"
                } ${showControls && !isLast ? "sm:w-[min(100%,16.25rem)]" : ""}`}
              >
                <div className="relative aspect-5/3 w-full overflow-hidden bg-surface-muted">
                  {image ? (
                    <Image
                      src={image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="280px"
                    />
                  ) : (
                    <span
                      className="absolute inset-0 flex items-center justify-center text-ink/30"
                      aria-hidden="true"
                    >
                      <Bed size={32} />
                    </span>
                  )}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink/25 to-transparent"
                    aria-hidden="true"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3.5">
                  <div className="min-w-0 space-y-1">
                    <h4 className="truncate text-[0.9375rem] font-semibold leading-5 tracking-tight text-ink">
                      {tier.roomType}
                    </h4>
                    {tier.fromDate ? (
                      <p className="text-xs font-medium leading-4 text-ink/55">
                        From{" "}
                        <span className="text-ink/75">{tier.fromDate}</span>
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-auto space-y-3 border-t border-ink/8 pt-3">
                    <div className="flex items-baseline gap-2">
                      {was ? (
                        <span className="text-xs tabular-nums text-ink/45 line-through">
                          {was.suffix
                            ? `${was.amount} ${was.suffix}`
                            : was.amount}
                        </span>
                      ) : null}
                      <p className="flex items-baseline gap-1.5">
                        <span className="text-[1.375rem] font-semibold leading-none tabular-nums tracking-tight text-primary">
                          {amount}
                        </span>
                        {suffix ? (
                          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-primary/70">
                            {suffix}
                          </span>
                        ) : null}
                      </p>
                    </div>

                    {bookHref ? (
                      <Link
                        href={bookHref}
                        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                      >
                        Book
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {showControls ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <p
            className="text-xs font-medium tabular-nums text-ink/50"
            aria-live="polite"
          >
            <span className="text-ink/80">{activeIndex + 1}</span>
            <span className="mx-1 text-ink/30">/</span>
            {tiers.length}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
              disabled={!canPrev}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/12 bg-white text-ink transition enabled:hover:border-primary/40 enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Previous room"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() =>
                scrollTo(Math.min(tiers.length - 1, activeIndex + 1))
              }
              disabled={!canNext}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/12 bg-white text-ink transition enabled:hover:border-primary/40 enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Next room"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
