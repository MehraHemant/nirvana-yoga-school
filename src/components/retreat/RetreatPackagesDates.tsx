"use client";

import { useState } from "react";
import type {
  BatchItem,
  PricingOption,
  UpcomingDatesProps,
} from "@/components/courses/upcomingDatesShared";
import { Container, Heading, SectionHeader } from "@/components/ui";
import type { RetreatOffer } from "@/content/types/retreat-page";

type RetreatPackagesDatesProps = UpcomingDatesProps & {
  /** CMS retreat offer — shown only when present, never invented */
  offer?: RetreatOffer;
};

/**
 * Strips wrapping markdown emphasis from a CMS offer string.
 *
 * @param value - Offer label or note
 */
function plainOfferText(value: string): string {
  return value
    .replace(/^\*+|\*+$/g, "")
    .replace(/^_+|_+$/g, "")
    .trim();
}

/**
 * Selectable stay row with the room name and a large aligned price.
 *
 * @param option - CMS room fee
 * @param selected - Whether this stay is the active selection
 * @param onSelect - Sets the selected room type
 */
function RoomRate({
  option,
  selected,
  onSelect,
}: {
  option: PricingOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const note = option.description.trim();

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60 sm:px-5 sm:py-5 ${
        selected
          ? "bg-primary/4 shadow-[inset_3px_0_0_0_var(--color-primary)]"
          : "hover:bg-ink/2.5"
      }`}
    >
      <span className="min-w-0">
        <span
          className={`type-h4 block text-ink ${selected ? "font-semibold" : ""}`}
        >
          {option.roomType}
        </span>
        {note ? (
          <span className="type-ui mt-1 block line-clamp-2 text-ink/50">
            {note}
          </span>
        ) : null}
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-[1.65rem] font-semibold leading-none tracking-tight text-primary tabular-nums sm:text-[1.85rem]">
          {option.price}
        </span>
        {option.originalPrice ? (
          <span className="mt-1.5 block text-xs text-ink/40 tabular-nums line-through">
            {option.originalPrice}
          </span>
        ) : null}
      </span>
    </button>
  );
}

/**
 * Selectable date row with seats and CMS status.
 *
 * @param batch - CMS date batch
 * @param selected - Whether this date is the active selection
 * @param onSelect - Sets the selected batch
 */
function DateRow({
  batch,
  selected,
  onSelect,
}: {
  batch: BatchItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60 sm:items-center sm:gap-4 sm:px-5 ${
        selected
          ? "bg-primary/4 shadow-[inset_3px_0_0_0_var(--color-primary)]"
          : "hover:bg-ink/2.5"
      }`}
    >
      <span
        className={`type-body min-w-0 text-ink ${selected ? "font-semibold" : ""}`}
      >
        {batch.dates}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
        <span className="type-ui text-ink/55">{batch.spaces}</span>
        <span
          className={`type-eyebrow rounded-full border px-2 py-0.5 ${batch.statusColor}`}
        >
          {batch.status}
        </span>
      </span>
    </button>
  );
}

/**
 * Retreat dates and fees — rate list and dates table. Course UpcomingDates is unchanged.
 *
 * @param props - CMS rooms, dates, optional offer, and selection callbacks
 */
export default function RetreatPackagesDates({
  pricing,
  pricingDescription,
  batches: batchesProp,
  lodgingTitle = "Stay",
  datesTitle = "Upcoming dates",
  htmlId = "pricing",
  selectedRoomType: selectedRoomTypeProp,
  selectedBatch: selectedBatchProp,
  onRoomSelect,
  onBatchSelect,
  offer,
}: RetreatPackagesDatesProps) {
  const batches = batchesProp ?? [];
  const [internalRoomType, setInternalRoomType] = useState(
    pricing[0]?.roomType ?? "",
  );
  const [internalBatch, setInternalBatch] = useState(batches[0]?.dates ?? "");

  const isControlled = onRoomSelect != null || onBatchSelect != null;
  const selectedRoomType = isControlled
    ? (selectedRoomTypeProp ?? pricing[0]?.roomType ?? "")
    : internalRoomType;
  const selectedBatch = isControlled
    ? (selectedBatchProp ?? batches[0]?.dates ?? "")
    : internalBatch;

  function handleRoomSelect(roomType: string) {
    if (onRoomSelect) onRoomSelect(roomType);
    else setInternalRoomType(roomType);
  }

  function handleBatchSelect(batch: string) {
    if (onBatchSelect) onBatchSelect(batch);
    else setInternalBatch(batch);
  }

  const support = pricingDescription.trim();
  const offerLabel = plainOfferText(offer?.label ?? "");
  const offerNote = plainOfferText(offer?.note ?? "");
  const showOfferLine = Boolean(offerLabel || offerNote);

  return (
    <section id={htmlId} className="section-padding-y bg-white">
      <Container size="2xl">
        <SectionHeader
          eyebrow="Dates & Fees"
          title={
            <>
              Stay & <span className="text-primary">investment</span>
            </>
          }
          description={support || undefined}
          align="left"
        />

        {showOfferLine ? (
          <p className="type-ui mt-5 max-w-2xl text-ink/55">
            {offerLabel ? (
              <span className="font-semibold text-primary">{offerLabel}</span>
            ) : null}
            {offerLabel && offerNote ? " · " : null}
            {offerNote}
          </p>
        ) : null}

        <div className="mt-10 space-y-10">
          <div className="min-w-0 max-w-2xl">
            <Heading as="h3" size="h4" className="mb-4">
              {lodgingTitle}
            </Heading>
            {pricing.length > 0 ? (
              <ul className="overflow-hidden rounded-2xl border border-ink/10">
                {pricing.map((option) => (
                  <li
                    key={option.roomType}
                    className="border-b border-ink/8 last:border-b-0"
                  >
                    <RoomRate
                      option={option}
                      selected={selectedRoomType === option.roomType}
                      onSelect={() => handleRoomSelect(option.roomType)}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {batches.length > 0 ? (
            <div className="min-w-0">
              <Heading as="h3" size="h4" className="mb-4">
                {datesTitle}
              </Heading>
              <div className="overflow-hidden rounded-2xl border border-ink/10">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-ink/10 bg-surface-muted px-4 py-3 sm:px-5">
                  <span className="type-eyebrow font-medium text-ink/45">
                    Dates
                  </span>
                  <span className="type-eyebrow font-medium text-ink/45">
                    Seats
                  </span>
                </div>
                <ol>
                  {batches.map((batch) => (
                    <li
                      key={batch.dates}
                      className="border-b border-ink/8 last:border-b-0"
                    >
                      <DateRow
                        batch={batch}
                        selected={selectedBatch === batch.dates}
                        onSelect={() => handleBatchSelect(batch.dates)}
                      />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
