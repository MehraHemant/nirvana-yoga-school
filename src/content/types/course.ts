import type {
  CoursePricingOption,
  CourseScheduleItem,
  CourseSyllabusSection,
  FAQ,
  StickyNavItem,
  Teacher,
  Testimonial,
} from "@/content/types/shared";

/** Base course document — residential and online share this shape. */
export type CourseDocument = {
  slug: string;
  title: string;
  subtitle: string;
  level: string;
  duration: string;
  certification: string;
  fee: string;
  image: string;
  certBadge?: string;
  heroImages?: string[];
  overview: string;
  highlights: string[];
  syllabusDescription: string;
  syllabus: CourseSyllabusSection[];
  scheduleDescription: string;
  schedule: CourseScheduleItem[];
  pricingDescription: string;
  pricing: CoursePricingOption[];
  inclusions: string[];
  exclusions: string[];
  faqs: FAQ[];
};

/** In-person YTT course (Rishikesh residential programs). */
export type ResidentialCourseDocument = CourseDocument;

/** Online course with commerce + teacher fields. */
export type OnlineCourseDocument = CourseDocument & {
  teachers: Teacher[];
  testimonials: Testimonial[];
  ctaPrimary: string;
  ctaPrimaryHref: string;
  ctaSecondary: string;
  ctaSecondaryHref: string;
  navItems: StickyNavItem[];
};

/** Commerce metadata stored separately (DB/API friendly). */
export type OnlineCourseMeta = {
  enrollId: string;
  price: string;
  video: string | null;
  testimonials: Testimonial[];
  faqs: FAQ[];
};
