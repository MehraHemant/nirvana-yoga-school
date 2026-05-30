"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Container, CourseCard, SectionHeader } from "@/components/ui";
import type { CourseCardProps } from "@/components/ui/CourseCard";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

const SITE = "https://www.nirvanayogaschoolindia.com";

const COURSES: CourseCardProps[] = [
  {
    title:
      "200 Hour Hatha Ashtanga Vinyasa Yoga Teacher Training in Rishikesh India",
    duration: "25 Days",
    level: "Beginner to intermediate level",
    certification: "RYT-200, Yoga Alliance",
    fee: "From 649 USD",
    image: `${SITE}/img/service-1.webp`,
    certBadge: `${SITE}/img/ryt200.webp`,
    href: `${SITE}/200-hour-yoga-teacher-training-in-rishikesh-india`,
  },
  {
    title:
      "200 Hour Ayurveda & Hatha Yoga Teacher Training in Rishikesh, India",
    duration: "25 Days",
    level: "Beginner to intermediate level",
    certification: "RYT-200, Yoga Alliance",
    fee: "From 649 USD",
    image: `${SITE}/img/auv.webp`,
    certBadge: `${SITE}/img/ryt200.webp`,
    href: `${SITE}/200-hour-ayurveda-yoga-teacher-training-in-rishikesh-india`,
  },
  {
    title:
      "200 Hour Meditation Yoga Nidra & Hatha Yoga Teacher Training in Rishikesh India",
    duration: "25 Days",
    level: "Beginner to intermediate level",
    certification: "RYT-200, Yoga Alliance",
    fee: "From 649 USD",
    image: `${SITE}/img/med.webp`,
    certBadge: `${SITE}/img/ryt200.webp`,
    href: `${SITE}/200-hour-meditation-teacher-training-in-rishikesh-india`,
  },
  {
    title:
      "200 Hour Kundalini Yoga Teacher Training Course (Kundalini & Hatha)",
    duration: "25 Days",
    level: "Beginner to intermediate level",
    certification: "RYT-200, Yoga Alliance",
    fee: "From 649 USD",
    image: `${SITE}/img/service-4.webp`,
    certBadge: `${SITE}/img/ryt200.webp`,
    href: `${SITE}/200-hour-kundalini-yoga-teacher-training-in-rishikesh-india`,
  },
  {
    title:
      "300 Hour Hatha Ashtanga Vinyasa Ayurveda and Yoga Therapy Teacher Training In Rishikesh India",
    duration: "29 Days",
    level: "Beginner to intermediate level",
    certification: "RYT-300, Yoga Alliance",
    fee: "From 899 USD",
    image: `${SITE}/img/service-2.webp`,
    certBadge: `${SITE}/img/ryt300.webp`,
    href: `${SITE}/300-hour-yoga-teacher-training-in-rishikesh-india`,
  },
  {
    title:
      "500 Hour Hatha Ashtanga Vinyasa Ayurveda & Yoga Therapy Teacher Training in Rishikesh, India",
    duration: "59 Days",
    level: "Beginner to intermediate level",
    certification: "RYT-500, Yoga Alliance",
    fee: "From 1449 USD",
    image: `${SITE}/img/service-3.webp`,
    certBadge: `${SITE}/img/ryt500.webp`,
    href: `${SITE}/500-hour-yoga-teacher-training-in-rishikesh-india`,
  },
];

export default function CoursesSection() {
  return (
    <section id="courses" className="bg-paper py-14 md:py-20 lg:py-28">
      <Container size="2xl">
        <motion.div
          className="mb-8 flex flex-col gap-4 sm:mb-10 md:mb-14 lg:flex-row lg:items-end lg:justify-between"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
        >
          <SectionHeader
            eyebrow="Residential YTT in Rishikesh, India"
            title={
              <>
                Yoga Teacher Training in{" "}
                <span className="text-primary italic">Rishikesh.</span>
              </>
            }
            description="Beyond mere certifications — life-changing journeys into the heart of yoga. Yoga Alliance-accredited programs blending ancient wisdom with holistic guidance."
          />
          <Link
            href={`${SITE}/yoga-teacher-training-in-rishikesh-india`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            View all courses
            <motion.span aria-hidden="true" whileHover={{ x: 4 }}>
              →
            </motion.span>
          </Link>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {COURSES.map((course, index) => (
            <CourseCard
              key={course.href}
              {...course}
              revealDelay={index * 100}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
