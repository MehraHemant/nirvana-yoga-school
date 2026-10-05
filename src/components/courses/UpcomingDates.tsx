"use client";

import { useState } from "react";
import { Container, Heading, SectionHeader } from "@/components/ui";
import {
  getBatchDates,
  type PricingOption,
  type UpcomingDatesProps,
} from "./upcomingDatesShared";

const CARD_IDLE =
  "relative overflow-hidden rounded-2xl border border-black/40 bg-white hover:border-primary/20";
const CARD_SELECTED =
  "relative overflow-hidden rounded-2xl border border-primary/40 bg-linear-to-br from-primary/18 via-primary/8 to-white";

/**
 * Compact lodging fee card — name and price only.
 *
 * @param option - CMS pricing option
 * @param wide - Span both grid columns on sm+
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

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex h-full w-full cursor-pointer flex-col p-4 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${selected ? CARD_SELECTED : CARD_IDLE}${noRoom || wide ? " sm:col-span-2" : ""}`}
    >
      {selected ? (
        <span
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/20 via-primary/6 to-transparent"
          aria-hidden
        />
      ) : null}
      <h4 className="relative type-h4 line-clamp-2 text-ink">
        {option.roomType}
      </h4>
      <div className="relative mt-auto flex flex-wrap items-baseline gap-x-2 pt-3">
        <span className="text-2xl font-semibold leading-[1.2] tracking-tight text-primary">
          {option.price}
        </span>
        {option.originalPrice ? (
          <span className="text-xs text-muted/50 tabular-nums line-through">
            {option.originalPrice}
          </span>
        ) : null}
      </div>
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
  batches: batchesProp,
  lodgingTitle = "Lodging packages",
  datesTitle = "Training dates",
  htmlId = "pricing",
  selectedRoomType: selectedRoomTypeProp,
  selectedBatch: selectedBatchProp,
  onRoomSelect,
  onBatchSelect,
  embedded = false,
  sectionDescription,
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

  const header = (
    <SectionHeader
      eyebrow={embedded ? "Dates & Fees" : "Schedule & Fees"}
      title={
        embedded ? (
          <>
            Stay & <span className="text-primary">investment</span>
          </>
        ) : (
          <>
            Upcoming Batches & <span className="text-primary">Investment</span>
          </>
        )
      }
      description={embedded ? sectionDescription : undefined}
      align="left"
    />
  );

  const body = (
    <div
      className={`grid items-start gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-8 ${embedded ? "" : "mt-10"}`}
    >
      {/* Dates column (left) — matches right column height; list scrolls */}
      <div className="flex min-h-0 flex-col lg:h-0 lg:min-h-full lg:overflow-hidden">
        <Heading as="h3" size="h4" className="mb-4 h-8 shrink-0">
          {datesTitle}
        </Heading>

        <div className="scrollbar-thin-primary min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y pr-1">
          <ol className="space-y-2.5">
            {batches.map((batch) => {
              const selected = selectedBatch === batch.dates;
              return (
                <li key={batch.dates}>
                  <button
                    type="button"
                    onClick={() => handleBatchSelect(batch.dates)}
                    aria-pressed={selected}
                    className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${selected ? CARD_SELECTED : CARD_IDLE}`}
                  >
                    {selected ? (
                      <span
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/20 via-primary/6 to-transparent"
                        aria-hidden
                      />
                    ) : null}
                    <span className="relative min-w-0 flex-1">
                      <span className="type-body block font-semibold text-ink">
                        {batch.dates}
                      </span>
                      <span className="type-ui mt-0.5 block text-ink/55">
                        {batch.spaces}
                      </span>
                    </span>
                    <span
                      className={`relative type-eyebrow shrink-0 rounded-full border px-2 py-0.5 ${batch.statusColor}`}
                    >
                      {batch.status}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Pricing column (right) — sets row height on desktop */}
      <div className="flex flex-col">
        <Heading as="h3" size="h4" className="mb-4 h-8">
          {lodgingTitle}
        </Heading>
        <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2">
          {pricing.map((option, idx) => {
            const noRoom = option.roomType.toLowerCase().includes("without");
            const wide =
              !noRoom && idx === pricing.length - 1 && pricing.length % 2 === 1;
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
    </div>
  );

  if (embedded) {
    return (
      <section
        id={htmlId}
        className="scroll-mt-28 border-b border-ink/8 section-padding-y bg-white"
      >
        <div className="space-y-8">
          <div className="space-y-4">
            {header}
            <hr className="border-ink/8" />
          </div>
          {body}
        </div>
      </section>
    );
  }

  return (
    <section id={htmlId} className="section-padding-y bg-white">
      <Container size="2xl">
        {header}
        {body}
      </Container>
    </section>
  );
}
