import type {
  SharedAccommodationGallery,
  SharedFacility,
  SharedGalleryImage,
} from "@/content/types/shared-sections";

/** Glance chip row for the overview section */
export type RetreatProductGlanceItem = {
  label: string;
  value: string;
};

export type RetreatProductOverviewBlock = {
  heading: string;
  body: string;
};

export type RetreatProductOverviewContent = {
  eyebrow: string;
  title: string;
  lead: string[];
  glance: RetreatProductGlanceItem[];
  blocks?: RetreatProductOverviewBlock[];
  youtubeUrl?: string;
  videoTitle?: string;
};

export type RetreatProductAccommodationContent = {
  eyebrow: string;
  title: string;
  stayTitle: string;
  stayDescription: string;
  galleries: SharedAccommodationGallery[];
  facilities: SharedFacility[];
};

export type RetreatProductFoodContent = {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  dietaryNote: string;
  gallery: SharedGalleryImage[];
};

export type RetreatProductInclusionsContent = {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
  arrivalNote?: string;
};

export type RetreatProductScheduleActivityKind =
  | "wake"
  | "meditation"
  | "yoga"
  | "meal"
  | "workshop"
  | "rest"
  | "healing"
  | "community"
  | "sleep"
  | "excursion";

export type RetreatProductScheduleActivity = {
  time: string;
  title: string;
  detail?: string;
  kind: RetreatProductScheduleActivityKind;
};

/** One retreat day — mirrors `RetreatScheduleDay` on the CMS product document */
export type RetreatProductScheduleDay = {
  day: number;
  /** Optional weekday or “Day 1” override shown beside the day number */
  label?: string;
  title: string;
  note?: string;
  activities: RetreatProductScheduleActivity[];
};

export type RetreatProductScheduleContent = {
  eyebrow: string;
  title: string;
  description: string;
  days: RetreatProductScheduleDay[];
};

export type RetreatProductBatch = {
  dates: string;
  status: string;
  statusTone: "open" | "fast" | "last";
};

export type RetreatProductPackage = {
  roomId: string;
  roomType: string;
  price: string;
  originalPrice?: string;
  description: string;
};

export type RetreatProductDatesContent = {
  eyebrow: string;
  title: string;
  description: string;
  batches: RetreatProductBatch[];
  packages: RetreatProductPackage[];
};

export type RetreatProductTestimonial = {
  name: string;
  location: string;
  quote: string;
  rating: number;
};

export type RetreatProductTestimonialsContent = {
  eyebrow: string;
  title: string;
  description: string;
  items: RetreatProductTestimonial[];
};

export type RetreatProductFaqItem = {
  question: string;
  answer: string;
};

export type RetreatProductFaqContent = {
  eyebrow: string;
  title: string;
  description: string;
  items: RetreatProductFaqItem[];
};

export type RetreatProductOfferContent = {
  promoHeadline?: string;
  promoSubhead?: string;
  pricingDescription?: string;
  startingFee: string;
  bullets: string[];
  duration: string;
  /** When true, show only listed prices (no promo banner or inferred strikethrough). */
  listPriceOnly?: boolean;
};

/** CMS-mapped retreat product page sections (null = hide on the public page). */
export type RetreatProductSections = {
  overview: RetreatProductOverviewContent | null;
  inclusions: RetreatProductInclusionsContent | null;
  schedule: RetreatProductScheduleContent | null;
  accommodation: RetreatProductAccommodationContent | null;
  food: RetreatProductFoodContent | null;
  dates: RetreatProductDatesContent | null;
  testimonials: RetreatProductTestimonialsContent | null;
  faqs: RetreatProductFaqContent | null;
  offer: RetreatProductOfferContent | null;
};
