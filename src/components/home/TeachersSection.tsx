"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button, Container, SectionHeader } from "@/components/ui";

type Teacher = {
  name: string;
  experienceSummary: string;
  image: string;
  bio: string;
  education: string[];
  detailedExperience: string[];
  expertise: string[];
};

const TEACHERS: Teacher[] = [
  {
    name: "Jitendra Singh Bhandari",
    experienceSummary: "20+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/jitendra1.webp",
    bio: "Born in the Uttarakhand Himalayas, Jitendra Singh Bhandari started his yoga journey with Sivananda Ashram, Rishikesh, in 2000. After practicing in the ashram, he completed the Yoga and Vedanta Course there, and later obtained a Master's degree in Yogic Science.",
    education: [
      "Yoga & Vedanta Course from Sivananda Ashram, Rishikesh",
      "Master's Degree in Yogic Science from Jain Vishwa Bharti University, Rajasthan",
    ],
    detailedExperience: [
      "20+ years of teaching experience in Rishikesh",
      "Taught Yoga in Zhengzhou, China",
    ],
    expertise: ["Traditional Hatha Yoga", "Pranayama", "Meditation & Vedanta"],
  },
  {
    name: "Jeet Thapliyal",
    experienceSummary: "9 Years Experience",
    image:
      "https://www.nirvanayogaschoolindia.com/img/teacher/jeet-thapliyal.webp",
    bio: "At the tender age of twelve, Jeet began his journey into the depths of Yoga, seeking solace for his partially deaf ears and hyper-acidic body. Through dedicated practice, his hearing mended, and his body found balance once more, marking a transformative progress in his life. Now, with over a decade of personal practice and formal teaching, Jeet teaches students Vinyasa Flow, Hatha Yoga, and Mantra Chanting.",
    education: [
      "Masters in English Literature",
      "Gold Medalist in Masters in Yoga",
      "Certified 500 Hrs Yoga Teacher from Yoga Alliance",
    ],
    detailedExperience: [
      "9 years of overall teaching experience",
      "6 years of teaching experience in Rishikesh",
      "2 years of teaching experience in Delhi NCR",
      "1 year of experience in Umaid Bhawan Palace Jodhpur",
    ],
    expertise: [
      "Hatha Yoga",
      "Vinyasa Yoga",
      "Ashtanga Vinyasa",
      "Mantra Yoga",
      "Bhakti Yoga Kirtan",
    ],
  },
  {
    name: "Bhawana Bulatia",
    experienceSummary: "12+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/bhawana.webp",
    bio: "Bhawana was born and brought up in Nainital (Uttarakhand), and was associated with the yogic lifestyle from childhood due to family beliefs. She has lived and worked all around the world, experiencing that the true meaning of life lies in having a spiritual connection and growth.",
    education: [
      "Bachelor of Science",
      "Masters from IIM",
      "Certified 500-RYT Kundalini & 500-RYT Multi-style",
      "Certified Pre & Post Natal Teacher",
    ],
    detailedExperience: [
      "12+ years of Corporate Trainer & Yoga Instructor experience",
      "3+ years of Teaching Experience in Rishikesh",
    ],
    expertise: [
      "Kundalini Kriya",
      "Pranayama",
      "Meditation",
      "Sound Healing & Reiki Healing",
    ],
  },
  {
    name: "Amit Rana",
    experienceSummary: "12+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/amit.webp",
    bio: "An individual who has a great passion for spreading positivity and wellness through the art of yoga. With a warm and charming personality, he creates a nurturing space where students feel not just heard, but truly understood. For him, it's about empowering individuals to cultivate a deeper connection between mind, body, and soul.",
    education: [
      "Masters in Yoga from University of Sanskrit Vishwa Vidyalaya, Haridwar",
      "Certified 500-RYT from Yoga Padma School, Rishikesh",
      "CCY (Certification Course Yoga) from Kaivalyadhama",
      "Practiced Iyengar Yoga under gurus like Usha Mata, Swami Rudra Deva for 7 years",
    ],
    detailedExperience: [
      "12+ years of overall teaching experience",
      "7+ years of teaching experience in Rishikesh",
      "4 years of teaching experience in Hong Kong, China",
    ],
    expertise: [
      "Hatha Yoga",
      "Alignment & Adjustment",
      "Iyengar Yoga",
      "Pranayama",
    ],
  },
  {
    name: "Kanna",
    experienceSummary: "10+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/kanna.webp",
    bio: "Kanna is a devoted teacher, a certified Alternative Medicine Practitioner, a trained Homeopath, a licensed Acupuncturist, a skilled Marma Therapist, and an Ayurvedic Lifestyle Consultant. He is also trained in the ancient South Indian martial art of Kalaripayattu and Mudgar training.",
    education: [
      "E. Homeopath",
      "Diploma in Indian Acupuncture",
      "Diploma in Ayurveda",
    ],
    detailedExperience: [
      "10+ years of overall teaching experience",
      "5+ years of teaching experience in Rishikesh",
      "5 years of teaching experience in South India",
    ],
    expertise: [
      "Ayurveda & Homeopathy",
      "Acupuncture",
      "Traditional Marma & Kalaripayattu Practice",
    ],
  },
  {
    name: "Om Prakash",
    experienceSummary: "10+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/omprakash1.webp",
    bio: "Om Prakash is a yoga educator born and raised in Rishikesh, India. With over 10 years of teaching experience, he specializes in Applied Yoga Anatomy, Biomechanics, and Functional Movement, helping practitioners and teachers understand the mechanics of the body within yoga practice.",
    education: [
      "500-Hour Yoga Teacher Training",
      "Spinal Synergy Training",
      "Advanced Fundamentals of Yoga",
      "Biomechanics of Asana",
      "Ongoing self-study in Applied Anatomy & Movement Science",
    ],
    detailedExperience: [
      "10+ years of teaching experience",
      "Teaching Yoga Anatomy to yoga practitioners and trainees",
      "Functional movement education",
    ],
    expertise: [
      "Applied Yoga Anatomy",
      "Biomechanics of Asana",
      "Functional Movement",
      "Yoga Therapy",
      "Spinal Mechanics & Spinal Health",
    ],
  },
  {
    name: "Naveen Mingwal",
    experienceSummary: "8+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/naveen1.webp",
    bio: "Dedicated and passionate Yoga Teacher Trainer with a wealth of experience in the field. With a strong background in yogic science, he has been actively involved in teaching yoga teachers since 2015. He has trained over 1,000 teachers in India and abroad, with a significant expertise in Ashtanga and Hatha Yoga.",
    education: [
      "500-RYT Certified Yoga Teacher",
      "Certified Prenatal & Postnatal Yoga Teacher",
    ],
    detailedExperience: [
      "8+ years of teaching experience in Rishikesh",
      "Taught internationally in countries like Vietnam and China",
    ],
    expertise: [
      "Ashtanga Yoga & Vinyasa Flow",
      "Hatha Yoga",
      "Prenatal & Postnatal Yoga",
    ],
  },
  {
    name: "Yogi Mahesh ji",
    experienceSummary: "12+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/mannji1.webp",
    bio: "Yogi Mahesh ji is a very calm and humble yoga practitioner who is always ready to help others in whatever way he can, be it guiding or counseling, teaching the techniques of pranayama and meditation or teaching the therapeutic effects of Yoga. His main intention is to share with others the real essence of Yoga by which we can make the best use of this human form of life.",
    education: [
      "E-RYT 500 registered with Yoga Alliance, USA",
      "Masters in Yoga - M.Sc. (Yoga) from SVYASA, Bangalore",
    ],
    detailedExperience: [
      "12+ years of teaching experience in Rishikesh conducting workshops for teachers and children",
    ],
    expertise: [
      "Pranayama & Meditation",
      "Chakra & Kundalini Meditation",
      "Yoga Philosophy",
      "Yoga Therapy",
      "Yoga Nidra",
      "Mantra Chanting & Kirtan",
    ],
  },
  {
    name: "Dr. Akshay Vashisht",
    experienceSummary: "7+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/akshay.webp",
    bio: "Dr. Akshay Vashisht is a young and dynamic teacher. After continuously experiencing, practicing, and gaining Yogic knowledge from his Guru, he finally started his teaching in yoga in 2016. He loves teaching and sharing the deeper aspects he has gone through in his life in subjects such as Pranayama, Meditation, Yoga Philosophy, and Yoga Therapy.",
    education: [
      "PhD from the University of Patanjali",
      "Master of Science (M.Sc.) in Yoga Education from SVYASA",
      "Yoga Instructor Certificate (YIC) from SVYASA",
      "Certified Yoga Professional by the Ministry of AYUSH",
      "Registered Yoga Teacher (RYT-500) with Yoga Alliance, USA",
      "Certification in Music from the Berklee College of Music",
    ],
    detailedExperience: [
      "7+ years of teaching experience in Rishikesh",
      "Performed Kirtan Yoga in many colleges and institutions globally",
    ],
    expertise: [
      "Pranayama & Meditation",
      "Yoga Philosophy",
      "Yoga Therapy & Anatomy",
      "Mantra Music & Kirtan Instruments",
    ],
  },
  {
    name: "Meghna Banerjee",
    experienceSummary: "7+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/meghna1.webp",
    bio: "Meghna Banerjee is a yoga teacher, habit coach, and psychologist. Over the years she has gained 6+ years of experience in the health and well-being field. She has worked on psychiatric cases in rehabilitation centers and has conducted corporate yoga, meditation, and mental health sessions.",
    education: [
      "B.A. Applied Psychology from Amity University",
      "M.Sc. in Clinical Psychology from NSHM Knowledge Campus",
      "500-RYT Certification in Hatha and Ashtanga from Yoga Alliance, USA",
      "500-RYT in Kundalini Yoga from Yoga Alliance, USA",
      "Existential Well-being Counselling Certification from KULeuven, Belgium",
    ],
    detailedExperience: [
      "Mental Health professional for 4 years",
      "Yoga Teaching experience of 3 years",
      "Corporate Yoga & Mindfulness training for 2 years",
    ],
    expertise: [
      "Clinical Psychology & Therapy",
      "Meditation & Mindfulness",
      "Yoga Anatomy & Physiology",
      "Pranayama & Hatha Yoga",
    ],
  },
  {
    name: "Shubham Tadiyal",
    experienceSummary: "7+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/shubham.webp",
    bio: "As a highly qualified and energetic teacher with a keen eye for detail, he has extensive experience working with individuals of all ages. He takes great care in planning his classes, incorporating intention, asana, pranayama, and meditation to ensure participants feel reconnected with their inner energy.",
    education: [
      "Certified as a Panchakarma Technician",
      "Masters in Yoga from Himalayan Garhwal University",
      "500-RYT Certified Yoga Teacher (World Peace Yoga School)",
      "Yoga Certification Course from Uttarakhand Sanskrit University",
    ],
    detailedExperience: [
      "7+ years of overall teaching experience",
      "5+ years of teaching experience in Rishikesh",
      "2 years of teaching experience in China",
    ],
    expertise: [
      "Hatha Yoga & Vinyasa Flow",
      "Ashtanga Vinyasa Flow",
      "Power Yoga & Aerial Yoga",
      "Pranayama",
    ],
  },
  {
    name: "Ajay Pandey",
    experienceSummary: "8+ Years Experience",
    image: "https://www.nirvanayogaschoolindia.com/img/teacher/ajay.webp",
    bio: "Ajay Pandey is a dedicated and experienced yoga teacher with over 8 years of continuous teaching experience, deeply rooted in traditional yogic practices and modern alignment-based methodologies. He emphasizes correct alignment, safe adjustments, and intelligent use of props.",
    education: [
      "Master’s Degree in Yogic Science",
      "200-Hour Yoga Teacher Training Certificate (YTTC)",
      "300-Hour Advanced Yoga Teacher Training Certificate (YTTC)",
      "Registered Yoga Teacher (RYT) with Yoga Alliance",
    ],
    detailedExperience: [
      "8+ years of overall teaching experience in Rishikesh",
      "5+ years of online yoga teaching experience",
    ],
    expertise: [
      "Traditional Hatha Yoga",
      "Ashtanga Vinyasa Yoga",
      "Adjustment & Alignment Techniques",
      "Props-Based Teaching",
    ],
  },
];

export default function TeachersSection() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const springTransition = prefersReducedMotion
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 350, damping: 30 } as const);

  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        setSelectedIdx((prev) => (prev + 1) % TEACHERS.length);
      }
    }, 6000);

    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <section
      id="teachers"
      className="relative overflow-x-hidden bg-sand py-12 sm:py-16 lg:py-16 w-full"
    >
      {/* Decorative background glows */}
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
        <div className="w-full text-center mb-12 sm:mb-16 lg:mb-10">
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

        {/* 1. Desktop Layout (lg and above): Split Selector Directory + Detail Spotlight Card */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: Hover trigger to pause directory auto-rotation */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="hidden lg:grid grid-cols-[1fr_2.2fr] gap-8 items-start lg:h-[480px]"
        >
          {/* List Selector (Left) */}
          <div className="flex flex-col gap-2.5 bg-white/50 p-3.5 pr-2.5 rounded-2xl border border-ink/5 lg:h-[480px] overflow-y-auto scrollbar-thin-primary shrink-0 w-full lg:max-w-md">
            <span className="type-eyebrow text-muted text-left mb-2 px-2">
              Faculty Directory
            </span>
            {TEACHERS.map((teacher, index) => {
              const isSelected = selectedIdx === index;
              return (
                <button
                  key={`spotlight-btn-${teacher.name}`}
                  onClick={() => setSelectedIdx(index)}
                  type="button"
                  className={`relative w-full p-4 rounded-xl flex items-center gap-4.5 transition-all duration-300 border text-left cursor-pointer ${
                    isSelected
                      ? "text-white border-secondary shadow-sm scale-102"
                      : "bg-white text-ink border-ink/5 hover:border-secondary/20 hover:scale-[1.01]"
                  }`}
                  style={{
                    transform:
                      isSelected && !prefersReducedMotion
                        ? "scale(1.02)"
                        : "none",
                  }}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeTeacherBg"
                      className="absolute inset-0 bg-secondary rounded-xl z-0"
                      transition={springTransition}
                    />
                  )}
                  <div className="relative z-10 w-12 h-12 rounded-full overflow-hidden shrink-0 border border-ink/10 shadow-2xs">
                    <Image
                      src={teacher.image}
                      alt={teacher.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 relative z-10">
                    <h4 className="font-serif text-sm sm:text-base md:text-lg font-bold leading-tight truncate">
                      {teacher.name}
                    </h4>
                    <p
                      className={`text-[10px] sm:text-[11px] font-sans uppercase font-extrabold tracking-wider mt-1.5 truncate ${
                        isSelected ? "text-white/80" : "text-secondary"
                      }`}
                    >
                      {teacher.experienceSummary}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tabular Spotlight Details Card (Right) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-ink/5 hover:border-primary/10 transition-colors duration-500 w-full min-w-0 lg:h-[480px] flex flex-col lg:flex-row gap-6 md:gap-8">
            {/* Left side inside details card: Image */}
            <div className="relative w-full lg:w-[290px] aspect-[4/5] rounded-2xl overflow-hidden bg-sand border border-ink/5 shrink-0 shadow-2xs">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedIdx}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={TEACHERS[selectedIdx].image}
                    alt={TEACHERS[selectedIdx].name}
                    fill
                    sizes="(max-width: 1024px) 350px, 290px"
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right side inside details card: Scrollable details */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedIdx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col gap-6 text-left"
                >
                  <div>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-ink leading-tight mb-4">
                      {TEACHERS[selectedIdx].name}
                    </h3>

                    {/* Credentials Table */}
                    <div className="border border-ink/5 rounded-2xl overflow-hidden bg-sand/20">
                      <div className="flex flex-col border-b border-ink/5 p-3.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1.5">
                          Education
                        </span>
                        <ul className="list-disc pl-4 text-xs text-ink font-medium space-y-1">
                          {TEACHERS[selectedIdx].education.map((edu) => (
                            <li key={edu}>{edu}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-col border-b border-ink/5 p-3.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1.5">
                          Experience Details
                        </span>
                        <ul className="list-disc pl-4 text-xs text-ink font-medium space-y-1">
                          {TEACHERS[selectedIdx].detailedExperience.map(
                            (exp) => (
                              <li key={exp}>{exp}</li>
                            ),
                          )}
                        </ul>
                      </div>
                      <div className="flex flex-col p-3.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted font-bold mb-2">
                          Area of Expertise
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {TEACHERS[selectedIdx].expertise.map((exp) => (
                            <span
                              key={exp}
                              className="bg-primary/5 text-primary text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-primary/10"
                            >
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Biography */}
                  {/* <div className="border-t border-ink/5 pt-4">
                    <span className="text-[10px] uppercase tracking-wider text-muted font-bold block mb-2">
                      Biography
                    </span>
                    <p className="type-body text-muted leading-relaxed">
                      {TEACHERS[selectedIdx].bio}
                    </p>
                  </div> */}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 2. Mobile/Tablet Accordion Layout (lg-hidden): In-place Expanding Details */}
        <div className="flex flex-col gap-4 lg:hidden w-full">
          {TEACHERS.map((teacher, index) => {
            const isOpen = selectedIdx === index;
            return (
              <div
                key={`mobile-accordion-${teacher.name}`}
                className="bg-white rounded-2xl border border-ink/5 overflow-hidden transition-all duration-300 shadow-sm"
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => setSelectedIdx(isOpen ? -1 : index)}
                  type="button"
                  className={`w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors duration-300 ${
                    isOpen
                      ? "bg-secondary text-white border-b border-ink/5"
                      : "bg-white text-ink"
                  }`}
                >
                  <div className="flex items-center gap-4.5">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-ink/10 shadow-2xs">
                      <Image
                        src={teacher.image}
                        alt={teacher.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4
                        className={`font-serif text-base font-bold leading-tight truncate ${isOpen ? "text-white" : "text-ink"}`}
                      >
                        {teacher.name}
                      </h4>
                      <p
                        className={`text-[10px] sm:text-[11px] font-sans uppercase font-extrabold tracking-wider mt-1.5 truncate ${
                          isOpen ? "text-white/80" : "text-secondary"
                        }`}
                      >
                        {teacher.experienceSummary}
                      </p>
                    </div>
                  </div>
                  {/* Custom Chevron Indicator */}
                  <span
                    className={`text-xs transition-transform duration-300 font-bold ${isOpen ? "rotate-180" : ""}`}
                  >
                    ▼
                  </span>
                </button>

                {/* Collapsible Content */}
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isOpen
                      ? "max-h-[1600px] opacity-100 p-5 border-t border-ink/5"
                      : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="flex flex-col gap-6">
                    {/* Portrait */}
                    <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-sand border border-ink/5 shadow-2xs">
                      <Image
                        src={teacher.image}
                        alt={teacher.name}
                        fill
                        sizes="350px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* Credentials Table */}
                      <div className="border border-ink/5 rounded-2xl overflow-hidden bg-sand/20 text-left">
                        <div className="flex flex-col border-b border-ink/5 p-3.5">
                          <span className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1.5">
                            Education
                          </span>
                          <ul className="list-disc pl-4 text-xs text-ink font-medium space-y-1">
                            {teacher.education.map((edu) => (
                              <li key={edu}>{edu}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-col border-b border-ink/5 p-3.5">
                          <span className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1.5">
                            Experience Details
                          </span>
                          <ul className="list-disc pl-4 text-xs text-ink font-medium space-y-1">
                            {teacher.detailedExperience.map((exp) => (
                              <li key={exp}>{exp}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-col p-3.5">
                          <span className="text-[10px] uppercase tracking-wider text-muted font-bold mb-2">
                            Area of Expertise
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {teacher.expertise.map((exp) => (
                              <span
                                key={exp}
                                className="bg-primary/5 text-primary text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-primary/10"
                              >
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="pt-2 text-left">
                        <span className="text-[10px] uppercase tracking-wider text-muted font-bold block mb-1.5">
                          Biography
                        </span>
                        <p className="type-body text-muted leading-relaxed text-sm">
                          {teacher.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Footer Button */}
        <div className="mt-16 lg:mt-8 flex justify-center w-full select-none">
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
    </section>
  );
}
