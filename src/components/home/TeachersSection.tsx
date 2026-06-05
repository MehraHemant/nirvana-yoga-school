"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button, Container, SectionHeader } from "@/components/ui";
import { EASE_OUT, reducedTransition, VIEWPORT_ONCE } from "@/lib/motion";

type Teacher = {
  name: string;
  experience: string;
  image: string;
};

const TEACHERS: Teacher[] = [
  {
    name: "Jitendra Singh Bhandari",
    experience: "20+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/jitendra1.webp",
  },
  {
    name: "Jeet Thapliyal",
    experience: "9 Years Experience",
    image:
      "https://www.nirvanayogaschoolindia.com/img/teacher/jeet-thapliyal.webp",
  },
  {
    name: "Bhawana Bulatia",
    experience: "12+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/bhawana.webp",
  },
  {
    name: "Amit Rana",
    experience: "12+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/amit.webp",
  },
  {
    name: "Kanna",
    experience: "10+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/kanna.webp",
  },
  {
    name: "Om Prakash",
    experience: "10+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/omprakash1.webp",
  },
  {
    name: "Naveen Mingwal",
    experience: "8+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/naveen1.webp",
  },
  {
    name: "Yogi Mahesh ji",
    experience: "7+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/mannji1.webp",
  },
  {
    name: "Dr. Akshay Vashisht",
    experience: "7+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/akshay.webp",
  },
  {
    name: "Meghna Banerjee",
    experience: "7+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/meghna1.webp",
  },
  {
    name: "Shubham Tadiyal",
    experience: "7+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/shubham.webp",
  },
  {
    name: "Ajay Pandey",
    experience: "8+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/ajay.webp",
  },
];

export default function TeachersSection() {
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <motion.section
      id="teachers"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={reducedTransition(prefersReduced, {
        duration: 0.6,
        ease: EASE_OUT,
      })}
      className="relative overflow-hidden bg-sand py-20 md:py-28 w-full"
    >
      {/* Background decorations */}
      <div
        className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-primary/3 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-secondary/3 blur-[100px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <Container size="2xl" className="w-full relative z-10">
        {/* Section Header */}
        <div className="w-full text-center mb-12 sm:mb-16">
          <SectionHeader
            eyebrow="Our Spiritual Indian Gurus"
            title={
              <>
                Lineage Teachers,{" "}
                <span className="italic font-normal text-accent font-serif">
                  Guided by Compassion
                </span>
              </>
            }
            description="Meet our twelve experienced, traditional yoga teachers and spiritual guides carrying decades of combined practice directly from traditional Vedic lineages in Rishikesh."
            align="center"
            className="mx-auto max-w-3xl"
          />
        </div>

        {/* Infinite Carousel Slider Wrapper */}
        <div className="relative w-full overflow-hidden marquee-mask py-4 select-none marquee-hover-pause">
          <div className="flex w-max animate-marquee-slow">
            {/* Wrapper 1 */}
            <div className="flex gap-6 pr-6 shrink-0">
              {TEACHERS.map((teacher) => (
                <Link
                  key={`set1-${teacher.name}`}
                  href="https://www.nirvanayogaschoolindia.com/teacher"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-[32px] p-4 shadow-card border border-ink/5 flex flex-col w-[280px] shrink-0 overflow-hidden hover:border-primary/20 hover:shadow-soft transition-all duration-500 cursor-pointer"
                >
                  {/* Portrait Image Frame */}
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-sand border border-ink/5 shadow-2xs">
                    <Image
                      src={teacher.image}
                      alt={teacher.name}
                      fill
                      sizes="280px"
                      draggable={false}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                    />
                  </div>

                  {/* Typography Details */}
                  <div className="flex flex-col items-center mt-3 text-center">
                    <h3 className="font-serif text-[15px] sm:text-base text-ink font-bold leading-tight group-hover:text-primary transition-colors duration-300 truncate w-full">
                      {teacher.name}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] font-sans font-extrabold text-secondary uppercase tracking-widest mt-1.5 select-none leading-none">
                      {teacher.experience}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Wrapper 2 */}
            <div className="flex gap-6 pr-6 shrink-0" aria-hidden="true">
              {TEACHERS.map((teacher) => (
                <Link
                  key={`set2-${teacher.name}`}
                  href="https://www.nirvanayogaschoolindia.com/teacher"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-[32px] p-4 shadow-card border border-ink/5 flex flex-col w-[280px] shrink-0 overflow-hidden hover:border-primary/20 hover:shadow-soft transition-all duration-500 cursor-pointer"
                >
                  {/* Portrait Image Frame */}
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-sand border border-ink/5 shadow-2xs">
                    <Image
                      src={teacher.image}
                      alt={teacher.name}
                      fill
                      sizes="280px"
                      draggable={false}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                    />
                  </div>

                  {/* Typography Details */}
                  <div className="flex flex-col items-center mt-3 text-center">
                    <h3 className="font-serif text-[15px] sm:text-base text-ink font-bold leading-tight group-hover:text-primary transition-colors duration-300 truncate w-full">
                      {teacher.name}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] font-sans font-extrabold text-secondary uppercase tracking-widest mt-1.5 select-none leading-none">
                      {teacher.experience}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Global CTA button at the bottom center */}
        <div className="mt-12 flex justify-center w-full select-none">
          <Button
            href="https://www.nirvanayogaschoolindia.com/teacher"
            variant="secondary"
            size="md"
            responsive
            className="cursor-pointer"
          >
            Meet All Gurus
          </Button>
        </div>
      </Container>
    </motion.section>
  );
}
