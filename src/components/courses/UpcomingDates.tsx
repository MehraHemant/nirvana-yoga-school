"use client";

import Image from "next/image";
import { useState } from "react";
import { Button, Container, Heading, SectionHeader } from "@/components/ui";
import { Check } from "@/icons";
import {
  BOOKING_GUARANTEE,
  getBatchDates,
  getRoomImage,
  type PricingOption,
  type UpcomingDatesProps,
  whatsAppHref,
} from "./upcomingDatesShared";

function BookingNote() {
  return (
    <div className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-4 sm:p-5 text-xs leading-relaxed font-sans space-y-2 text-muted">
      <p>
        <strong className="text-ink">Booking guarantee:</strong>{" "}
        {BOOKING_GUARANTEE.deposit} deposit secures your spot. Balance due on
        arrival.
      </p>
      <p>{BOOKING_GUARANTEE.lines[1]}</p>
    </div>
  );
}

function OverlayRoomCard({
  option,
  idx,
  duration,
  selectedBatch,
}: {
  option: PricingOption;
  idx: number;
  duration: string;
  selectedBatch: string;
}) {
  const popular = idx === 1;
  const img = getRoomImage(option.roomType);

  return (
    <article
      className={`relative min-h-[480px] overflow-hidden rounded-3xl shadow-card flex flex-col justify-end group ${
        popular ? "ring-2 ring-primary/45 ring-offset-2 ring-offset-sand" : ""
      }`}
    >
      <Image
        src={img}
        alt={option.roomType}
        fill
        sizes="(max-width: 640px) 100vw, 400px"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {/* Even dim + heavy bottom scrim so copy never sits on bright photo */}
      <div
        className="absolute inset-0 bg-black/30 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[78%] bg-linear-to-t from-ink from-40% via-ink/95 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {popular && (
        <span className="absolute top-4 right-4 z-10 bg-primary text-white type-eyebrow px-3 py-1 rounded-full shadow-md">
          Most popular
        </span>
      )}

      <div className="relative z-10 p-6 pt-16 text-white">
        <p className="type-eyebrow text-white/90 tracking-widest">
          {option.roomType}
        </p>
        <p className="font-serif text-3xl text-white mt-1 drop-shadow-sm">
          {option.price}
        </p>
        <p className="text-sm text-white/90 mt-2 mb-4 leading-relaxed line-clamp-2">
          {option.description}
        </p>
        <ul className="space-y-2 mb-5 border-t border-white/20 pt-4">
          {option.features.slice(0, 3).map((feature) => (
            <li
              key={feature}
              className="flex gap-2.5 text-xs sm:text-sm text-white font-sans leading-snug"
            >
              <Check size={12} className="text-white mt-0.5 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        <Button
          href={whatsAppHref(duration, option.roomType, selectedBatch)}
          variant={popular ? "primary" : "secondary"}
          className="w-full"
          target="_blank"
          rel="noopener noreferrer"
        >
          Reserve via WhatsApp
        </Button>
      </div>
    </article>
  );
}

export default function UpcomingDates({
  duration,
  pricing,
  pricingDescription,
}: UpcomingDatesProps) {
  const batches = getBatchDates(duration);
  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.dates ?? "");

  return (
    <section
      id="pricing"
      className="py-20 sm:py-28 bg-white border-b border-ink/5"
    >
      <Container size="2xl">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-14">
          <SectionHeader
            eyebrow="Schedule & Fees"
            title={
              <>
                Upcoming Batches &{" "}
                <span className="text-primary">Investment</span>
              </>
            }
            align="center"
          />
          <p className="type-lead text-muted mt-5 font-sans text-base">
            {pricingDescription}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-start">
          <div>
            <Heading as="h3" size="h4" font="poppins" className="mb-6">
              Training dates
            </Heading>
            <ol className="relative ml-3 space-y-6 border-l border-primary/20">
              {batches.map((batch) => {
                const selected = selectedBatch === batch.dates;
                return (
                  <li key={batch.dates} className="relative pl-8">
                    <span
                      className={`absolute -left-[7px] top-5 h-3.5 w-3.5 rounded-full border-2 ${
                        selected
                          ? "bg-primary border-primary"
                          : "bg-white border-ink/20"
                      }`}
                      aria-hidden="true"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedBatch(batch.dates)}
                      className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                        selected
                          ? "border-primary bg-sand shadow-soft"
                          : "border-transparent bg-sand/40 hover:bg-sand/90"
                      }`}
                    >
                      <p className="font-sans font-semibold text-sm text-ink">
                        {batch.dates}
                      </p>
                      <p className="mt-1 text-[11px] text-muted font-sans">
                        {batch.spaces} · {duration}
                      </p>
                      <span
                        className={`type-eyebrow mt-2 inline-block rounded-full border px-2 py-0.5 ${batch.statusColor}`}
                      >
                        {batch.status}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-6">
              <BookingNote />
            </div>
          </div>

          <div>
            <Heading as="h3" size="h4" font="poppins" className="mb-6">
              Lodging packages
            </Heading>
            <div className="grid gap-5 sm:grid-cols-2">
              {pricing.map((option, idx) => (
                <OverlayRoomCard
                  key={option.roomType}
                  option={option}
                  idx={idx}
                  duration={duration}
                  selectedBatch={selectedBatch}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
