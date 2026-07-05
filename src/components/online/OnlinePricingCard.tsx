"use client";

import type { PricingOption } from "@/components/courses/upcomingDatesShared";
import { Button } from "@/components/ui";
import { BadgeStar, Check } from "@/icons";
import { formatUsd, parseUsdPrice } from "./utils";

type OnlinePricingCardProps = {
  pricing: PricingOption;
  pricingDescription: string;
  certification: string;
  level: string;
  ctaPrimary: string;
  ctaPrimaryHref: string;
  ctaSecondary: string;
  ctaSecondaryHref: string;
  className?: string;
};

export default function OnlinePricingCard({
  pricing,
  pricingDescription,
  certification,
  level,
  ctaPrimary,
  ctaPrimaryHref,
  ctaSecondary,
  ctaSecondaryHref,
  className = "",
}: OnlinePricingCardProps) {
  const amount = parseUsdPrice(pricing.price);
  const originalAmount =
    pricing.originalPrice != null
      ? parseUsdPrice(pricing.originalPrice)
      : amount != null
        ? Math.round(amount / 0.8)
        : null;

  return (
    <div
      id="pricing"
      className={`online-pricing-card overflow-hidden rounded-3xl border border-secondary/15 bg-white shadow-card ${className}`}
    >
      <div className="bg-primary px-5 py-3 text-center">
        <p className="font-serif text-lg text-white">20% OFF</p>
        <p className="type-eyebrow mt-1 text-white/80">Limited time offer</p>
      </div>

      <div className="space-y-5 p-6">
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-primary">
            Use coupon code{" "}
            <span className="rounded-md bg-white px-2 py-0.5 font-mono tracking-wider">
              NIRVANA
            </span>
          </p>
          <p className="mt-1 text-xs text-muted">{pricingDescription}</p>
        </div>

        <ul className="space-y-2 text-sm text-ink/85">
          <li className="flex items-center gap-2">
            <Check size={14} className="text-primary" />
            {certification}
          </li>
          <li className="flex items-center gap-2">
            <Check size={14} className="text-primary" />
            {level}
          </li>
          <li className="flex items-center gap-2">
            <Check size={14} className="text-primary" />
            Lifetime access
          </li>
          <li className="flex items-center gap-2">
            <Check size={14} className="text-primary" />
            Self-paced
          </li>
        </ul>

        <div className="flex items-center justify-center gap-2 text-sm font-medium text-ink">
          <BadgeStar size={16} className="text-amber-500" />
          <span>4.9</span>
          <span className="text-muted">(223)</span>
        </div>

        <div className="flex items-end justify-center gap-3">
          {originalAmount != null && amount != null && (
            <p className="text-base text-muted line-through">
              {formatUsd(originalAmount)}
            </p>
          )}
          <p className="font-serif text-4xl text-secondary">{pricing.price}</p>
        </div>

        <div className="grid gap-3">
          <Button
            href={ctaSecondaryHref}
            variant="secondary"
            size="md"
            className="w-full"
            target="_blank"
            rel="noopener noreferrer"
          >
            {ctaSecondary}
          </Button>
          <Button
            href={ctaPrimaryHref}
            variant="primary"
            size="md"
            className="w-full"
            target="_blank"
            rel="noopener noreferrer"
          >
            {ctaPrimary}
          </Button>
        </div>

        <p className="text-center text-xs text-muted">
          Start your free trial today
        </p>
      </div>
    </div>
  );
}
