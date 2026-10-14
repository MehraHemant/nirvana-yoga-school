"use client";

import { formatUsd, parseUsdPrice } from "@/components/online/utils";
import { Button } from "@/components/ui";
import { Check } from "@/icons";

/** Display price assumes a 25% discount when original is omitted. */
const RETREAT_DISCOUNT_FACTOR = 0.75;

type RetreatPricingCardProps = {
  promoHeadline: string;
  promoSubhead: string;
  pricingDescription: string;
  duration: string;
  fee: string;
  selectedPrice?: string;
  selectedOriginalPrice?: string;
  selectedDate?: string;
  selectedRoomLabel?: string;
  bookingHref: string;
  ready: boolean;
  pricingAnchor: string;
  className?: string;
};

/**
 * Sticky retreat offer card — mirrors the online course pricing sidebar.
 *
 * @param props - CMS promo copy, selection state, and booking links
 */
export default function RetreatPricingCard({
  promoHeadline,
  promoSubhead,
  pricingDescription,
  duration,
  fee,
  selectedPrice,
  selectedOriginalPrice,
  selectedDate,
  selectedRoomLabel,
  bookingHref,
  ready,
  pricingAnchor,
  className = "",
}: RetreatPricingCardProps) {
  const displayPrice = selectedPrice ?? fee;
  const amount = parseUsdPrice(displayPrice);
  const listedOriginal = selectedOriginalPrice
    ? parseUsdPrice(selectedOriginalPrice)
    : null;
  const originalAmount =
    listedOriginal ??
    (amount != null ? Math.round(amount / RETREAT_DISCOUNT_FACTOR) : null);

  const primaryHref = ready ? bookingHref : pricingAnchor;
  const primaryLabel = ready ? "Book now" : "Select stay & date";

  return (
    <div
      className={`retreat-pricing-card overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-card ${className}`}
    >
      <div className="bg-primary px-5 py-3 text-center">
        <p className="text-lg font-semibold leading-[1.3] text-white">
          {promoHeadline}
        </p>
        {promoSubhead ? (
          <p className="type-eyebrow mt-1 text-white/80">{promoSubhead}</p>
        ) : null}
      </div>

      <div className="space-y-5 p-6">
        {pricingDescription ? (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-primary">
              {pricingDescription}
            </p>
          </div>
        ) : null}

        <ul className="space-y-2 text-sm text-ink">
          {duration ? (
            <li className="flex items-center gap-2">
              <Check size={14} className="shrink-0 text-primary" />
              {duration}
            </li>
          ) : null}
          <li className="flex items-center gap-2">
            <Check size={14} className="shrink-0 text-primary" />
            Yoga, meditation & healing
          </li>
          <li className="flex items-center gap-2">
            <Check size={14} className="shrink-0 text-primary" />
            Stay & sattvic meals included
          </li>
          <li className="flex items-center gap-2">
            <Check size={14} className="shrink-0 text-primary" />
            Excursions & kirtan
          </li>
        </ul>

        {ready && (selectedRoomLabel || selectedDate) ? (
          <div className="rounded-xl border border-ink/8 bg-surface-muted/60 px-4 py-3 text-sm text-ink">
            {selectedRoomLabel ? (
              <p className="font-medium">{selectedRoomLabel}</p>
            ) : null}
            {selectedDate ? (
              <p className="type-ui mt-0.5 text-ink/60">{selectedDate}</p>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-end justify-center gap-3">
          {originalAmount != null && amount != null ? (
            <p className="text-base text-ink line-through">
              {formatUsd(originalAmount)}
            </p>
          ) : null}
          <p className="text-4xl font-semibold leading-[1.1] text-primary">
            {displayPrice}
          </p>
        </div>

        <div className="grid gap-3">
          <Button
            href={pricingAnchor}
            variant="ghost"
            size="md"
            className="w-full border border-primary/20 text-primary hover:bg-primary/5"
          >
            View dates & packages
          </Button>
          <Button
            href={primaryHref}
            variant="primary"
            size="md"
            className="w-full"
          >
            {primaryLabel}
          </Button>
        </div>

        <p className="text-center text-xs text-ink">
          Secure your spot with a flexible deposit
        </p>
      </div>
    </div>
  );
}
