"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Container, SectionHeader } from "@/components/ui";
import { ChevronLeft, ChevronRight } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type Teacher = {
  name: string;
  role: string;
  experience: string;
  image: string;
};

const TEACHERS: Teacher[] = [
  {
    name: "Jeet Thapliyal",
    role: "Vinyasa Flow & Hatha Yoga",
    experience: "9 Years Experience",
    image:
      "https://www.nirvanayogaschoolindia.com/img/teacher/jeet-thapliyal.webp",
  },
  {
    name: "Yogi Mahesh ji",
    role: "Traditional Hatha Yoga",
    experience: "7+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/mannji1.webp",
  },
  {
    name: "Dr. Akshay Vashisht",
    role: "Pranayama & Philosophy",
    experience: "7+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/akshay.webp",
  },
  {
    name: "Meghna Banerjee",
    role: "Yoga Psychology & Meditation",
    experience: "7+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/meghna1.webp",
  },
  {
    name: "Amit Rana",
    role: "Hatha Yoga & Alignment",
    experience: "12+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/amit.webp",
  },
  {
    name: "Naveen Mingwal",
    role: "Ashtanga Vinyasa Yoga",
    experience: "8+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/naveen1.webp",
  },
  {
    name: "Bhawana Bulatia",
    role: "Corporate Yoga Trainer",
    experience: "12+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/bhawana.webp",
  },
  {
    name: "Kanna",
    role: "Kundalini Kriya & Ayurveda",
    experience: "10+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/kanna.webp",
  },
  {
    name: "Shubham Tadiyal",
    role: "Ashtanga & Vinyasa Flow",
    experience: "7+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/shubham.webp",
  },
  {
    name: "Ajay Pandey",
    role: "Traditional Hatha & Alignment",
    experience: "8+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/ajay.webp",
  },
  {
    name: "Jitendra Singh Bandhari",
    role: "Pranayama & Meditation",
    experience: "20+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/jitendra1.webp",
  },
  {
    name: "Om Prakash",
    role: "Yoga Anatomy & Physiology",
    experience: "10+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/omprakash1.webp",
  },
];

export default function TeachersSection() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const prefersReduced = useReducedMotion() ?? false;

  const [scrollProgress, setScrollProgress] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Measure carousel boundary constraints
  const updateConstraints = useCallback(() => {
    if (viewportRef.current && trackRef.current) {
      const viewportWidth = viewportRef.current.clientWidth;
      const trackWidth = trackRef.current.scrollWidth;
      const maxScrollVal = Math.max(0, trackWidth - viewportWidth);
      setMaxScroll(maxScrollVal);

      // Reset x value if out of bounds after resize
      const currentX = x.get();
      if (currentX < -maxScrollVal) {
        x.set(-maxScrollVal);
      }

      // Update boundaries
      const tolerance = 5;
      setCanScrollLeft(x.get() < -tolerance);
      setCanScrollRight(x.get() > -maxScrollVal + tolerance);

      // Update progress
      if (maxScrollVal > 0) {
        setScrollProgress(
          Math.min(1, Math.max(0, Math.abs(x.get()) / maxScrollVal)),
        );
      } else {
        setScrollProgress(0);
      }
    }
  }, [x]);

  const trackRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      trackRef.current = node;
      if (node && viewportRef.current) {
        const viewportWidth = viewportRef.current.clientWidth;
        const trackWidth = node.scrollWidth;
        const maxScrollVal = Math.max(0, trackWidth - viewportWidth);
        setMaxScroll(maxScrollVal);

        const tolerance = 5;
        setCanScrollLeft(x.get() < -tolerance);
        setCanScrollRight(x.get() > -maxScrollVal + tolerance);

        if (maxScrollVal > 0) {
          setScrollProgress(
            Math.min(1, Math.max(0, Math.abs(x.get()) / maxScrollVal)),
          );
        } else {
          setScrollProgress(0);
        }
      }
    },
    [x],
  );

  // Sync scroll positioning boundaries
  useEffect(() => {
    updateConstraints();

    const unsubscribe = x.on("change", (latestX) => {
      if (maxScroll > 0) {
        setScrollProgress(
          Math.min(1, Math.max(0, Math.abs(latestX) / maxScroll)),
        );
      } else {
        setScrollProgress(0);
      }
      const tolerance = 5;
      setCanScrollLeft(latestX < -tolerance);
      setCanScrollRight(latestX > -maxScroll + tolerance);
    });

    window.addEventListener("resize", updateConstraints);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", updateConstraints);
    };
  }, [maxScroll, x, updateConstraints]);

  // Navigate carousel by button controls
  const handleScroll = (direction: "left" | "right") => {
    if (maxScroll <= 0) return;

    const viewportWidth = viewportRef.current?.clientWidth ?? 350;
    const scrollStep = viewportWidth * 0.75;
    const currentX = x.get();

    let targetX =
      direction === "left" ? currentX + scrollStep : currentX - scrollStep;
    targetX = Math.min(0, Math.max(-maxScroll, targetX));

    if (prefersReduced) {
      x.set(targetX);
    } else {
      animate(x, targetX, { type: "spring", stiffness: 120, damping: 22 });
    }
  };

  return (
    <section
      id="teachers"
      className="relative w-full overflow-hidden bg-sand py-20 md:py-28"
    >
      <Container size="2xl" className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10 md:mb-14">
            <SectionHeader
              eyebrow="Our Spiritual Indian Gurus"
              title={
                <>
                  Lineage Teachers,{" "}
                  <span className="italic font-normal text-accent">
                    Guided by Compassion
                  </span>
                </>
              }
              description="Meet our twelve experienced, traditional yoga teachers and spiritual guides carrying decades of combined practice directly from traditional Vedic lineages in Rishikesh."
              align="left"
              className="max-w-2xl !mb-0"
            />

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 self-start md:self-end">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                className={`flex h-11 w-11 items-center justify-center rounded-full border border-ink/8 bg-white text-ink shadow-sm transition-all duration-300 ${
                  canScrollLeft
                    ? "hover:border-primary hover:bg-primary hover:text-white hover:shadow-soft cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                className={`flex h-11 w-11 items-center justify-center rounded-full border border-ink/8 bg-white text-ink shadow-sm transition-all duration-300 ${
                  canScrollRight
                    ? "hover:border-primary hover:bg-primary hover:text-white hover:shadow-soft cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Carousel Drag Viewport */}
        <motion.div
          ref={viewportRef}
          className="relative w-full cursor-grab active:cursor-grabbing overflow-visible select-none"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          custom={0.1}
          variants={fadeUp}
        >
          <motion.div
            ref={trackRefCallback}
            drag="x"
            dragConstraints={{ left: -maxScroll, right: 0 }}
            dragElastic={0.15}
            dragTransition={{ power: 0.25, timeConstant: 250 }}
            style={{ x }}
            className="flex gap-6 w-max touch-pan-y"
          >
            {TEACHERS.map((teacher) => (
              <article
                key={teacher.name}
                className="group relative flex flex-col h-[380px] w-[250px] sm:h-[430px] sm:w-[280px] shrink-0 overflow-hidden rounded-3xl border border-ink/5 bg-white shadow-card hover:shadow-soft transition-all duration-500"
              >
                {/* Portrait Profile Image (Full Color) */}
                <div className="relative w-full aspect-[4/5] overflow-hidden bg-sand">
                  <Image
                    src={teacher.image}
                    alt={teacher.name}
                    fill
                    sizes="(max-width: 640px) 250px, 280px"
                    draggable={false}
                    className="object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                  />
                </div>

                {/* Profile Details Container BELOW the Image (No overlap) */}
                <div className="flex-1 flex flex-col justify-center px-4 py-5 bg-white border-t border-ink/5 text-center">
                  <h3 className="font-serif text-base sm:text-lg text-ink font-bold leading-snug">
                    {teacher.name}
                  </h3>
                  <p className="type-eyebrow text-[9px] sm:text-[10px] text-secondary tracking-wider mt-1 leading-normal font-semibold">
                    {teacher.role}
                  </p>
                  <p className="font-sans text-[11px] sm:text-xs text-primary mt-1.5 font-medium leading-none">
                    {teacher.experience}
                  </p>
                </div>
              </article>
            ))}
          </motion.div>
        </motion.div>

        {/* Progress Tracker and Call to Action */}
        <div className="mt-10 md:mt-14 flex flex-col items-center gap-6">
          {maxScroll > 0 && (
            <div className="relative h-1 w-48 rounded-full bg-ink/8 overflow-hidden">
              <motion.div
                className="absolute top-0 bottom-0 left-0 bg-primary rounded-full origin-left"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
          )}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            custom={0.2}
            variants={fadeUp}
            className="pt-2"
          >
            <Button
              href="https://www.nirvanayogaschoolindia.com/teacher"
              variant="secondary"
              size="md"
              responsive
            >
              Read About Teachers
            </Button>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
