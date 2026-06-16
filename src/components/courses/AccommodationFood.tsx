"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Container, SectionHeader } from "@/components/ui";
import { Check } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

export default function AccommodationFood() {
  const [activeTab, setActiveTab] = useState<"rooms" | "food">("rooms");

  const roomAmenities = [
    "Private attached bathroom",
    "24/7 Hot & cold shower water",
    "High-speed Wi-Fi access",
    "Clean bed linens & study desk",
    "Twin or single private layouts",
    "Himalayan mountain views",
  ];

  const foodAmenities = [
    "3 Organic Sattvic meals daily",
    "Fresh seasonal local produce",
    "Ayurvedic balanced recipes",
    "Low oil, sodium & spices",
    "Vegan & gluten-free options",
    "Filtered pure drinking water",
  ];

  return (
    <section id="accommodation" className="py-20 sm:py-28 bg-white relative">
      <Container size="xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
          className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto"
        >
          <SectionHeader
            eyebrow="Residential Life"
            title={
              <>
                Nourishment for{" "}
                <span className="text-primary italic">Body &amp; Soul</span>
              </>
            }
            align="center"
          />
          <p className="type-lead text-muted mt-6 font-sans text-base sm:text-lg">
            A safe, comfortable, and peaceful space is essential to support your
            transformation. We provide clean lodging and organic Sattvic meals
            to fuel your physical practice and clear your mind.
          </p>
        </motion.div>

        {/* Tab switch buttons */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-sand p-1 rounded-full border border-ink/5">
            <button
              type="button"
              onClick={() => setActiveTab("rooms")}
              className={`relative px-6 py-3 rounded-full text-xs font-semibold font-sans tracking-widest uppercase transition-colors cursor-pointer ${
                activeTab === "rooms"
                  ? "text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              {activeTab === "rooms" && (
                <motion.span
                  layoutId="activeRetreatTab"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="absolute inset-0 bg-primary rounded-full"
                />
              )}
              <span className="relative z-10">Ashram Rooms</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("food")}
              className={`relative px-6 py-3 rounded-full text-xs font-semibold font-sans tracking-widest uppercase transition-colors cursor-pointer ${
                activeTab === "food"
                  ? "text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              {activeTab === "food" && (
                <motion.span
                  layoutId="activeRetreatTab"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="absolute inset-0 bg-primary rounded-full"
                />
              )}
              <span className="relative z-10">Sattvic Cuisine</span>
            </button>
          </div>
        </div>

        {/* Tab content wrapper */}
        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "rooms" ? (
              <motion.div
                key="rooms"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center"
              >
                {/* Images Collage */}
                <div className="lg:col-span-6 grid grid-cols-12 gap-4 relative">
                  <div className="col-span-8 overflow-hidden rounded-3xl shadow-card aspect-[4/5] relative">
                    <Image
                      src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=80"
                      alt="Ashram sanctuary room overview"
                      fill
                      sizes="(max-width: 1024px) 100vw, 500px"
                      className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="col-span-4 self-end space-y-4 mb-4">
                    <div className="overflow-hidden rounded-2xl shadow-card aspect-square relative border border-white">
                      <Image
                        src="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&auto=format&fit=crop&q=80"
                        alt="Bathroom and amenities detail"
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                    <div className="overflow-hidden rounded-2xl shadow-card aspect-[4/3] relative border border-white">
                      <Image
                        src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80"
                        alt="Meditation corner in room"
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div className="lg:col-span-6 space-y-6">
                  <span className="type-eyebrow text-primary font-semibold tracking-wider block uppercase">
                    Your Personal Sanctuary
                  </span>
                  <h3 className="type-h3 text-ink leading-tight">
                    Clean, Peaceful &amp; Mindful Living Rooms
                  </h3>
                  <p className="type-body text-muted leading-relaxed font-sans">
                    Situated in the tranquil neighborhood of Tapovan, Rishikesh,
                    our ashram rooms offer an ideal environment to reflect and
                    rest. Each room is designed with cleanliness, simple yogic
                    utility, and comfort in mind, ensuring a cool breeze,
                    ventilation, and private attached baths.
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-ink/10">
                    {roomAmenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Check size={12} className="stroke-[3]" />
                        </span>
                        <span className="text-xs sm:text-sm text-ink/80 font-sans font-medium">
                          {amenity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="food"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center"
              >
                {/* Text Content */}
                <div className="lg:col-span-6 space-y-6 order-last lg:order-first">
                  <span className="type-eyebrow text-primary font-semibold tracking-wider block uppercase">
                    The Sattvic Kitchen
                  </span>
                  <h3 className="type-h3 text-ink leading-tight">
                    Ayurvedic Food Prepared with Devotion (Prana)
                  </h3>
                  <p className="type-body text-muted leading-relaxed font-sans">
                    The food we serve is strictly vegetarian and Sattvic,
                    designed to enhance flexibility, aid light digestion, and
                    purify the blood. Cooked fresh daily, our Ayurvedic kitchen
                    utilizes locally grown, pesticide-free organic ingredients
                    with minimal oil, low sodium, and no onion or garlic.
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-ink/10">
                    {foodAmenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Check size={12} className="stroke-[3]" />
                        </span>
                        <span className="text-xs sm:text-sm text-ink/80 font-sans font-medium">
                          {amenity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images Collage */}
                <div className="lg:col-span-6 grid grid-cols-12 gap-4 relative">
                  <div className="col-span-8 overflow-hidden rounded-3xl shadow-card aspect-[4/5] relative">
                    <Image
                      src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80"
                      alt="Organic Sattvic food spread"
                      fill
                      sizes="(max-width: 1024px) 100vw, 500px"
                      className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="col-span-4 self-end space-y-4 mb-4">
                    <div className="overflow-hidden rounded-2xl shadow-card aspect-square relative border border-white">
                      <Image
                        src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=80"
                        alt="Fresh organic fruits and vegetables"
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                    <div className="overflow-hidden rounded-2xl shadow-card aspect-[4/3] relative border border-white">
                      <Image
                        src="https://images.unsplash.com/photo-1544967082-d9d25dca7cbd?w=500&auto=format&fit=crop&q=80"
                        alt="Ayurvedic spices and herbs"
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
