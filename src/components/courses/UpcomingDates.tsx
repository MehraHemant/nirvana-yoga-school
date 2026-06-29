"use client";

import Image from "next/image";
import { useState } from "react";
import { Button, Container, Heading, SectionHeader } from "@/components/ui";
import { Check } from "@/icons";
import {
  getBatchDates,
  getRoomImage,
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
  idx,
  duration,
  selectedBatch,
  wide = false,
}: {
  option: PricingOption;
  idx: number;
  duration: string;
  selectedBatch: string;
  wide?: boolean;
}) {
  const popular = false;
  const noRoom = option.roomType.toLowerCase().includes("without");
  const img = getRoomImage(option.roomType, option.image);
  const saving = option.originalPrice
    ? savingsPct(option.price, option.originalPrice)
    : null;

  /* ── Without-accommodation: full-width minimal row ── */
  if (noRoom || wide) {
    return (
      <article className="col-span-2 flex items-center justify-between gap-4 rounded-2xl border border-dashed border-ink/12 bg-white/70 px-4 py-3">
        <div className="min-w-0">
          <p className="type-eyebrow text-[9px] text-muted mb-0.5">{option.roomType}</p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-serif text-lg text-ink font-medium">{option.price}</span>
            {option.originalPrice && (
              <span className="text-[10px] text-muted/50 line-through tabular-nums">{option.originalPrice}</span>
            )}
            {saving && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{saving}</span>}
          </div>
          <p className="text-[10px] text-muted font-sans mt-0.5 line-clamp-1">{option.description}</p>
        </div>
        <Button
          href={whatsAppHref(duration, option.roomType, selectedBatch)}
          variant="ghost"
          size="sm"
          className="shrink-0 text-[11px]"
          target="_blank"
          rel="noopener noreferrer"
        >
          Reserve
        </Button>
      </article>
    );
  }

  /* ── Regular room card — image on top ── */
  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-300 hover:shadow-soft group flex flex-col ${
        popular
          ? "border-primary/30 ring-1 ring-primary/15"
          : "border-ink/8 hover:border-ink/12"
      }`}
    >
      {/* Room photo — short strip */}
      <div className="relative aspect-[16/7] overflow-hidden shrink-0">
        <Image
          src={img}
          alt={option.roomType}
          fill
          sizes="(max-width: 640px) 50vw, 200px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {saving && (
          <span className="absolute top-1.5 left-1.5 z-10 text-[7px] font-bold text-emerald-700 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
            {saving}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 px-2.5 pt-2 pb-2.5 gap-2">
        <div>
          <p className="type-eyebrow text-[8px] text-muted leading-tight truncate mb-0.5">{option.roomType}</p>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-serif text-xl text-ink font-medium leading-none">{option.price}</span>
            {option.originalPrice && (
              <span className="text-[10px] text-muted/50 line-through tabular-nums">{option.originalPrice}</span>
            )}
          </div>
        </div>

        {/* 2-column USP grid */}
        <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
          {option.features.slice(0, 4).map((f) => (
            <li key={f} className="flex items-start gap-1 text-[9px] text-ink/65 font-sans leading-tight">
              <Check size={8} className="text-primary shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>

        <Button
          href={whatsAppHref(duration, option.roomType, selectedBatch)}
          variant="ghost"
          size="sm"
          className="w-full text-[10px] py-1 mt-auto"
          target="_blank"
          rel="noopener noreferrer"
        >
          Reserve
        </Button>
      </div>
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
}: UpcomingDatesProps) {
  const batches = batchesProp?.length ? batchesProp : getBatchDates(duration);
  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.dates ?? "");

  return (
    <section
      id="pricing"
      className="py-8 sm:py-10 bg-paper lg:min-h-[calc(100svh-5.5rem)] lg:flex lg:flex-col lg:justify-center"
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

        <div className="grid lg:grid-cols-[5fr_7fr] gap-6 lg:gap-10 items-stretch">

          {/* ── Dates column — stretches to match pricing column height ── */}
          <div className="flex flex-col gap-3">
            <Heading as="h3" size="h4" font="poppins" className="mb-0">
              {datesTitle}
            </Heading>

            {/* Scrollable batch list — fills remaining column height */}
            <div className="no-scrollbar overflow-y-auto flex-1 min-h-0">
              <ol className="relative ml-3 space-y-2.5 border-l border-primary/20 pr-1">
                {batches.map((batch) => {
                  const selected = selectedBatch === batch.dates;
                  return (
                    <li key={batch.dates} className="relative pl-6">
                      <span
                        className={`absolute -left-[6px] top-4 h-3 w-3 rounded-full border-2 ${
                          selected
                            ? "bg-primary border-primary"
                            : "bg-white border-ink/20"
                        }`}
                        aria-hidden="true"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedBatch(batch.dates)}
                        className={`w-full cursor-pointer rounded-xl border p-2.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                          selected
                            ? "border-primary bg-white shadow-soft"
                            : "border-transparent bg-white/50 hover:bg-white/80"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="font-sans font-semibold text-xs text-ink">
                            {batch.dates}
                          </p>
                          <span
                            className={`type-eyebrow text-[9px] inline-block rounded-full border px-2 py-0.5 ${batch.statusColor}`}
                          >
                            {batch.status}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-muted font-sans">
                          {batch.spaces} · {duration}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* ── Pricing column ────────────────────────────────────────── */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-2 mb-0.5">
              <Heading as="h3" size="h4" font="poppins" className="mb-0">
                {lodgingTitle}
              </Heading>
              <p className="text-[10px] text-muted font-sans italic shrink-0">
                Includes room, meals &amp; materials
              </p>
            </div>
            <p className="text-[10px] text-muted/70 font-sans -mt-1 mb-1">
              Note: Some rooms have private balconies, others shared.
            </p>
            {/* 2-col image grid; last card (no accommodation) spans full width */}
            <div className="grid grid-cols-2 gap-2.5">
              {pricing.map((option, idx) => {
                const isLast = idx === pricing.length - 1;
                const noRoom = option.roomType.toLowerCase().includes("without");
                return (
                  <RoomCard
                    key={option.roomType}
                    option={option}
                    idx={idx}
                    duration={duration}
                    selectedBatch={selectedBatch}
                    wide={isLast || noRoom}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
