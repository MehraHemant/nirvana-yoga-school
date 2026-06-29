import type { TeacherProfile } from "@/components/home/TeachersSection";
import { buildAllOnlineCoursesFromSitePages } from "@/content/mappers/online-course";
import type { OnlineCourseDocument } from "@/content/types";

import { LIVE_SITE } from "@/lib/live-site";

const SITE = LIVE_SITE;

export type { OnlineCourseDocument };

const SLIDER = (n: number) => `${SITE}/img/gallery/course-slider/${n}.webp`;

const ONLINE_200_TEACHERS: TeacherProfile[] = [
  {
    name: "Gurudev Dhruvaji",
    experienceSummary: "30+ Years · E-RYT 500",
    image: `${SITE}/img/teacher/gurudev.webp`,
    bio: "Dhruvaji makes the most difficult yoga philosophy concepts easy to understand. Realized in yoga philosophy, he answers complex questions in a clear, practical way and has mentored yogis in selfless service for three decades.",
    education: [
      "M.Sc. Gold Medalist in Physical Chemistry, IIT Bombay (1989–1994)",
      "E-RYT 500 & YACEP, Yoga Alliance",
      "Master Diploma (MD) in Yoga Therapy, Jaipur",
      "Diploma in Sound Therapy (DSoT), Jaipur",
    ],
    detailedExperience: [
      "30 years of overall teaching experience",
      "3 years teaching in Rishikesh",
      "6 years teaching in Kerala",
      "4 years online teaching (Europe, USA, Australia)",
    ],
    expertise: [
      "Yoga & Asana Philosophy",
      "Pranayama Philosophy",
      "Meditation & Higher Ashtanga Yoga",
      "Chakras, Ida & Pingala Balancing",
      "Kundalini & Sushumna Awakening",
      "Ayurveda Doshas, Prakriti & Vikriti",
    ],
  },
  {
    name: "Yogi Mahesh Ji",
    experienceSummary: "5+ Years in Rishikesh",
    image: `${SITE}/img/teacher/mannji.webp`,
    bio: "A calm, humble practitioner dedicated to sharing the real essence of yoga. Mahesh Ji guides pranayama, meditation, and therapeutic yoga — helping students move from stress and agitation toward peace and self-understanding.",
    education: [
      "E-RYT 500, Yoga Alliance USA",
      "M.Sc. (Yoga), SVYASA Yoga University, Bangalore",
    ],
    detailedExperience: ["5+ years teaching in Rishikesh"],
    expertise: [
      "Pranayama",
      "Meditation",
      "Yoga Philosophy",
      "Yoga Therapy",
      "Yoga Nidra",
      "Mantra & Kirtan",
    ],
  },
  {
    name: "Amit Rana",
    experienceSummary: "12+ Years Experience",
    image: `${SITE}/img/teacher/amit.webp`,
    bio: "Passionate about spreading wellness through yoga, Amit creates a nurturing space where students feel heard and supported. He guides practitioners to deepen the connection between mind, body, and soul on the mat.",
    education: [
      "Masters in Yoga, Sanskrit Vishwa Vidyalaya Haridwar",
      "500-RYT, Yoga Padma School Rishikesh",
      "CCY, Kaivalyadhama",
      "7 years Iyengar yoga study under senior gurus",
    ],
    detailedExperience: [
      "12+ years overall teaching experience",
      "7+ years in Rishikesh",
      "4 years in Hong Kong, China",
    ],
    expertise: [
      "Hatha Yoga",
      "Alignment & Adjustment",
      "Iyengar Yoga",
      "Pranayama",
    ],
  },
  {
    name: "Aishwarya Upadhyay",
    experienceSummary: "5+ Years Experience",
    image: `${SITE}/img/teacher/aishwarya.webp`,
    bio: "A qualified, certified teacher with a deep interest in continued learning. Aishwarya explains asana, pranayama, and meditation clearly — and addresses each student's needs with professional, attentive guidance.",
    education: [
      "M.A. Yogic Science, Maharaja Agrasen Himalayan Garhwal University",
      "P.G. Diploma in Yogic Science, Uttarakhand Sanskrit University",
      "M.Sc. Food Science & Nutrition, Banasthali Vidyapeeth",
      "500-hour RYT · 85-hour Yin · Pre-natal · Aerial yoga certified",
    ],
    detailedExperience: [
      "5+ years overall teaching experience",
      "3+ years in Rishikesh",
    ],
    expertise: [
      "Yin Yoga",
      "Ashtanga Vinyasa Flow",
      "Yoga Anatomy",
      "Alignment & Adjustment",
      "Pre-natal & Post-natal Yoga",
      "Hatha Yoga",
    ],
  },
  {
    name: "Naveen Mingwal",
    experienceSummary: "8+ Years in Rishikesh",
    image: `${SITE}/img/teacher/naveen1.webp`,
    bio: "A dedicated yoga teacher trainer with 500-hour Yoga Alliance certification. Naveen has trained over 1,000 teachers in India and abroad, with deep expertise in Ashtanga and Hatha yoga.",
    education: [
      "500-RYT certified Yoga Teacher",
      "Certified Pre-natal & Post-natal Yoga Teacher",
    ],
    detailedExperience: [
      "8+ years teaching in Rishikesh",
      "International teaching in Vietnam and China",
    ],
    expertise: [
      "Ashtanga Yoga",
      "Vinyasa Flow",
      "Hatha Yoga",
      "Pre-natal & Post-natal Yoga",
    ],
  },
];

export const ONLINE_COURSES: Record<string, OnlineCourseDocument> = {
  "200-hour-online-yoga-teacher-training": {
    slug: "200-hour-online-yoga-teacher-training",
    title: "200 Hour Online Hatha Ashtanga Vinyasa Yoga Teacher Training",
    subtitle:
      "Yoga Alliance certified · self-paced · lifetime access — learn Hatha, Ashtanga, philosophy, pranayama, meditation & anatomy from home.",
    level: "Beginner to Intermediate",
    duration: "Self-Paced",
    certification: "RYT-200, Yoga Alliance",
    fee: "$299 USD",
    image: SLIDER(1),
    certBadge: `${SITE}/img/rys200.png`,
    heroImages: Array.from({ length: 16 }, (_, i) => SLIDER(i + 1)),
    overview:
      "The 200-hour online yoga teacher training is a beginner to intermediate program for students who want a strong foundation in yoga — and the option to teach. Access pre-recorded sessions in Hatha yoga, Ashtanga yoga, philosophy, pranayama, meditation, and anatomy with lifetime access at your own pace.\n\nKnowledgeable gurus support you through course materials, e-books, and Q&A. Upon completion, receive your certificate and become eligible to register as RYT-200 with Yoga Alliance USA.",
    highlights: [
      "Self-paced — learn on your schedule",
      "Lifetime access to videos & resources",
      "4K video · studio-quality audio",
      "RYT-200 eligible upon completion",
    ],
    syllabusDescription:
      "Our curriculum follows Yoga Alliance USA standards for 200-hour teacher training — crafted by experienced teachers and covering technique, anatomy, humanities, and professional essentials.",
    syllabus: [
      {
        title: "Traditional Hatha Yoga",
        description:
          "Foundational Hatha practice, classical sequences, and posture study.",
        subtopics: [
          "Historical contexts of Hatha yoga",
          "Surya Namaskar & Chandra Namaskar",
          "Pawan Muktasana series A, B, C",
          "Standing, kneeling, sitting & supine asana groups",
          "Backward bending, forward bending & spinal twists",
          "Balancing, inverted & relaxation asanas",
          "Standing, kneeling, sitting, pronation & supination sequences",
        ],
      },
      {
        title: "Ashtanga Vinyasa Yoga",
        description:
          "Primary series, vinyasa flow, and traditional Ashtanga methodology.",
        subtopics: [
          "Historical context of Ashtanga Vinyasa",
          "Primary series with alignment, variations & contraindications",
          "Surya Namaskar A (9 vinyasas) & B (17 vinyasas)",
          "Standing, sitting & closing sequences",
          "Understanding & practice of Vinyasa flow",
        ],
      },
      {
        title: "Alignment & Adjustment",
        description:
          "Hands-on and verbal alignment principles for safe teaching.",
        subtopics: [
          "Aspects of yoga alignment",
          "Principles of hands-on adjustments",
          "Practical alignment labs for key asanas",
        ],
      },
      {
        title: "Pranayama & Subtle Body",
        description:
          "Breathing practices, pranic anatomy, and classical pranayama techniques.",
        subtopics: [
          "Historical context of pranayama",
          "Four aspects of pranayama & the pranic body",
          "Nadis, Ida, Pingala, Sushumna & chakras",
          "Abdominal, thoracic, clavicular & yogic breathing",
          "Nadi Shodhana, Sheetali, Bhramari, Ujjayi, Bhastrika, Kapalbhati & more",
        ],
      },
      {
        title: "Mudras & Bandhas",
        description: "Energy locks and hand gestures in yogic practice.",
        subtopics: [
          "Five element theory & key mudras (Jnana, Chin, Hridaya, Shoonya, Apan, Prana, Vayu, Prithvi, Buddhi)",
          "Jalandhara, Moola, Uddiyana & Maha Bandha",
        ],
      },
      {
        title: "Meditation & Yoga Nidra",
        description: "Guided and self-directed meditation practices.",
        subtopics: [
          "History and philosophy of meditation",
          "Ajapa Japa, mindfulness, Trataka & chakra meditation",
          "Guided meditation & Yoga Nidra",
        ],
      },
      {
        title: "Anatomy, Physiology & Biomechanics",
        description: "Body systems, movement science, and safe practice.",
        subtopics: [
          "Skeletal, muscular, nervous & endocrine systems",
          "Respiratory, cardiovascular & digestive systems",
          "Biomechanics: force, joint movements & safe movement",
        ],
      },
      {
        title: "Yoga Philosophy & Ethics",
        description: "Classical texts, history, and yogic ethics.",
        subtopics: [
          "History and meaning of yoga",
          "Patanjali Yoga Sutras & the eight limbs",
          "Bhagavad Gita — key teachings",
        ],
      },
      {
        title: "Teaching Methodology & Professional Development",
        description:
          "Sequencing, cueing, practicum, and Yoga Alliance registration.",
        subtopics: [
          "Sequencing, pace & class environment",
          "Verbal cues & teaching practicum",
          "Mentoring, feedback & ethical pledge",
          "Yoga Alliance certification pathway",
          "Professionalism & lifelong learning",
        ],
      },
    ],
    scheduleDescription:
      "Optional live Q&A sessions (IST) for enrolled students — join weekly to clarify concepts and connect with teachers.",
    schedule: [
      { time: "Saturday · 4:00 PM", activity: "Live Q&A session (1 hour)" },
      { time: "Saturday · 6:00 PM", activity: "Live Q&A session (1 hour)" },
      { time: "Sunday · 4:00 PM", activity: "Live Q&A session (1 hour)" },
    ],
    pricingDescription:
      "Lifetime access · self-paced · 20% off with code NIRVANA (valid till 30 June 2026).",
    pricing: [
      {
        roomType: "Full Online Course",
        price: "$299 USD",
        description:
          "One-time payment · lifetime access · RYT-200 certificate upon completion.",
        features: [
          "Pre-recorded 4K course videos",
          "e-Books, manual & assignments",
          "Email & WhatsApp support",
          "Eligible for Yoga Alliance RYT-200",
        ],
        image: SLIDER(1),
      },
    ],
    inclusions: [
      "Pre-recorded course videos (4K video, 48kHz audio)",
      "Lifetime access to videos & educational resources",
      "Self-paced — complete at your own pace",
      "e-Books and a course manual",
      "Assignments & practical exam",
      "Course completion certificate",
      "Eligible to register as RYT-200 with Yoga Alliance",
      "Email & WhatsApp support",
    ],
    exclusions: [],
    faqs: [
      {
        question: "How long does it take to complete 200 hours online?",
        answer:
          "Upon registering, you choose how long you need access to the materials and learn entirely at your own pace — there is no fixed deadline.",
      },
      {
        question: "What is a 200-hour online teacher training?",
        answer:
          "It is a flexible pathway to build a strong yoga foundation through detailed lectures, handouts, and pre-recorded classes — ideal if you cannot travel to India.",
      },
      {
        question: "Are online yoga courses worth it?",
        answer:
          "Online training lets you advance at your own pace and fits busy schedules. If travel is difficult, it is an excellent way to earn a recognized certification from home.",
      },
      {
        question: "Is online or in-person better?",
        answer:
          "Both have value. Online is affordable and flexible; in-person offers ashram immersion. Choose what fits your life and learning style.",
      },
      {
        question: "Can beginners join this course?",
        answer:
          "Yes. The program is designed for beginners and builds a thorough foundation in yoga theory and practice.",
      },
      {
        question: "Is there an exam?",
        answer:
          "Yes. After completing the modules you submit 2–3 practice and teaching videos plus written assignments for assessment.",
      },
      {
        question: "What payment methods are accepted?",
        answer:
          "We accept PayPal and credit/debit cards. For bank transfer, contact us by email or WhatsApp.",
      },
    ],
    teachers: ONLINE_200_TEACHERS,
    testimonials: [
      {
        name: "Joshua Anderson",
        quote:
          "I had a great experience doing the online 200-hours at Nirvana. The resources were very informative and the teachers had great command of their subjects.",
      },
      {
        name: "Isabella Harris",
        quote:
          "The online course helped me continue working while learning yoga. The online Q&A was very helpful — I recommend Nirvana to everyone.",
      },
      {
        name: "Emma Davis",
        quote:
          "The yoga chapters were easy to understand. Nirvana offers traditional yoga in a very accessible way. I enjoyed my 200-hour journey.",
      },
      {
        name: "Manisha Mehra",
        quote:
          "I enjoyed the sessions a lot and gained in-depth knowledge across different areas of yoga. The teachers were very approachable.",
      },
    ],
    ctaPrimary: "Buy Now",
    ctaPrimaryHref:
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1600&q=85",
    ctaSecondary: "Free Preview",
    ctaSecondaryHref:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1600&q=85",
    navItems: [
      { id: "#overview", label: "Overview", shortLabel: "Overview" },
      { id: "#inclusions", label: "Inclusions", shortLabel: "Include" },
      { id: "#syllabus", label: "Curriculum", shortLabel: "Curriculum" },
      { id: "#schedule", label: "Live Classes", shortLabel: "Live" },
      { id: "#teachers", label: "Teachers", shortLabel: "Teachers" },
      { id: "#testimonials", label: "Reviews", shortLabel: "Reviews" },
      { id: "#pricing", label: "Pricing", shortLabel: "Pricing" },
      { id: "#faq", label: "FAQ", shortLabel: "FAQ" },
    ],
  },
  ...buildAllOnlineCoursesFromSitePages([
    "200-hour-online-yoga-teacher-training",
  ]),
};
