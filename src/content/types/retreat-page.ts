import type { FAQ } from "@/content/types/shared";

export type RetreatScheduleActivity = {
  time: string;
  activity: string;
};

export type RetreatScheduleDay = {
  day: number;
  title: string;
  note?: string;
  image?: string;
  activities: RetreatScheduleActivity[];
};

export type RetreatPackage = {
  /** Shared retreat room id when this package maps to a catalog room. */
  roomId?: string;
  title: string;
  price: string;
  originalPrice?: string;
  image?: string;
  features?: string[];
  description?: string;
};

export type RetreatDate = {
  range: string;
  availability: string;
  tone?: "open" | "fast" | "last";
};

export type RetreatHighlight = {
  title: string;
  description: string;
  image: string;
};

export type RetreatOffer = {
  label: string;
  note: string;
  items: string[];
};

export type RetreatAccommodation = {
  body: string;
  images: string[];
  image?: string;
  facilities?: string[];
};

export type RetreatDocument = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  heroImage: string;
  duration: string;
  overview: string;
  overviewImages: string[];
  inclusions: string[];
  inclusionImages: string[];
  schedule: RetreatScheduleDay[];
  accommodation: RetreatAccommodation;
  packages: RetreatPackage[];
  dates: RetreatDate[];
  highlights: RetreatHighlight[];
  gallery: string[];
  faqs: FAQ[];
  offer?: RetreatOffer;
  ctaLabel: string;
  ctaHref: string;
};
