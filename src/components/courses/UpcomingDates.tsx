"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Button, Container, SectionHeader } from "@/components/ui";
import { Check } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

interface PricingOption {
  roomType: string;
  price: string;
  description: string;
  features: string[];
}

interface UpcomingDatesProps {
  duration: string;
  pricing: PricingOption[];
  pricingDescription: string;
}

// Helper to match room types to premium lodging photos
function getRoomImage(roomType: string) {
  const type = roomType.toLowerCase();
  if (type.includes("triple")) {
    return "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80"; // Shared room
  }
  if (
    type.includes("double") ||
    type.includes("twin") ||
    type.includes("shared")
  ) {
    return "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&auto=format&fit=crop&q=80"; // Twin share
  }
  return "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&auto=format&fit=crop&q=80"; // Private room
}

// Generate realistic batch dates based on course duration
function getBatchDates(durationStr: string) {
  const numDays = Number.parseInt(durationStr.split(" ")[0], 10) || 25;
  const months = [
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return months.map((month, index) => {
    const startDay = 2;
    const endDay = startDay + numDays - 1;
    let endMonth = month;
    let endDayAdjusted = endDay;

    // Handle overflow (like 59 days spanning 2 months)
    if (endDay > 30) {
      if (numDays > 50) {
        // 59 days
        const nextMonthIdx = (months.indexOf(month) + 1) % months.length;
        endMonth = months[nextMonthIdx];
        endDayAdjusted = endDay - 30; // approx
      } else {
        // 29 days
        endDayAdjusted = endDay;
      }
    }

    // Adjust specific display for end date
    const dateString =
      numDays > 50
        ? `${month} 2 – ${endMonth} 30, 2026`
        : `${month} 2 – ${month} ${endDayAdjusted}, 2026`;

    // Status logic
    let status = "Open";
    let spaces = "Spaces available";
    let statusColor = "text-emerald-600 bg-emerald-50 border-emerald-200";

    if (index === 0) {
      status = "Filling Fast";
      spaces = "Only 3 spots left";
      statusColor = "text-amber-600 bg-amber-50 border-amber-200";
    } else if (index === 1) {
      status = "Last Call";
      spaces = "Only 5 spots left";
      statusColor = "text-rose-600 bg-rose-50 border-rose-200";
    }

    return {
      dates: dateString,
      status,
      spaces,
      statusColor,
    };
  });
}

export default function UpcomingDates({
  duration,
  pricing,
  pricingDescription,
}: UpcomingDatesProps) {
  const batches = getBatchDates(duration);
  const [selectedBatch, setSelectedBatch] = useState<string>(batches[0].dates);

  return (
    <section
      id="pricing"
      className="py-20 sm:py-28 bg-paper border-t border-ink/5 relative"
    >
      <Container size="xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <SectionHeader
            eyebrow="Schedule &amp; Fees"
            title={
              <>
                Upcoming Batches &amp;{" "}
                <span className="text-primary italic">Investment</span>
              </>
            }
            align="center"
          />
          <p className="type-lead text-muted mt-6 max-w-xl mx-auto font-sans text-base sm:text-lg">
            {pricingDescription}
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12 items-start">
          {/* Left: Batches Table Column */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="type-h3 text-ink flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif text-sm font-semibold select-none">
                1
              </span>
              Select Batch Dates
            </h3>

            <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-card border border-ink/5 space-y-3">
              {batches.map((batch) => {
                const isSelected = selectedBatch === batch.dates;

                return (
                  <button
                    key={batch.dates}
                    type="button"
                    onClick={() => setSelectedBatch(batch.dates)}
                    className={`w-full flex flex-col sm:flex-row sm:items-center justify-between text-left p-4 rounded-2xl border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                      isSelected
                        ? "border-primary bg-primary/[0.03] shadow-xs"
                        : "border-ink/10 bg-white hover:border-primary/50"
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="font-sans font-semibold text-sm sm:text-base text-ink">
                        {batch.dates}
                      </span>
                      <span className="text-xs text-muted block font-sans">
                        Duration: {duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      <div className="text-right hidden sm:block">
                        <span className="type-eyebrow text-muted block">
                          {batch.spaces}
                        </span>
                      </div>
                      <span
                        className={`type-eyebrow px-2.5 py-1 rounded-full border ${batch.statusColor}`}
                      >
                        {batch.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-5 bg-primary/[0.02] border border-primary/10 rounded-2xl text-xs text-muted leading-relaxed font-sans space-y-2">
              <p>
                💡 <strong>Booking Guarantee:</strong> A registration deposit of{" "}
                <strong>$200 USD</strong> secures your reservation. The
                remaining balance is payable on arrival via cash or card.
              </p>
              <p>
                ✓ All deposits are transferable to future dates up to 12 months
                in advance, in case your travel plans change.
              </p>
            </div>
          </div>

          {/* Right: Room Packages Grid Column */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="type-h3 text-ink flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif text-sm font-semibold select-none">
                2
              </span>
              Select Lodging Style
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              {pricing.map((option, idx) => {
                const roomImage = getRoomImage(option.roomType);
                const isPopular = idx === 1; // Double Sharing Room as popular selection

                return (
                  <div
                    key={option.roomType}
                    className={`bg-white rounded-3xl overflow-hidden shadow-card border flex flex-col justify-between hover:shadow-soft transition-all duration-300 relative ${
                      isPopular
                        ? "border-primary/40 ring-1 ring-primary/10"
                        : "border-ink/5"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute top-4 right-4 bg-primary text-white type-eyebrow px-3 py-1 rounded-full z-20 shadow-sm">
                        Most Popular
                      </div>
                    )}

                    {/* Room Thumbnail Photo */}
                    <div className="relative h-[160px] w-full bg-sand">
                      <Image
                        src={roomImage}
                        alt={option.roomType}
                        fill
                        sizes="(max-width: 768px) 100vw, 350px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute bottom-3 left-4 bg-white/95 text-ink font-bold type-eyebrow px-2.5 py-1 rounded-md shadow-xs">
                        {option.roomType.split(" ")[0]} Style
                      </span>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="type-display-sm font-medium text-ink mb-1">
                          {option.roomType}
                        </h4>

                        <div className="my-3 flex items-baseline gap-1">
                          <span className="type-h3 text-primary">
                            {option.price}
                          </span>
                          <span className="text-xs text-muted font-sans font-medium">
                            / Course Tuition
                          </span>
                        </div>

                        <p className="text-xs text-muted leading-relaxed mb-6 font-sans">
                          {option.description}
                        </p>

                        <ul className="space-y-2.5 mb-6 border-t border-ink/10 pt-4">
                          {option.features.map((feat) => (
                            <li
                              key={feat}
                              className="flex items-start gap-2.5 text-xs text-ink/80 font-sans font-medium"
                            >
                              <span className="text-primary shrink-0 mt-0.5">
                                <Check size={11} className="stroke-[3]" />
                              </span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        href={`https://wa.me/919876543210?text=Hi Nirvana Yoga School, I would like to register for the ${duration} ${option.roomType} YTT batch starting on ${selectedBatch}.`}
                        variant={isPopular ? "primary" : "secondary"}
                        size="md"
                        className="w-full text-center py-3"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Reserve via WhatsApp
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
