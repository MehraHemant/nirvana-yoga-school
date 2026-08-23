"use client";

import Link from "next/link";
import { useState } from "react";
import { Container, Heading, SectionHeader } from "@/components/ui";
import { Check } from "@/icons";
import {
  getBatchDates,
  type PricingOption,
  type UpcomingDatesProps,
} from "./upcomingDatesShared";

/** Site-wide enquire CTA used by availability status chips. */
const ENQUIRE_HREF = "/enquire-now";

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
 * @param selected - Whether this room is the active selection
 * @param onSelect - Sets the selected room type
 */
function RoomCard({
  option,
  wide = false,
  selected,
  onSelect,
}: {
  option: PricingOption;
  wide?: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const noRoom = option.roomType.toLowerCase().includes("without");
  const saving = option.originalPrice
    ? savingsPct(option.price, option.originalPrice)
    : null;
  const features = option.features ?? [];
  const selectedClasses = selected
    ? "border-primary/8 bg-primary/10"
    : "border-ink/8 bg-white hover:border-primary/15";

  if (noRoom) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`flex w-full cursor-pointer col-span-2 shadow-lg rounded-2xl border p-4 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${selectedClasses}`}
      >
        <div className="min-w-0">
          <h4 className="text-lg font-bold leading-snug text-ink">
            {option.roomType}
          </h4>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-primary">
              {option.price}
            </span>
            {option.originalPrice && (
              <span className="text-xs text-muted/50 tabular-nums line-through">
                {option.originalPrice}
              </span>
            )}
            {saving && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                {saving}
              </span>
            )}
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-ink">
            {option.description}
          </p>
          {features.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink">
                  <Check size={12} className="mt-0.5 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full cursor-pointer flex-col shadow-lg rounded-2xl border p-4 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${selected ? "border-primary/8 bg-primary/10" : "border-ink/8 bg-white hover:border-primary/15"}${wide ? " sm:col-span-2" : ""}`}
    >
      <h4 className="line-clamp-2 type-lead font-semibold leading-snug text-ink">
        {option.roomType}
      </h4>

      <div className="flex flex-wrap items-baseline gap-x-2 py-3 pl-2 gap-y-1">
        <span className="text-2xl font-bold tracking-tight text-primary">
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

      {features.length > 0 && (
        <ul className="mb-2 mt-2 flex-1 space-y-1.5">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-1 text-sm leading-snug text-ink"
            >
              <Check size={12} className="mt-0.5 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>
      )}
    </button>
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
  htmlId = "pricing",
  selectedRoomType: selectedRoomTypeProp,
  selectedBatch: selectedBatchProp,
  onRoomSelect,
  onBatchSelect,
}: UpcomingDatesProps) {
  const batches = batchesProp?.length ? batchesProp : getBatchDates(duration);
  const [internalRoomType, setInternalRoomType] = useState("");
  const [internalBatch, setInternalBatch] = useState(batches[0]?.dates ?? "");

  const isControlled = onRoomSelect != null || onBatchSelect != null;
  const selectedRoomType = isControlled
    ? (selectedRoomTypeProp ?? "")
    : internalRoomType;
  const selectedBatch = isControlled
    ? (selectedBatchProp ?? "")
    : internalBatch;

  function handleRoomSelect(roomType: string) {
    if (onRoomSelect) {
      onRoomSelect(roomType);
    } else {
      setInternalRoomType(roomType);
    }
  }

  function handleBatchSelect(batch: string) {
    if (onBatchSelect) {
      onBatchSelect(batch);
    } else {
      setInternalBatch(batch);
    }
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
          />
        </div>

        <div className="grid items-start mt-10 gap-6 lg:grid-cols-[7fr_5fr] lg:items-stretch lg:gap-10">
          {/* ── Pricing column (left) — sets row height on desktop ── */}
          <div className="flex flex-col gap-2.5">
            <div className="mb-0.5 flex items-baseline justify-between gap-2">
              <Heading as="h3" size="h4" className="mb-0">
                {lodgingTitle}
              </Heading>
              <p className="shrink-0 text-base font-normal text-ink">
                Includes room, meals &amp; materials
              </p>
            </div>
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
                    selected={selectedRoomType === option.roomType}
                    onSelect={() => handleRoomSelect(option.roomType)}
                  />
                );
              })}
            </div>
          </div>

          {/* ── Dates column (right) — same row height as left, list scrolls ── */}
          <div className="flex min-h-0 flex-col gap-3 lg:h-0 lg:min-h-full lg:overflow-hidden">
            <Heading as="h2" size="h4" className="mb-0 shrink-0">
              {datesTitle}
            </Heading>

            <div className="scrollbar-thin-primary min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y pr-1">
              <ol className="relative ml-3 space-y-2.5 border-l border-primary/20 pr-1">
                {batches.map((batch) => {
                  const selected = selectedBatch === batch.dates;
                  return (
                    <li key={batch.dates} className="relative pl-6">
                      <span
                        className={`absolute -left-1.5 top-4 h-3 w-3 rounded-full border-2 ${selected ? "border-primary bg-primary" : "border-ink/20 bg-white"}`}
                        aria-hidden="true"
                      />
                      <div
                        className={`flex w-full items-start gap-2 rounded-xl border p-2.5 transition-all ${selected ? "border-primary/8 bg-primary/10" : "surface-panel border-ink/8 hover:border-primary/20"}`}
                      >
                        <button
                          type="button"
                          onClick={() => handleBatchSelect(batch.dates)}
                          className="min-w-0 flex-1 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                          <p className="type-body font-semibold text-ink">
                            {batch.dates}
                          </p>
                          <p className="mt-0.5 text-xs sm:text-sm text-ink">
                            {batch.spaces} · {duration}
                          </p>
                        </button>
                        <Link
                          href={ENQUIRE_HREF}
                          className={`inline-block rounded-full border px-2 py-0.5 text-sm transition-opacity hover:opacity-85 uppercase tracking-widest ${batch.statusColor}`}
                          aria-label={`${batch.status} — Enquire now`}
                        >
                          {batch.status}
                        </Link>
                      </div>
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
