import type { FaqCategoryId } from "@/content/types/faq-categories";

/** Shared content primitives used across page types. */

export type FAQ = {
  question: string;
  answer: string;
  /** One of the four fixed FAQ categories (defaults to General when omitted). */
  category?: FaqCategoryId;
};

export type CourseScheduleItem = {
  time: string;
  activity: string;
};

export type CourseSyllabusSection = {
  title: string;
  description: string;
  subtopics: string[];
};

export type CoursePricingOption = {
  /** Shared rooms table id when linked to the course/retreat catalog. */
  roomId?: string;
  roomType: string;
  price: string;
  originalPrice?: string;
  description: string;
  features: string[];
  image?: string;
};

export type CourseImageDetail = {
  url: string;
  tag?: string;
  pictured?: string;
  /** Accessible alt text */
  alt?: string;
  /** Click behaviour */
  clickAction?: import("@/content/types/cms-image").ImageClickAction;
  /** Redirect target when clickAction is `redirect` */
  redirectUrl?: string;
};

export type CourseMedia = {
  images: string[];
  imageDetails?: CourseImageDetail[];
  videos: string[];
};

export type Testimonial = {
  name: string;
  quote: string;
};

export type StickyNavItem = {
  id: `#${string}`;
  label: string;
  shortLabel: string;
};

export type Teacher = {
  name: string;
  experienceSummary: string;
  image: string;
  bio: string;
  education: string[];
  detailedExperience: string[];
  expertise: string[];
};
