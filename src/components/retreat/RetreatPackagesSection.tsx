"use client";

import Image from "next/image";
import { useState } from "react";
import type { PricingOption } from "@/components/courses/upcomingDatesShared";
import { Button } from "@/components/ui";
import { retreatWhatsAppHref } from "@/content/mappers/retreat-page";
import { Check } from "@/icons";
import RetreatSectionShell from "./RetreatSectionShell";

type Batch = {
  dates: string;
  status: string;
  spaces: string;
  statusColor: string;
};

type RetreatPackagesSectionProps = {
  duration: string;
  pricing: PricingOption[];
  batches: Batch[];
};

export default function RetreatPackagesSection({
  duration,
  pricing,
  batches,
}: RetreatPackagesSectionProps) {
  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.dates ?? "");

  return (
    <RetreatSectionShell
      id="pricing"
      title="Retreat Packages & Dates"
      description="Choose your preferred dates below, then reserve a matching accommodation package. Packages include stay, three daily sattvic meals, and the full retreat program."
    >
      <div className="space-y-12">
        {/* Step 1: Date Selector */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/10 text-[11px] font-bold text-secondary">
              1
            </span>
            <h3 className="font-serif text-xl font-medium text-ink">
              Select your retreat dates
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {batches.map((batch) => {
              const selected = selectedBatch === batch.dates;
              const isFillingFast =
                /left/i.test(batch.spaces) || /filling/i.test(batch.status);

              return (
                <button
                  key={batch.dates}
                  type="button"
                  onClick={() => setSelectedBatch(batch.dates)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                    selected
                      ? "border-secondary bg-secondary/[0.02] ring-1 ring-secondary shadow-sm"
                      : "border-secondary/15 bg-white hover:border-secondary/30 hover:shadow-xs"
                  }`}
                >
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold ${selected ? "text-secondary" : "text-ink"}`}
                    >
                      {batch.dates}
                    </p>
                    <p className="text-[11px] text-muted mt-1 leading-relaxed">
                      {duration} Program
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                        isFillingFast
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }`}
                    >
                      <span
                        className={`h-1 w-1 rounded-full ${isFillingFast ? "bg-amber-500" : "bg-emerald-500"}`}
                      />
                      {batch.spaces}
                    </span>

                    <span
                      className={`text-[10px] font-medium transition-opacity ${
                        selected
                          ? "text-secondary opacity-100"
                          : "text-primary opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {selected ? "✓ Selected" : "Select →"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Package Booking Cards */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/10 text-[11px] font-bold text-secondary">
              2
            </span>
            <h3 className="font-serif text-xl font-medium text-ink">
              Choose your lodging package
            </h3>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {pricing.map((option) => (
              <article
                key={option.roomType}
                className="group flex flex-col overflow-hidden rounded-3xl border border-secondary/15 bg-white shadow-xs transition-all duration-300 hover:border-secondary/25 hover:shadow-soft"
              >
                {/* Room Image */}
                {option.image && (
                  <div className="relative aspect-video w-full overflow-hidden bg-secondary/5 border-b border-secondary/10">
                    <Image
                      src={option.image}
                      alt={option.roomType}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-103"
                    />
                    <div className="absolute top-3 right-3 rounded-full bg-secondary/90 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-white">
                      Stay + Food included
                    </div>
                  </div>
                )}

                {/* Package Info */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-serif text-xl font-medium text-ink leading-tight">
                      {option.roomType}
                    </h4>
                    <div className="text-right shrink-0">
                      <p className="font-serif text-2xl font-semibold text-secondary leading-none">
                        {option.price}
                      </p>
                      {option.originalPrice && (
                        <p className="text-xs text-muted line-through mt-1">
                          {option.originalPrice}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted mt-2 leading-relaxed">
                    {option.description}
                  </p>

                  {/* Bullet features */}
                  <ul className="mt-4 space-y-2 text-xs text-ink/80 flex-1">
                    {option.features?.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <Check size={12} className="text-secondary shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Call to action */}
                  <div className="mt-6 pt-4 border-t border-secondary/10">
                    <Button
                      href={retreatWhatsAppHref(
                        duration,
                        option.roomType,
                        selectedBatch,
                      )}
                      variant={selectedBatch ? "primary" : "secondary"}
                      size="md"
                      className="w-full justify-center shadow-xs"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedBatch
                        ? `Book package for ${selectedBatch.split(" ")[0]}…`
                        : "Select Dates above to Book"}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </RetreatSectionShell>
  );
}
