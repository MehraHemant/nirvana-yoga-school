import type { StickyNavItem } from "@/components/courses/CourseStickyNav";
import { pagePath } from "@/content/pages/path";
import { LIVE_SITE } from "@/lib/live-site";
import { RYT_BADGE, STOCK_IMAGES } from "@/lib/stock-images";

const SITE = LIVE_SITE;

export const YTT_HUB_HERO_IMAGE = STOCK_IMAGES.ganges;
export const YTT_HUB_OVERVIEW_IMAGE = STOCK_IMAGES.groupClass;
export const YTT_HUB_OVERVIEW_INSET_IMAGE = STOCK_IMAGES.meditation;

export const YTT_HUB_INTRO = {
  pill: "Unleash Your Inner Light",
  title: "Yoga Teacher Training in Rishikesh, India",
  lead: "Are you considering Yoga Teacher Training in Rishikesh? Then, you have come to the right place. You will get the best teaching from our experienced teachers in a crisp and pure spiritual environment where the holy river Ganga flows through.",
  overviewPoints: [
    "Crafted to develop a proper understanding of yoga and help you become a confident, skilled teacher",
    "Experience the yogic life of the Himalayas and transform your yoga and meditation practices",
    "Gain in-depth knowledge of yoga sutras, asana, philosophy, and yogic principles",
    "Internationally certified courses — learn the authenticity of yoga from its roots in India",
    "Interactive, traditional teaching that follows the same lineage as our sages",
    "Begin your journey to becoming a certified yoga teacher with Nirvana Yoga School",
  ],
  stats: [
    { value: "10+", label: "Courses" },
    { value: "20+", label: "Teachers" },
    { value: "10+", label: "Years Experienced Teachers" },
    { value: "5", label: "Star Rating" },
  ],
} as const;

export const YTT_HUB_WHY_RISHIKESH = {
  title: "Why choose Rishikesh for the Yoga Teacher Training course?",
  paragraphs: [
    "Rishikesh is the yoga capital of the world because of its peaceful vibes, beautiful locations, ancient temples, spiritual roots, and ashrams. It is home to the most famous yoga ashrams and schools because of its spiritual heritage. The yoga teacher training in Rishikesh offers a journey of transformation, self-discovery, and personal growth. Natural surroundings and a serene environment enhance the yoga learning process.",
    "Rishikesh has spiritual significance and many sages have practiced yoga here. Rituals and chanting create a spiritual and powerful vibe in the atmosphere. Spending your evening here leaves a spiritual imprint and encourages you to follow a yogic path. There are a lot of ashrams that will provide you with ancient knowledge of religion and spirituality.",
  ],
  images: [
    `${SITE}/img/home/banner_3.webp`,
    `${SITE}/img/home/banner_2.webp`,
    `${SITE}/img/home/ban3.webp`,
  ],
} as const;

export const YTT_HUB_COURSES_INTRO = {
  title: "Yoga Teacher Training Courses",
  paragraphs: [
    "The Yoga Teacher Training in India will be a life-changing experience for you. You will receive certification from Yoga Alliance USA to become a registered yoga teacher. Students will be able to push their bodies to new limits and learn something extraordinary. Spirituality in India is stored and protected for many centuries. As a result, you will be able to explore more spiritual experiences here in India.",
    "Our Yoga Teacher Training courses in India are based on a more interactive approach so that students can relate to the yoga practices. Students can reach a blissful state through self-awareness and practice. We follow the traditional forms of yoga to make the classes approachable and easy. Nirvana Yoga School follows the same tradition as our sages to impart our experience and knowledge. We offer yoga training in Rishikesh for every level from beginners to intermediate to experts which mainly includes the following courses.",
  ],
} as const;

export type YttHubCourse = {
  title: string;
  description: string;
  overview: string;
  focusAreas: string[];
  level: string;
  certification: string;
  duration: string;
  fee: string;
  image: string;
  certBadge: string;
  href: string;
};

export const YTT_HUB_COURSES: YttHubCourse[] = [
  {
    title:
      "200 Hour Hatha Ashtanga Vinyasa Yoga Teacher Training in Rishikesh India",
    description:
      "This 25-day 200 hour yoga teacher training in Rishikesh guides you on how to become a certified yoga instructor. You will gain a solid base to deepen your practices and improve your teaching skills. The training includes theory and practical classes on asanas, pranayama, meditation, anatomy, teaching methodology, and yoga philosophy.",
    overview:
      "A foundational residential program blending Hatha, Ashtanga, and Vinyasa — designed to build confident teaching skills from the ground up.",
    focusAreas: [
      "Daily asana, pranayama & meditation practice",
      "Anatomy, alignment & teaching methodology",
      "Yoga philosophy, sutras & lifestyle ethics",
    ],
    level: "Beginner to intermediate",
    certification: "RYT-200, Yoga Alliance",
    duration: "25 Days",
    fee: "649 USD",
    image: STOCK_IMAGES.asana,
    certBadge: RYT_BADGE,
    href: pagePath({
      type: "course",
      slug: "200-hour-yoga-teacher-training-in-rishikesh-india",
    }),
  },
  {
    title:
      "200 Hour Ayurveda & Hatha Yoga Teacher Training in Rishikesh, India",
    description:
      "The 200-hour Ayurveda teacher training in Rishikesh is a 25-day program that will give you in-depth knowledge about the science of life as per Ayurveda. The program offers an ancient understanding of our physiological constitution and balancing nutrition as per doshas.",
    overview:
      "Integrate classical Hatha yoga with Ayurvedic wisdom — understanding body types, nutrition, and holistic wellness for teaching.",
    focusAreas: [
      "Prakriti, doshas & Ayurvedic daily routines",
      "Sattvic nutrition & therapeutic lifestyle",
      "Hatha asana integrated with Ayurvedic principles",
    ],
    level: "Beginner to intermediate",
    certification: "RYT-200, Yoga Alliance",
    duration: "25 Days",
    fee: "649 USD",
    image: STOCK_IMAGES.wellness,
    certBadge: RYT_BADGE,
    href: pagePath({
      type: "course",
      slug: "200-hour-ayurveda-yoga-teacher-training-in-rishikesh-india",
    }),
  },
  {
    title:
      "200 Hour Meditation Yoga Nidra & Hatha Yoga Teacher Training in Rishikesh India",
    description:
      "The 200-hour Meditation and Yoga Nidra Teacher Training in Rishikesh is a 25-day course that will help you gain the fundamental knowledge to master the practice of meditation and yoga nidra, with guidance on teaching both.",
    overview:
      "Deepen inner stillness while learning to guide others — a specialized path for meditation, Yoga Nidra, and mindful Hatha practice.",
    focusAreas: [
      "Meditation techniques & class sequencing",
      "Yoga Nidra scripting & facilitation",
      "Foundational Hatha, pranayama & shatkarma",
    ],
    level: "Beginner to intermediate",
    certification: "RYT-200, Yoga Alliance",
    duration: "25 Days",
    fee: "649 USD",
    image: STOCK_IMAGES.meditation,
    certBadge: RYT_BADGE,
    href: pagePath({
      type: "course",
      slug: "200-hour-meditation-teacher-training-in-rishikesh-india",
    }),
  },
  {
    title: "200 Hour Kundalini Yoga Teacher Training in Rishikesh India",
    description:
      "Become a certified Kundalini yoga teacher by joining our 25-day 200-Hour Kundalini Yoga Teacher Training in Rishikesh. The training covers Mantras, Pranayama, Kundalini Asana, kriyas, Mudras, and Meditation.",
    overview:
      "Awaken and channel energy safely through mantra, kriya, mudra, and meditative practices rooted in the Kundalini tradition.",
    focusAreas: [
      "Kundalini kriyas, bandhas & energy anatomy",
      "Mantra, mudra & pranayama for awakening",
      "Guided meditation & teaching methodology",
    ],
    level: "Beginner to intermediate",
    certification: "RYT-200, Yoga Alliance",
    duration: "25 Days",
    fee: "649 USD",
    image: STOCK_IMAGES.yogaPractice,
    certBadge: RYT_BADGE,
    href: pagePath({
      type: "course",
      slug: "200-hour-kundalini-yoga-teacher-training-in-rishikesh-india",
    }),
  },
  {
    title:
      "300 Hour Hatha Ashtanga Vinyasa Ayurveda and Yoga Therapy Teacher Training In Rishikesh India",
    description:
      "This 300 hour yoga teacher training in Rishikesh is a detailed and advanced study of yoga. You will delve into advanced yoga knowledge for professional growth and personal transformation. For graduates of 200-hour training.",
    overview:
      "An advanced residential immersion for RYT-200 graduates — expanding skill, therapy knowledge, and professional teaching depth.",
    focusAreas: [
      "Advanced asana, alignment & adjustments",
      "Yoga therapy, Ayurveda & therapeutic sequencing",
      "Professional teaching labs & mentorship",
    ],
    level: "Intermediate to advanced",
    certification: "RYT-300, Yoga Alliance",
    duration: "29 Days",
    fee: "From 899 USD",
    image: STOCK_IMAGES.teacher,
    certBadge: RYT_BADGE,
    href: pagePath({
      type: "course",
      slug: "300-hour-yoga-teacher-training-in-rishikesh-india",
    }),
  },
  {
    title:
      "500 Hour Hatha Ashtanga Vinyasa Ayurveda & Yoga Therapy Teacher Training in Rishikesh, India",
    description:
      "Our 500 hour yoga teacher training in Rishikesh is for beginners who want to master yoga skills. This training is 2 months of continuous study that offers you to become an RYT 500 — a combination of 200 hour YTTC followed by 300 hour YTTC.",
    overview:
      "The complete two-month pathway from beginner foundations to advanced mastery — earn RYT-500 through one continuous ashram immersion.",
    focusAreas: [
      "Full 200h foundation + 300h advanced curriculum",
      "Progressive teaching practice from day one",
      "RYT-500 certification & career-ready skills",
    ],
    level: "Beginner to advanced",
    certification: "RYT-500, Yoga Alliance",
    duration: "59 Days",
    fee: "From 1449 USD",
    image: STOCK_IMAGES.studio,
    certBadge: RYT_BADGE,
    href: pagePath({
      type: "course",
      slug: "500-hour-yoga-teacher-training-in-rishikesh-india",
    }),
  },
];

export const YTT_HUB_ELIGIBILITY = {
  title: "Eligibility & Certification",
  paragraphs: [
    "Teachers need a certificate or credential to teach yoga and Yoga Alliance is the largest organization that certifies teachers worldwide. Nirvana Yoga School meets all the standards set by Yoga Alliance and is a registered yoga school.",
    "200-hour yoga teacher training is the basic level that provides RYT 200 certification. After that, 300 hours provides RYT 300. The highest certification is 500-hour training and you will get an RYT 500 certificate after completing the course.",
    "Anyone can become a registered yoga teacher for every form of yoga including Hatha, Vinyasa, and Ashtanga. You must enroll in a minimum of 200-hour yoga teacher training from a registered yoga school to become certified.",
  ],
} as const;

export const YTT_HUB_TEACHERS = [
  {
    name: "Jeet Thapliyal",
    summary: "9 years of teaching experience",
    image: `${SITE}/img/teacher/jeet-thapliyal.webp`,
  },
  {
    name: "Yogi Mahesh Ji",
    summary: "7+ years of teaching experience",
    image: `${SITE}/img/teacher/mannji1.webp`,
  },
  {
    name: "Dr. Akshay Vashisht",
    summary: "7+ years of teaching experience",
    image: `${SITE}/img/teacher/akshay.webp`,
  },
  {
    name: "Meghna Banerjee",
    summary: "7+ years of teaching experience",
    image: `${SITE}/img/teacher/meghna1.webp`,
  },
  {
    name: "Amit Rana",
    summary: "12+ years of teaching experience",
    image: `${SITE}/img/teacher/amit.webp`,
  },
  {
    name: "Naveen Mingwal",
    summary: "8+ years of teaching experience",
    image: `${SITE}/img/teacher/naveen1.webp`,
  },
  {
    name: "Bhawana Bulatia",
    summary: "12+ years of Corporate Trainer",
    image: `${SITE}/img/teacher/bhawana.webp`,
  },
  {
    name: "Kanna",
    summary: "10+ years experienced teachers",
    image: `${SITE}/img/teacher/kanna.webp`,
  },
  {
    name: "Shubham Tadiyal",
    summary: "7+ years of teaching experience",
    image: `${SITE}/img/teacher/gurudev.webp`,
  },
  {
    name: "Ajay Pandey",
    summary: "8+ years of teaching experience",
    image: `${SITE}/img/teacher/gurudev.webp`,
  },
  {
    name: "Jitendra Singh Bhandari",
    summary: "20+ years of teaching experience",
    image: `${SITE}/img/teacher/gurudev.webp`,
  },
  {
    name: "Om Prakash",
    summary: "10+ years of teaching experience",
    image: `${SITE}/img/teacher/gurudev.webp`,
  },
] as const;

export type YttHubTestimonial = {
  name: string;
  quote: string;
  platform: "google" | "tripadvisor";
  headline?: string;
};

export const YTT_HUB_TESTIMONIALS: YttHubTestimonial[] = [
  {
    platform: "google",
    name: "Ole Netek",
    headline: "Well Organized & Very Professional",
    quote:
      "I've just completed the 200 hours Hatha Ashtanga Teacher training. The program was well organized & the school is very professional in terms of structure, responding & helping out. I am really thankful for the dedicated & passionate teachers at Nirvana!",
  },
  {
    platform: "google",
    name: "Valentina Catenacci",
    headline: "An amazing place to make meaningful connections",
    quote:
      "Nirvana Yoga school is an amazing place where you will learn so much more than what they state in their program! An amazing place to make meaningful connections and grow!",
  },
  {
    platform: "google",
    name: "Usha Singh",
    headline: "What a great experience!",
    quote:
      "My experience at Nirvana Yoga School has been beyond what I ever expected. This place felt more like a family than just a school. The teachers are incredibly knowledgeable, well-experienced, and truly dedicated to their students' growth.",
  },
  {
    platform: "google",
    name: "Niall Phelan",
    headline: "Magical and Informative",
    quote:
      "Best investment i have ever made, both in terms my own wellbeing and in that I will be able to impart on others through the teaching knowledge and skills. Guru Dhruvaji made the experience especially magical and informative.",
  },
  {
    platform: "tripadvisor",
    name: "Eve Lesage",
    headline: "Very grateful for this training",
    quote:
      "I recently completed 300 hour Yoga Teacher Training at Nirvana, and it was an incredible journey. The instructors were so supportive, and truly passionate about yoga. I’m very grateful for this training and recommend it to anyone looking to deepen their practice or become a teacher.",
  },
  {
    platform: "tripadvisor",
    name: "Joan Nakazono",
    headline: "Once-in-a-lifetime Experience",
    quote:
      "I feel incredibly fortunate to have completed my 200-hour Yoga Teacher Training at Nirvana Yoga School. From the start, the professionalism, expertise, and unwavering support of the teachers truly stood out.",
  },
  {
    platform: "tripadvisor",
    name: "Beatrice Ani-Asamoah",
    headline: "Incredible & Life Changing Experience",
    quote:
      "Nirvana Yoga School was an incredible experience for me, more than I ever imagined it would be. Home it was — we were one big family with Sachin, our Guru and all the teaching staff.",
  },
];

export const YTT_HUB_NAV: StickyNavItem[] = [
  { id: "#about", label: "Overview", shortLabel: "Overview" },
  { id: "#video", label: "Student Videos", shortLabel: "Videos" },
  { id: "#gallery", label: "Gallery", shortLabel: "Gallery" },
  { id: "#why-rishikesh", label: "Why Rishikesh", shortLabel: "Why" },
  { id: "#courses", label: "Courses", shortLabel: "Courses" },
  { id: "#certification", label: "Certification", shortLabel: "Cert" },
  { id: "#teachers", label: "Teachers", shortLabel: "Teachers" },
  { id: "#reviews", label: "Testimonials", shortLabel: "Reviews" },
  { id: "#faq", label: "FAQ", shortLabel: "FAQ" },
];

export const YTT_HUB_FAQS = [
  {
    question: "How can I become a yoga teacher?",
    answer:
      "In order to become a yoga teacher one should complete a minimum of 200 hours of yoga teacher training course (RYT-200) from a Yoga Alliance-certified school.",
  },
  {
    question: "Why yoga teacher training in India?",
    answer:
      "When you attend the yoga teacher training in India, you will get an opportunity to immerse yourself in the rich spiritual and cultural traditions that have shaped the yoga practice for centuries. India has many great talents when we talk about yoga teachers.",
  },
  {
    question: "Is a yoga teacher a good career?",
    answer:
      "Of course, it is. Becoming a yoga teacher can be a fulfilling career choice for those passionate about yoga and helping others. With increasing awareness of fitness and the importance of yoga worldwide, teaching yoga is undoubtedly one of the best career options.",
  },
  {
    question:
      "What qualifications do you need to join yoga teacher training in Rishikesh?",
    answer:
      "There is no such specific qualification required to attend this course. This course is open to everyone. Since this course will be held in English, one should be able to follow English lessons.",
  },
  {
    question: "What is the most popular yoga Teacher training course?",
    answer:
      "The most popular course is 200 hour Yoga Teacher Training course. The 200-hour certification is globally accepted.",
  },
  {
    question: "Can a beginner do yoga teacher training?",
    answer:
      "Yes, a beginner can do yoga teacher training. However, it is advised to have a minimum of 2-3 months of experience in yoga.",
  },
  {
    question: "Which is the best yoga teacher training course for a beginner?",
    answer:
      "The best courses for a beginner are 200-hour or 500-hour yoga teacher training courses. 200 hour cover beginner to intermediate level topics and the 500 hour cover beginner to advanced level topics.",
  },
  {
    question: "How can I start teaching yoga?",
    answer:
      "In order to start teaching yoga, you should first complete either 200 hours or 500 hours of Yoga TTC from any Yoga Alliance-certified school and then register yourself as a certified yoga teacher in the Yoga Alliance.",
  },
  {
    question: "Can you teach yoga without certification?",
    answer:
      "No, since yoga requires a lot of practice and a precise understanding of human anatomy, philosophy, asanas, and other aspects of yoga, one will not be allowed to teach without certification.",
  },
  {
    question: "What is the fee for yoga teacher training in India?",
    answer:
      "The average fee for yoga teacher training in India starts from $800 USD including the accommodation and food facilities.",
  },
  {
    question: "What is the highest level of yoga teacher training?",
    answer:
      "The highest level of yoga teacher training is 500-RYT stands for 500 hours Registered Yoga Teacher. This certification will be provided to those who have completed the 500 hours of yoga teacher training.",
  },
];
