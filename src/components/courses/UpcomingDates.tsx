"use client";

import { useState } from "react";
import { Button, Container, Heading, SectionHeader } from "@/components/ui";
import { Check } from "@/icons";
import {
  bookingReserveHref,
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

/**
 * Room pricing card. Compact dashed layout is only for "Without Accommodation";
 * `wide` spans a normal card across both columns (odd last item) and still shows features.
 *
 * @param option - CMS pricing option (roomType, price, features, etc.)
 * @param wide - When true, span both grid columns on sm+
 * @param reserveHref - Book-now destination
 */
function RoomCard({
  option,
  wide = false,
  reserveHref,
}: {
  option: PricingOption;
  wide?: boolean;
  reserveHref: string;
}) {
  const noRoom = option.roomType.toLowerCase().includes("without");
  const saving = option.originalPrice
    ? savingsPct(option.price, option.originalPrice)
    : null;
  const features = option.features ?? [];

  if (noRoom) {
    return (
      <article className="col-span-2 flex flex-col gap-3 rounded-2xl border border-dashed border-ink/20 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <div className="min-w-0">
          <h4 className="font-serif text-lg font-medium leading-snug text-ink">
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
          {features.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 font-sans text-[11px] leading-snug text-ink/75"
                >
                  <Check size={10} className="mt-0.5 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button
          href={reserveHref}
          variant="primary"
          size="sm"
          className="w-full shrink-0 sm:w-auto"
        >
          Book now
        </Button>
      </article>
    );
  }

  return (
    <article
      className={`flex flex-col rounded-2xl border border-ink/9 bg-white p-4 transition-all duration-300 hover:border-primary/15${
        wide ? " sm:col-span-2" : ""
      }`}
    >
      <h4 className="line-clamp-2 font-serif type-lead  font-medium leading-snug text-ink">
        {option.roomType}
      </h4>

      <div className="mt-3 rounded-xl border border-ink/7 bg-white shadow-soft px-3 py-2.5">
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

      {features.length > 0 && (
        <ul className="mb-3 mt-3 flex-1 space-y-1.5">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2 font-sans text-[11px] leading-snug text-ink/75"
            >
              <Check size={10} className="mt-0.5 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>
      )}

      <Button
        href={reserveHref}
        variant="primary"
        size="sm"
        className="mt-auto w-full"
      >
        Book now
      </Button>
    </article>
  );
}

/**
 * UpcomingDates renders scheduling tables and package accommodation pricing tiers,
 * allowing prospective students to view upcoming session windows and initiate a booking.
 *
 * @param props - Component properties conforming to UpcomingDatesProps
 */
export default function UpcomingDates({
  duration,
  pricing,
  pricingDescription,
  batches: batchesProp,
  lodgingTitle = "Lodging packages",
  datesTitle = "Training dates",
  programSlug,
  bookingType = "course",
  htmlId = "pricing",
  buildWhatsAppHref = whatsAppHref,
  buildReserveHref,
}: UpcomingDatesProps) {
  const batches = batchesProp?.length ? batchesProp : getBatchDates(duration);
  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.dates ?? "");

  function getReserveHref(roomType: string) {
    if (buildReserveHref) {
      return buildReserveHref(duration, roomType, selectedBatch);
    }
    if (programSlug) {
      return bookingReserveHref(
        bookingType,
        programSlug,
        roomType,
        selectedBatch,
      );
    }
    return buildWhatsAppHref(duration, roomType, selectedBatch);
  }

  return (
    <section
      id={htmlId}
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
                const noRoom = option.roomType
                  .toLowerCase()
                  .includes("without");
                // Span last room card only when odd count leaves a single cell; never use compact no-features layout for rooms.
                const wide =
                  !noRoom &&
                  idx === pricing.length - 1 &&
                  pricing.length % 2 === 1;
                return (
                  <RoomCard
                    key={option.roomType}
                    option={option}
                    wide={wide}
                    reserveHref={getReserveHref(option.roomType)}
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
