import type { FAQ } from "@/content/types/shared";

/** Activity icon/category on retreat product day schedule (optional in CMS). */
export type RetreatScheduleActivityKind =
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

export type RetreatScheduleActivity = {
  time: string;
  /** Shown as the activity title on the public retreat schedule */
  activity: string;
  detail?: string;
  kind?: RetreatScheduleActivityKind;
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
  ctaLabel: string;
  ctaHref: string;
};
