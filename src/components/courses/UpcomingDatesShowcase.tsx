"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import {
  Button,
  Container,
  Heading,
  Pill,
  SectionHeader,
} from "@/components/ui";
import { Check, ChevronLeft, ChevronRight } from "@/icons";
import { EASE_OUT } from "@/lib/motion";
import {
  type BatchItem,
  BOOKING_GUARANTEE,
  getBatchDates,
  getRoomImage,
  type PricingOption,
  type UpcomingDatesProps,
  whatsAppHref,
} from "./upcomingDatesShared";

type LayoutProps = UpcomingDatesProps & {
  batches: BatchItem[];
  selectedBatch: string;
  setSelectedBatch: (d: string) => void;
};

function SectionIntro({ pricingDescription }: { pricingDescription: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-14">
      <SectionHeader
        eyebrow="Schedule & Fees"
        title={
          <>
            Upcoming Batches &{" "}
            <span className="text-primary italic">Investment</span>
          </>
        }
        align="center"
      />
      <p className="type-lead text-muted mt-5 font-sans text-base">
        {pricingDescription}
      </p>
    </div>
  );
}

function BookingNote({ variant = "light" }: { variant?: "light" | "dark" }) {
  const box =
    variant === "dark"
      ? "bg-white/6 border-white/10 text-white/70"
      : "bg-primary/[0.03] border-primary/10 text-muted";
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 text-xs leading-relaxed font-sans space-y-2 ${box}`}
    >
      <p>
        <strong className={variant === "dark" ? "text-white" : "text-ink"}>
          Booking guarantee:
        </strong>{" "}
        {BOOKING_GUARANTEE.deposit} deposit secures your spot. Balance due on
        arrival.
      </p>
      <p>{BOOKING_GUARANTEE.lines[1]}</p>
    </div>
  );
}

function BatchCards({
  batches,
  selectedBatch,
  setSelectedBatch,
  duration,
  compact = false,
}: {
  batches: BatchItem[];
  selectedBatch: string;
  setSelectedBatch: (d: string) => void;
  duration: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {batches.map((batch) => {
        const selected = selectedBatch === batch.dates;
        return (
          <button
            key={batch.dates}
            type="button"
            onClick={() => setSelectedBatch(batch.dates)}
            className={`w-full text-left rounded-2xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
              compact ? "p-3" : "p-4"
            } ${
              selected
                ? "border-primary bg-primary/[0.04] shadow-xs"
                : "border-ink/8 bg-white hover:border-primary/30"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-sans font-semibold text-sm text-ink">
                  {batch.dates}
                </p>
                <p className="text-[11px] text-muted mt-0.5">
                  Duration: {duration}
                </p>
              </div>
              <span
                className={`type-eyebrow px-2 py-0.5 rounded-full border shrink-0 ${batch.statusColor}`}
              >
                {batch.status}
              </span>
            </div>
            {!compact && (
              <p className="text-[11px] text-muted mt-2">{batch.spaces}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}

function RoomCard({
  option,
  idx,
  duration,
  selectedBatch,
  layout = "grid",
}: {
  option: PricingOption;
  idx: number;
  duration: string;
  selectedBatch: string;
  layout?: "grid" | "minimal" | "overlay" | "dark";
}) {
  const popular = idx === 1;
  const img = getRoomImage(option.roomType);

  if (layout === "minimal") {
    return (
      <div
        className={`rounded-3xl border bg-white p-6 flex flex-col ${popular ? "border-primary/30 ring-1 ring-primary/10" : "border-ink/8"}`}
      >
        {popular && <Pill className="mb-3 w-fit">Most popular</Pill>}
        <h4 className="font-serif text-xl text-ink">{option.roomType}</h4>
        <p className="font-serif text-3xl text-primary mt-2">{option.price}</p>
        <p className="text-xs text-muted mt-3 mb-5 leading-relaxed">
          {option.description}
        </p>
        <ul className="space-y-2 mb-6 flex-1">
          {option.features.map((f) => (
            <li key={f} className="flex gap-2 text-xs text-ink/80 font-sans">
              <Check size={11} className="text-primary mt-0.5 shrink-0" />
              {f}
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
          Reserve
        </Button>
      </div>
    );
  }

  if (layout === "overlay") {
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

  if (layout === "dark") {
    return (
      <div
        className={`hero-glass rounded-3xl border border-white/10 p-6 flex flex-col ${popular ? "ring-1 ring-primary/40" : ""}`}
      >
        <div className="relative h-36 rounded-2xl overflow-hidden mb-4">
          <Image
            src={img}
            alt={option.roomType}
            fill
            sizes="350px"
            className="object-cover"
          />
        </div>
        <h4 className="font-serif text-lg text-white">{option.roomType}</h4>
        <p className="font-serif text-2xl text-accent mt-1">{option.price}</p>
        <p className="text-xs text-white/55 mt-2 mb-4">{option.description}</p>
        <Button
          href={whatsAppHref(duration, option.roomType, selectedBatch)}
          variant={popular ? "primary" : "outline-light"}
          className="w-full mt-auto"
          target="_blank"
          rel="noopener noreferrer"
        >
          Reserve
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-3xl overflow-hidden border shadow-card flex flex-col ${popular ? "border-primary/40 ring-1 ring-primary/10" : "border-ink/5"}`}
    >
      <div className="relative h-40 bg-sand">
        <Image
          src={img}
          alt={option.roomType}
          fill
          sizes="350px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
        {popular && (
          <span className="absolute top-3 right-3 bg-primary text-white type-eyebrow px-2.5 py-1 rounded-full">
            Popular
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h4 className="font-serif text-lg text-ink">{option.roomType}</h4>
        <p className="font-serif text-2xl text-primary mt-1">{option.price}</p>
        <p className="text-xs text-muted mt-2 mb-4 flex-1">
          {option.description}
        </p>
        <ul className="space-y-1.5 mb-4 border-t border-ink/8 pt-3">
          {option.features.slice(0, 3).map((f) => (
            <li
              key={f}
              className="flex gap-2 text-[11px] text-ink/75 font-sans"
            >
              <Check size={10} className="text-primary mt-0.5" />
              {f}
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
          Reserve
        </Button>
      </div>
    </div>
  );
}

/* 1 · Classic Split */
function Layout1(p: LayoutProps) {
  return (
    <section id="pricing" className="py-20 bg-white border-b border-ink/5">
      <Container size="2xl">
        <SectionIntro pricingDescription={p.pricingDescription} />
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-5">
            <Heading as="h3" size="h4" font="poppins">
              1 · Select your batch
            </Heading>
            <BatchCards {...p} />
            <BookingNote />
          </div>
          <div className="lg:col-span-7 space-y-5">
            <Heading as="h3" size="h4" font="poppins">
              2 · Choose lodging
            </Heading>
            <div className="grid sm:grid-cols-2 gap-5">
              {p.pricing.map((o, i) => (
                <RoomCard
                  key={o.roomType}
                  option={o}
                  idx={i}
                  duration={p.duration}
                  selectedBatch={p.selectedBatch}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* 2 · Timeline */
function Layout2(p: LayoutProps) {
  return (
    <section id="pricing" className="py-20 bg-sand border-b border-ink/5">
      <Container size="2xl">
        <SectionIntro pricingDescription={p.pricingDescription} />
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-start">
          <div>
            <Heading as="h3" size="h4" font="poppins" className="mb-6">
              Training dates
            </Heading>
            <ol className="relative ml-3 space-y-6 border-l border-primary/20">
              {p.batches.map((batch) => {
                const selected = p.selectedBatch === batch.dates;
                return (
                  <li key={batch.dates} className="relative pl-8">
                    <span
                      className={`absolute -left-[7px] top-5 h-3.5 w-3.5 rounded-full border-2 ${selected ? "bg-primary border-primary" : "bg-white border-ink/20"}`}
                      aria-hidden="true"
                    />
                    <button
                      type="button"
                      onClick={() => p.setSelectedBatch(batch.dates)}
                      className={`w-full text-left rounded-2xl border p-4 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${selected ? "border-primary bg-white shadow-soft" : "border-transparent bg-white/60 hover:bg-white"}`}
                    >
                      <p className="font-sans font-semibold text-sm text-ink">
                        {batch.dates}
                      </p>
                      <p className="mt-1 text-[11px] text-muted font-sans">
                        {batch.spaces} · {p.duration}
                      </p>
                      <span
                        className={`type-eyebrow inline-block mt-2 px-2 py-0.5 rounded-full border ${batch.statusColor}`}
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
              {p.pricing.map((o, i) => (
                <RoomCard
                  key={o.roomType}
                  option={o}
                  idx={i}
                  duration={p.duration}
                  selectedBatch={p.selectedBatch}
                  layout="overlay"
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* 3 · Calendar Strip */
function Layout3(p: LayoutProps) {
  return (
    <section id="pricing" className="py-20 bg-white border-b border-ink/5">
      <Container size="2xl">
        <SectionIntro pricingDescription={p.pricingDescription} />
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 mb-10 snap-x">
          {p.batches.map((batch) => {
            const selected = p.selectedBatch === batch.dates;
            return (
              <button
                key={batch.dates}
                type="button"
                onClick={() => p.setSelectedBatch(batch.dates)}
                className={`shrink-0 snap-start min-w-[200px] rounded-2xl border p-4 text-left cursor-pointer transition-all ${selected ? "border-primary bg-primary/[0.04]" : "border-ink/8 bg-sand/50 hover:bg-sand"}`}
              >
                <p className="font-serif text-lg text-ink">
                  {batch.dates.split(",")[0]}
                </p>
                <p className="text-[11px] text-muted mt-1">{batch.spaces}</p>
              </button>
            );
          })}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {p.pricing.map((o, i) => (
            <RoomCard
              key={o.roomType}
              option={o}
              idx={i}
              duration={p.duration}
              selectedBatch={p.selectedBatch}
            />
          ))}
        </div>
        <div className="mt-8 max-w-xl mx-auto">
          <BookingNote />
        </div>
      </Container>
    </section>
  );
}

/* 4 · Comparison Table */
function Layout4(p: LayoutProps) {
  return (
    <section id="pricing" className="py-20 bg-paper border-b border-ink/5">
      <Container size="2xl">
        <SectionIntro pricingDescription={p.pricingDescription} />
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          {p.batches.map((batch) => (
            <button
              key={batch.dates}
              type="button"
              onClick={() => p.setSelectedBatch(batch.dates)}
              className={`px-4 py-2 rounded-full text-xs font-semibold font-sans border cursor-pointer transition-all ${p.selectedBatch === batch.dates ? "bg-primary text-white border-primary" : "bg-white border-ink/10 text-muted hover:border-primary/30"}`}
            >
              {batch.dates}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto rounded-3xl border border-ink/8 bg-white shadow-card">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-ink/8 bg-sand/50">
                <th className="p-4 type-eyebrow text-muted">Room</th>
                <th className="p-4 type-eyebrow text-muted">Investment</th>
                <th className="p-4 type-eyebrow text-muted">Highlights</th>
                <th className="p-4 type-eyebrow text-muted" />
              </tr>
            </thead>
            <tbody>
              {p.pricing.map((o, i) => (
                <tr
                  key={o.roomType}
                  className="border-b border-ink/5 last:border-0 hover:bg-primary/[0.02]"
                >
                  <td className="p-4 font-serif text-ink">{o.roomType}</td>
                  <td className="p-4 font-serif text-xl text-primary">
                    {o.price}
                  </td>
                  <td className="p-4 text-xs text-muted font-sans max-w-xs">
                    {o.features.slice(0, 2).join(" · ")}
                  </td>
                  <td className="p-4">
                    <Button
                      href={whatsAppHref(
                        p.duration,
                        o.roomType,
                        p.selectedBatch,
                      )}
                      variant={i === 1 ? "primary" : "ghost"}
                      size="sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Book
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 max-w-lg mx-auto">
          <BookingNote />
        </div>
      </Container>
    </section>
  );
}

/* 5 · Dark Obsidian */
function Layout5(p: LayoutProps) {
  return (
    <section
      id="pricing"
      className="py-20 bg-ink text-white border-b border-white/5"
    >
      <Container size="2xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <SectionHeader
            eyebrow="Schedule & Fees"
            title={
              <>
                Upcoming Batches &{" "}
                <span className="italic text-accent">Investment</span>
              </>
            }
            description={p.pricingDescription}
            align="center"
            invert
          />
        </div>
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <BatchCards {...p} />
            <div className="mt-5">
              <BookingNote variant="dark" />
            </div>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
            {p.pricing.map((o, i) => (
              <RoomCard
                key={o.roomType}
                option={o}
                idx={i}
                duration={p.duration}
                selectedBatch={p.selectedBatch}
                layout="dark"
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* 6 · Maroon Crest */
function Layout6(p: LayoutProps) {
  return (
    <section id="pricing" className="border-b border-ink/5">
      <div className="bg-primary py-10">
        <Container size="2xl" className="text-center text-white">
          <p className="type-eyebrow text-white/60 mb-2">2026 Intakes</p>
          <Heading as="h2" align="center" invert size="h3">
            Secure your batch & room
          </Heading>
        </Container>
      </div>
      <div className="bg-sand py-16">
        <Container size="2xl">
          <p className="text-center text-muted max-w-xl mx-auto mb-10 font-sans text-sm">
            {p.pricingDescription}
          </p>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white rounded-3xl p-5 shadow-card border border-ink/5">
              <BatchCards {...p} compact />
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
              {p.pricing.map((o, i) => (
                <RoomCard
                  key={o.roomType}
                  option={o}
                  idx={i}
                  duration={p.duration}
                  selectedBatch={p.selectedBatch}
                  layout="minimal"
                />
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

/* 7 · Room Carousel */
function Layout7(p: LayoutProps) {
  const [roomIdx, setRoomIdx] = useState(1);
  const room = p.pricing[roomIdx] ?? p.pricing[0];
  const prev = () =>
    setRoomIdx((i) => (i - 1 + p.pricing.length) % p.pricing.length);
  const next = () => setRoomIdx((i) => (i + 1) % p.pricing.length);

  return (
    <section id="pricing" className="py-20 bg-white border-b border-ink/5">
      <Container size="2xl">
        <SectionIntro pricingDescription={p.pricingDescription} />
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-4 space-y-4">
            <BatchCards {...p} compact />
            <BookingNote />
          </div>
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={room.roomType}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
                className="relative rounded-3xl overflow-hidden bg-ink min-h-[380px] flex items-end"
              >
                <Image
                  src={getRoomImage(room.roomType)}
                  alt={room.roomType}
                  fill
                  sizes="700px"
                  className="object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
                <div className="relative z-10 p-8 w-full">
                  <p className="type-eyebrow text-accent">{room.roomType}</p>
                  <p className="font-serif text-4xl text-white mt-1">
                    {room.price}
                  </p>
                  <p className="text-sm text-white/65 mt-3 max-w-lg">
                    {room.description}
                  </p>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={prev}
                      className="p-2 rounded-full bg-white/10 border border-white/20 text-white cursor-pointer"
                      aria-label="Previous room"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      className="p-2 rounded-full bg-white/10 border border-white/20 text-white cursor-pointer"
                      aria-label="Next room"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <Button
                      href={whatsAppHref(
                        p.duration,
                        room.roomType,
                        p.selectedBatch,
                      )}
                      variant="primary"
                      className="ml-auto"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Reserve
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-2 mt-4">
              {p.pricing.map((o, i) => (
                <button
                  key={o.roomType}
                  type="button"
                  onClick={() => setRoomIdx(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${i === roomIdx ? "w-8 bg-primary" : "w-3 bg-ink/15"}`}
                  aria-label={o.roomType}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* 8 · Minimal Ledger */
function Layout8(p: LayoutProps) {
  return (
    <section id="pricing" className="py-20 bg-sand border-b border-ink/5">
      <Container size="lg">
        <SectionIntro pricingDescription={p.pricingDescription} />
        <div className="border-t border-ink/10 pt-8 mb-10">
          <p className="type-eyebrow text-primary mb-4">
            Batches · {p.duration}
          </p>
          <div className="flex flex-wrap gap-2">
            {p.batches.map((batch) => (
              <button
                key={batch.dates}
                type="button"
                onClick={() => p.setSelectedBatch(batch.dates)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-sans font-medium border cursor-pointer ${p.selectedBatch === batch.dates ? "bg-ink text-white border-ink" : "bg-transparent text-muted border-ink/15 hover:border-ink/30"}`}
              >
                {batch.dates}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {p.pricing.map((o, i) => (
            <div
              key={o.roomType}
              className="py-8 grid md:grid-cols-[1fr_auto_auto] gap-6 items-center"
            >
              <div>
                <h4 className="font-serif text-2xl text-ink">{o.roomType}</h4>
                <p className="text-sm text-muted mt-2 max-w-md">
                  {o.description}
                </p>
              </div>
              <p className="font-serif text-3xl text-primary md:text-right">
                {o.price}
              </p>
              <Button
                href={whatsAppHref(p.duration, o.roomType, p.selectedBatch)}
                variant={i === 1 ? "primary" : "secondary"}
                target="_blank"
                rel="noopener noreferrer"
              >
                Reserve
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <BookingNote />
        </div>
      </Container>
    </section>
  );
}

/* 9 · Photo Overlay Grid */
function Layout9(p: LayoutProps) {
  return (
    <section id="pricing" className="py-20 bg-white border-b border-ink/5">
      <Container size="2xl">
        <SectionIntro pricingDescription={p.pricingDescription} />
        <div className="grid lg:grid-cols-4 gap-4 mb-8">
          {p.batches.slice(0, 4).map((batch) => (
            <button
              key={batch.dates}
              type="button"
              onClick={() => p.setSelectedBatch(batch.dates)}
              className={`rounded-2xl border p-3 text-left cursor-pointer text-xs font-sans ${p.selectedBatch === batch.dates ? "border-primary bg-primary/[0.04]" : "border-ink/8"}`}
            >
              <span className="font-semibold text-ink block">
                {batch.dates}
              </span>
              <span className="text-muted">{batch.status}</span>
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {p.pricing.map((o, i) => (
            <RoomCard
              key={o.roomType}
              option={o}
              idx={i}
              duration={p.duration}
              selectedBatch={p.selectedBatch}
              layout="overlay"
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

/* 10 · Compact Viewport Tabs */
function Layout10(p: LayoutProps) {
  const [tab, setTab] = useState<"dates" | "rooms">("dates");
  return (
    <section
      id="pricing"
      className="py-14 lg:py-0 lg:min-h-[calc(100svh-5.5rem)] lg:flex lg:items-center bg-sand border-b border-ink/5"
    >
      <Container size="xl" className="w-full py-8">
        <SectionIntro pricingDescription={p.pricingDescription} />
        <div className="inline-flex bg-white p-1 rounded-full border border-ink/8 mb-8">
          {(["dates", "rooms"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-xs font-semibold font-sans cursor-pointer capitalize transition-all ${tab === t ? "bg-primary text-white" : "text-muted hover:text-ink"}`}
            >
              {t === "dates" ? "Batch dates" : "Room packages"}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {tab === "dates" ? (
            <motion.div
              key="dates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-lg mx-auto"
            >
              <BatchCards {...p} />
              <div className="mt-6">
                <BookingNote />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="rooms"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {p.pricing.map((o, i) => (
                <RoomCard
                  key={o.roomType}
                  option={o}
                  idx={i}
                  duration={p.duration}
                  selectedBatch={p.selectedBatch}
                  layout="minimal"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
}

const LAYOUTS = [
  { id: 1, label: "Classic Split", Component: Layout1 },
  { id: 2, label: "Timeline", Component: Layout2 },
  { id: 3, label: "Calendar Strip", Component: Layout3 },
  { id: 4, label: "Compare Table", Component: Layout4 },
  { id: 5, label: "Dark Obsidian", Component: Layout5 },
  { id: 6, label: "Maroon Crest", Component: Layout6 },
  { id: 7, label: "Room Carousel", Component: Layout7 },
  { id: 8, label: "Minimal Ledger", Component: Layout8 },
  { id: 9, label: "Photo Overlay", Component: Layout9 },
  { id: 10, label: "Compact Tabs", Component: Layout10 },
];

export default function UpcomingDatesShowcase(props: UpcomingDatesProps) {
  const [active, setActive] = useState(2);
  const batches = getBatchDates(props.duration);
  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.dates ?? "");

  const Active = LAYOUTS.find((l) => l.id === active)?.Component ?? Layout1;
  const layoutProps: LayoutProps = {
    ...props,
    batches,
    selectedBatch,
    setSelectedBatch,
  };

  return (
    <>
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-100 max-w-[95vw] overflow-x-auto scrollbar-none">
        <div className="inline-flex items-center gap-1 bg-ink/95 backdrop-blur-xl border border-white/12 rounded-full px-2 py-1.5 shadow-2xl">
          <span className="text-[9px] text-white/40 font-sans font-bold tracking-widest uppercase pl-2 pr-1 shrink-0 hidden md:inline">
            Dates
          </span>
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setActive(l.id)}
              className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold font-sans transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                active === l.id
                  ? "bg-primary text-white"
                  : "text-white/50 hover:text-white hover:bg-white/8"
              }`}
              title={l.label}
            >
              <span className="md:hidden">{l.id}</span>
              <span className="hidden md:inline">{l.label}</span>
            </button>
          ))}
        </div>
      </div>
      <Active {...layoutProps} />
    </>
  );
}
