"use client";

import type { PricingOption } from "@/components/courses/upcomingDatesShared";
import { Button } from "@/components/ui";
import type { RetreatOffer } from "@/content/types/retreat-page";
import { Check } from "@/icons";
import { retreatEnquireHref } from "./utils";

type RetreatPricingCardProps = {
  title: string;
  fee: string;
  offer?: RetreatOffer;
  pricing: PricingOption[];
  className?: string;
};

export default function RetreatPricingCard({
  title,
  fee,
  offer,
  pricing,
  className = "",
}: RetreatPricingCardProps) {
  return (
    <div
      className={`retreat-pricing-card overflow-hidden rounded-3xl border border-primary/20 bg-white shadow-soft transition-all duration-300 hover:shadow-card ${className}`}
    >
      {/* Early Bird Promo Banner */}
      <div className="bg-linear-to-r from-primary to-primary-dark px-6 py-4 text-center">
        <p className="font-serif text-xl font-medium text-white tracking-wide">
          🎉 {offer?.label ?? "Special Offer"}
        </p>
        {offer?.note && (
          <p className="type-eyebrow mt-1 text-white/80 font-sans tracking-widest text-[10px]">
            {offer.note}
          </p>
        )}
      </div>

      <div className="space-y-6 p-6 md:p-7">
        {/* Promotion details */}
        {offer && offer.items.length > 0 && (
          <ul className="space-y-2.5 text-sm text-ink/80 border-b border-primary/10 pb-5">
            {offer.items.map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="flex size-4 items-center justify-center rounded-full bg-emerald-55/10 text-emerald-600">
                  <Check size={11} strokeWidth={3} />
                </span>
                <span className="font-medium text-xs tracking-wide">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Room Price Options */}
        <div className="space-y-3.5 rounded-2xl border border-accent/15 bg-accent/5 p-4 sm:p-5">
          <p className="type-eyebrow text-accent font-semibold tracking-wider text-[10px] mb-2">
            Package Pricing
          </p>
          {pricing.map((option) => (
            <div
              key={option.roomType}
              className="flex items-center justify-between gap-3 border-b border-primary/10 pb-3 last:border-b-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-ink leading-tight">
                  {option.roomType}
                </p>
                <p className="text-[9px] text-muted mt-0.5">
                  Stay + Program + Meals
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-serif text-lg font-semibold text-primary leading-none">
                  {option.price}
                </p>
                {option.originalPrice && (
                  <p className="text-[10px] text-muted line-through mt-1">
                    {option.originalPrice}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="text-center pt-2">
          <p className="type-eyebrow text-muted/80 tracking-widest text-[9px]">
            Starting from
          </p>
          <p className="font-serif text-4xl font-semibold text-primary mt-1">
            {fee}
          </p>
        </div>

        {/* Enquire Button */}
        <Button
          href={retreatEnquireHref(title)}
          variant="primary"
          size="lg"
          className="w-full shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20"
          target="_blank"
          rel="noopener noreferrer"
        >
          Enquire & Book Now
        </Button>

        <p className="text-center text-[10px] text-muted/70 leading-relaxed font-medium">
          🔒 Secure booking directly with school team
        </p>
      </div>
    </div>
  );
}
