"use client";

import { useState } from "react";
import type { PricingOption } from "@/components/courses/upcomingDatesShared";
import { Button } from "@/components/ui";
import { retreatWhatsAppHref } from "@/content/mappers/retreat-page";
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
      title="Retreat Packages (Including Stay & Food)"
    >
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {pricing.map((option) => (
            <article
              key={option.roomType}
              className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-xs"
            >
              <h3 className="font-serif text-xl text-ink">{option.roomType}</h3>
              <div className="mt-2 flex flex-wrap items-baseline gap-2">
                <p className="font-serif text-2xl text-secondary">
                  {option.price}
                </p>
                {option.originalPrice && (
                  <p className="text-sm text-muted line-through">
                    {option.originalPrice}
                  </p>
                )}
              </div>
              <Button
                href={retreatWhatsAppHref(
                  duration,
                  option.roomType,
                  selectedBatch,
                )}
                variant="secondary"
                size="sm"
                className="mt-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                Reserve via WhatsApp
              </Button>
            </article>
          ))}
        </div>

        <div>
          <h3 className="font-serif text-2xl text-ink">Retreat Dates</h3>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-secondary/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-secondary/5 text-ink">
                <tr>
                  <th className="px-4 py-3 font-semibold">Month</th>
                  <th className="px-4 py-3 font-semibold">Available Seats</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => {
                  const selected = selectedBatch === batch.dates;
                  return (
                    <tr
                      key={batch.dates}
                      className={`border-t border-secondary/8 ${
                        selected ? "bg-secondary/5" : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedBatch(batch.dates)}
                          className="text-left font-medium text-ink hover:text-secondary"
                        >
                          {batch.dates}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted">{batch.spaces}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">
            Select a date row, then reserve your preferred room package above.
          </p>
        </div>
      </div>
    </RetreatSectionShell>
  );
}
