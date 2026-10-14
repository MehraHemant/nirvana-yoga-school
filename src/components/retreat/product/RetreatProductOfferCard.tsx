"use client";

import { formatUsd, parseUsdPrice } from "@/components/online/utils";
import { Button } from "@/components/ui";
import { Check } from "@/icons";
import type { RetreatProductOfferContent } from "./retreatProductTypes";

/** Display price assumes a 25% discount when original is omitted. */
const RETREAT_DISCOUNT_FACTOR = 0.75;

type RetreatProductOfferSelection = {
  price?: string;
  originalPrice?: string;
  roomLabel?: string;
  batch?: string;
};

type RetreatProductOfferCardProps = {
  offer: RetreatProductOfferContent;
  selection: RetreatProductOfferSelection;
  bookingHref: string;
  ready: boolean;
  pricingAnchor: string;
  className?: string;
};

/**
 * Sidebar (lg+) and in-flow mobile offer card.
 *
 * @param offer - Promo copy and default bullets
 * @param selection - Selected package price and labels
 * @param bookingHref - Reserve URL when selection is complete
 * @param ready - Whether room and batch are selected
 * @param pricingAnchor - Hash link to the pricing section
 */
export default function RetreatProductOfferCard({
  offer,
  selection,
  bookingHref,
  ready,
  pricingAnchor,
  className = "",
}: RetreatProductOfferCardProps) {
  const displayPrice = selection.price ?? offer.startingFee;
  const amount = parseUsdPrice(displayPrice);
  const listedOriginal = selection.originalPrice
    ? parseUsdPrice(selection.originalPrice)
    : null;
  const originalAmount = offer.listPriceOnly
    ? listedOriginal
    : (listedOriginal ??
      (amount != null ? Math.round(amount / RETREAT_DISCOUNT_FACTOR) : null));

  const primaryHref = ready ? bookingHref : pricingAnchor;
  const primaryLabel = ready ? "Book now" : "Select stay & date";

  return (
    <div
      className={`retreat-pricing-card overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-card ${className}`}
    >
      {offer.promoHeadline?.trim() ? (
        <div className="bg-primary px-5 py-3 text-center">
          <p className="text-lg font-semibold leading-[1.3] text-white">
            {offer.promoHeadline}
          </p>
          {offer.promoSubhead ? (
            <p className="type-eyebrow mt-1 text-white/80">
              {offer.promoSubhead}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-5 p-6">
        {offer.pricingDescription ? (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-primary">
              {offer.pricingDescription}
            </p>
          </div>
        ) : null}

        <ul className="space-y-2 text-sm text-ink">
          {offer.bullets.map((bullet) => (
            <li key={bullet} className="flex items-center gap-2">
              <Check size={14} className="shrink-0 text-primary" />
              {bullet}
            </li>
          ))}
        </ul>

        {ready && (selection.roomLabel || selection.batch) ? (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-ink">
            <p className="type-eyebrow text-primary">Your selection</p>
            {selection.roomLabel ? (
              <p className="mt-1 font-medium">{selection.roomLabel}</p>
            ) : null}
            {selection.batch ? (
              <p className="type-ui mt-0.5 text-ink/60">{selection.batch}</p>
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
