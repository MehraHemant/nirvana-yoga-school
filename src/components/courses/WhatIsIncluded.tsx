"use client";

import { motion } from "framer-motion";
import { Container, SectionHeader } from "@/components/ui";
import {
  Bed,
  BookOpen,
  Certificate,
  Check,
  Compass,
  HeroFlourish,
  Leaf,
  Plane,
  Wifi,
} from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

interface WhatIsIncludedProps {
  inclusions: string[];
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Optional arrival support callout — hidden when body is empty */
  arrivalSupport?: { title?: string; body?: string };
  /** Public section HTML id (defaults to `inclusions`) */
  htmlId?: string;
}

function getInclusionIcon(item: string) {
  const lower = item.toLowerCase();

  if (
    lower.includes("accommodation") ||
    lower.includes("lodging") ||
    lower.includes("nights")
  ) {
    return (
      <Bed
        size={18}
        className="text-primary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  if (
    lower.includes("meal") ||
    lower.includes("food") ||
    lower.includes("vegetarian") ||
    lower.includes("organic")
  ) {
    return (
      <Leaf
        size={18}
        className="text-primary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  if (
    lower.includes("certificate") ||
    lower.includes("alliance") ||
    lower.includes("ryt") ||
    lower.includes("qualification")
  ) {
    return (
      <Certificate
        size={18}
        className="text-primary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  if (
    lower.includes("manual") ||
    lower.includes("textbook") ||
    lower.includes("book") ||
    lower.includes("kit")
  ) {
    return (
      <BookOpen
        size={18}
        className="text-primary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  if (
    lower.includes("excursion") ||
    lower.includes("visit") ||
    lower.includes("temple") ||
    lower.includes("aarti") ||
    lower.includes("trek") ||
    lower.includes("massage")
  ) {
    return (
      <Compass
        size={18}
        className="text-primary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  if (
    lower.includes("pickup") ||
    lower.includes("transit") ||
    lower.includes("airport") ||
    lower.includes("transfer") ||
    lower.includes("station")
  ) {
    return (
      <Plane
        size={18}
        className="text-primary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  if (
    lower.includes("wi-fi") ||
    lower.includes("wifi") ||
    lower.includes("internet")
  ) {
    return (
      <Wifi
        size={18}
        className="text-primary group-hover:text-white transition-colors duration-200"
      />
    );
  }

  return (
    <Check
      size={14}
      className="text-primary stroke-2 group-hover:text-white transition-colors duration-200"
    />
  );
}

/**
 * WhatIsIncluded showcases elements covered under program tuition fees
 * (e.g. food, stay, events).
 *
 * @param props - Component properties conforming to WhatIsIncludedProps
 */
export default function WhatIsIncluded({
  inclusions,
  eyebrow = "Fine Print",
  title = "What is Included in Your Fee",
  description = "We operate on complete transparency. Your program fee covers all essential living, training, and excursion expenses during your stay so you can focus entirely on your training.",
  arrivalSupport,
  htmlId = "inclusions",
}: WhatIsIncludedProps) {
  const arrivalBody = arrivalSupport?.body?.trim() ?? "";
  const showArrivalSupport = Boolean(arrivalBody);
  const arrivalTitle = arrivalSupport?.title?.trim() || "Arrival Support";

  return (
    <section
      id={htmlId}
      className="section-padding-y bg-white relative overflow-hidden"
    >
      {/* Background geometric flourishes */}
      <div
        className="absolute left-[-15%] top-[10%] w-[350px] h-[350px] text-accent/8 pointer-events-none rotate-12"
        aria-hidden="true"
      >
        <HeroFlourish size={350} />
      </div>
      <div
        className="absolute right-[-12%] bottom-[-10%] w-[400px] h-[400px] text-primary/3 pointer-events-none"
        aria-hidden="true"
      >
        <HeroFlourish size={400} />
      </div>

      <Container size="2xl" className="w-full">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 items-center">
          {/* Left Column: Section Header & Info (col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <SectionHeader
              eyebrow={eyebrow}
              title={
                title.includes("Included") ? (
                  <>
                    What is <span className="text-primary">Included</span> in
                    Your Fee
                  </>
                ) : (
                  title
                )
              }
              align="left"
              className="mb-3"
            />
            <p className="type-body text-ink">
              {description}
            </p>

            {showArrivalSupport ? (
              <div className="surface-panel space-y-2 rounded-3xl p-6 transition-all duration-300 hover:shadow-soft">
                <span className="type-eyebrow mb-1 block text-primary">
                  {arrivalTitle}
                </span>
                <p className="type-body text-ink">{arrivalBody}</p>
              </div>
            ) : null}
          </div>

          {/* Right Column: Inclusions card — full width, 2-col grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
            className="surface-card lg:col-span-7 relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:shadow-soft lg:p-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 text-primary border border-primary/15">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
                  aria-hidden="true"
                />
                <span className="type-eyebrow">
                  Tuition Inclusions
                </span>
              </div>
            </div>

            <h3 className="type-h3 mb-6 text-ink">
              Everything included in your fee
            </h3>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {inclusions.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 group cursor-default"
                >
                  <span
                    className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary/15 group-hover:bg-primary transition-all duration-300 shadow-2xs"
                    aria-hidden="true"
                  >
                    {getInclusionIcon(item)}
                  </span>
                  <span className="type-body text-ink transition-colors duration-200 group-hover:text-ink">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="type-ui mt-8 flex flex-col gap-2 border-t border-ink/5 pt-5 text-ink sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  aria-hidden="true"
                />
                No hidden registration fees or local taxes.
              </span>
              <span className="sm:text-right font-semibold text-ink">
                All tuition-listed features are 100% covered.
              </span>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
