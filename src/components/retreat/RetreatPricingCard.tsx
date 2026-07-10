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
      className={`retreat-pricing-card overflow-hidden rounded-3xl border border-secondary/15 bg-white shadow-card ${className}`}
    >
      <div className="bg-primary px-5 py-3 text-center">
        <p className="font-serif text-lg text-white">
          {offer?.label ?? "25% OFF"}
        </p>
        {offer?.note && (
          <p className="type-eyebrow mt-1 text-white/80">{offer.note}</p>
        )}
      </div>

      <div className="space-y-5 p-6">
        {offer && offer.items.length > 0 && (
          <ul className="space-y-2 text-sm text-ink/85">
            {offer.items.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check size={14} className="text-secondary" />
                {item}
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-3 rounded-2xl border border-secondary/10 bg-secondary/5 p-4">
          {pricing.map((option) => (
            <div
              key={option.roomType}
              className="flex items-baseline justify-between gap-3 border-b border-secondary/10 pb-3 last:border-b-0 last:pb-0"
            >
              <p className="text-sm font-medium text-ink">{option.roomType}</p>
              <div className="text-right">
                <p className="font-serif text-lg text-secondary">
                  {option.price}
                </p>
                {option.originalPrice && (
                  <p className="text-xs text-muted line-through">
                    {option.originalPrice}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="type-eyebrow text-muted">Packages from</p>
          <p className="font-serif text-3xl text-secondary">{fee}</p>
        </div>

        <Button
          href={retreatEnquireHref(title)}
          variant="primary"
          size="md"
          className="w-full"
          target="_blank"
          rel="noopener noreferrer"
        >
          Enquire Now
        </Button>

        <p className="text-center text-xs text-muted">
          Includes stay, sattvic meals & full program
        </p>
      </div>
    </div>
  );
}
