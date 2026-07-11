"use client";

import { useState } from "react";
import { Button, Container, Heading, SectionHeader } from "@/components/ui";
import { Check } from "@/icons";
import {
  getBatchDates,
  type PricingOption,
  type UpcomingDatesProps,
  whatsAppHref,
} from "./upcomingDatesShared";

function savingsPct(price: string, original: string) {
  const p = Number.parseFloat(price.replace(/[^0-9.]/g, ""));
  const o = Number.parseFloat(original.replace(/[^0-9.]/g, ""));
  if (!p || !o || o <= p) return null;
  return `${Math.round((1 - p / o) * 100)}% off`;
}

function RoomCard({
  option,
  duration,
  selectedBatch,
  wide = false,
  buildHref = whatsAppHref,
}: {
  option: PricingOption;
  duration: string;
  selectedBatch: string;
  wide?: boolean;
  buildHref?: (duration: string, roomType: string, batch: string) => string;
}) {
  const noRoom = option.roomType.toLowerCase().includes("without");
  const saving = option.originalPrice
    ? savingsPct(option.price, option.originalPrice)
    : null;

  if (noRoom || wide) {
    return (
      <article className="col-span-2 flex flex-col gap-3 rounded-2xl border border-dashed border-ink/20 bg-surface px-4 py-4 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <div className="min-w-0">
          <h4 className="font-serif text-sm font-medium leading-snug text-ink">
            {option.roomType}
          </h4>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="font-serif text-2xl font-medium leading-none text-primary">
              {option.price}
            </span>
            {option.originalPrice && (
              <span className="text-xs text-muted/50 tabular-nums line-through">
                {option.originalPrice}
              </span>
            )}
            {saving && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {saving}
              </span>
            )}
          </div>
          <p className="mt-1.5 line-clamp-2 font-sans text-xs leading-relaxed text-muted">
            {option.description}
          </p>
        </div>
        <Button
          href={buildHref(duration, option.roomType, selectedBatch)}
          variant="primary"
          size="sm"
          className="w-full shrink-0 sm:w-auto bg-black! hover:bg-primary-dark!"
          target="_blank"
          rel="noopener noreferrer"
        >
          Reserve
        </Button>
      </article>
    );
  }

  return (
    <article className="surface-card flex flex-col rounded-2xl p-4 transition-all duration-300 hover:border-primary/15 hover:shadow-soft">
      <h4 className="line-clamp-2 font-serif type-lead  font-medium leading-snug text-ink">
        {option.roomType}
      </h4>

      <div className="surface-inset mt-3 rounded-xl px-3 py-2.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-serif text-2xl font-medium leading-none text-primary">
            {option.price}
          </span>
          {option.originalPrice && (
            <span className="text-xs text-muted/50 tabular-nums line-through">
              {option.originalPrice}
            </span>
          )}
          {saving && (
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              {saving}
            </span>
          )}
        </div>
      </div>

      <ul className="mb-3 mt-3 flex-1 space-y-1.5">
        {option.features.slice(0, 4).map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 font-sans text-[11px] leading-snug text-ink/75"
          >
            <Check size={10} className="mt-0.5 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>

      <Button
        href={buildHref(duration, option.roomType, selectedBatch)}
        variant="primary"
        size="sm"
        className="mt-auto w-full bg-black! hover:bg-primary-dark!"
        target="_blank"
        rel="noopener noreferrer"
      >
        Reserve
      </Button>
    </article>
  );
}

export default function UpcomingDates({
  duration,
  pricing,
  pricingDescription,
  batches: batchesProp,
  lodgingTitle = "Lodging packages",
  datesTitle = "Training dates",
  buildWhatsAppHref = whatsAppHref,
}: UpcomingDatesProps) {
  const batches = batchesProp?.length ? batchesProp : getBatchDates(duration);
  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.dates ?? "");

  return (
    <section
      id="pricing"
      className="py-8 sm:py-10 bg-white lg:min-h-[calc(100svh-5.5rem)] lg:flex lg:flex-col lg:justify-center"
    >
      <Container size="2xl">
        {/* Compact split header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <SectionHeader
            eyebrow="Schedule & Fees"
            title={
              <>
                Upcoming Batches &{" "}
                <span className="text-primary">Investment</span>
              </>
            }
            align="left"
            className="mb-0!"
          />
          {pricingDescription && (
            <p className="text-xs text-muted font-sans max-w-xs sm:text-right leading-relaxed shrink-0">
              {pricingDescription}
            </p>
          )}
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[7fr_5fr] lg:items-stretch lg:gap-10">
          {/* ── Pricing column (left) — sets row height on desktop ── */}
          <div className="flex flex-col gap-2.5">
            <div className="mb-0.5 flex items-baseline justify-between gap-2">
              <Heading as="h3" size="h4" font="poppins" className="mb-0">
                {lodgingTitle}
              </Heading>
              <p className="shrink-0 font-sans text-[10px] italic text-muted">
                Includes room, meals &amp; materials
              </p>
            </div>
            <p className="-mt-1 mb-1 font-sans text-[10px] text-muted/70">
              Note: Some rooms have private balconies, others shared.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pricing.map((option, idx) => {
                const isLast = idx === pricing.length - 1;
                const noRoom = option.roomType
                  .toLowerCase()
                  .includes("without");
                return (
                  <RoomCard
                    key={option.roomType}
                    option={option}
                    duration={duration}
                    selectedBatch={selectedBatch}
                    wide={isLast || noRoom}
                    buildHref={buildWhatsAppHref}
                  />
                );
              })}
            </div>
          </div>

          {/* ── Dates column (right) — same row height as left, list scrolls ── */}
          <div className="flex min-h-0 flex-col gap-3 lg:h-0 lg:min-h-full lg:overflow-hidden">
            <Heading as="h2" size="h4" font="poppins" className="mb-0 shrink-0">
              {datesTitle}
            </Heading>

            <div className="scrollbar-thin-primary min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y pr-1">
              <ol className="relative ml-3 space-y-2.5 border-l border-primary/20 pr-1">
                {batches.map((batch) => {
                  const selected = selectedBatch === batch.dates;
                  return (
                    <li key={batch.dates} className="relative pl-6">
                      <span
                        className={`absolute -left-[6px] top-4 h-3 w-3 rounded-full border-2 ${
                          selected
                            ? "border-primary bg-primary"
                            : "border-ink/20 bg-white"
                        }`}
                        aria-hidden="true"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedBatch(batch.dates)}
                        className={`w-full cursor-pointer rounded-xl border p-2.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                          selected
                            ? "surface-elevated border-primary shadow-soft"
                            : "surface-panel border-ink/8 hover:border-primary/20"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-sans type-body font-medium text-ink">
                            {batch.dates}
                          </p>
                          <span
                            className={`type-eyebrow inline-block rounded-full border px-2 py-0.5 text-[9px] ${batch.statusColor}`}
                          >
                            {batch.status}
                          </span>
                        </div>
                        <p className="mt-0.5 font-sans text-xs sm:text-sm text-muted">
                          {batch.spaces} · {duration}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
