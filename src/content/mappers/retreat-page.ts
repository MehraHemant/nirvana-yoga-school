import type { StickyNavItem } from "@/components/courses/CourseStickyNav";
import type { PricingOption } from "@/components/courses/upcomingDatesShared";
import type { RetreatDocument } from "@/content/types/retreat-page";
import {
  RETREAT_FOOD_GALLERY,
  RETREAT_ROOM_GALLERIES,
} from "@/data/retreatAccommodation";

const RETREAT_NAV: StickyNavItem[] = [
  { id: "#overview", label: "Overview", shortLabel: "Overview" },
  { id: "#inclusions", label: "Inclusions", shortLabel: "Include" },
  { id: "#schedule", label: "Schedule", shortLabel: "Schedule" },
  { id: "#accommodation", label: "Lodging", shortLabel: "Lodging" },
  { id: "#pricing", label: "Packages", shortLabel: "Packages" },
  { id: "#reviews", label: "Testimonials", shortLabel: "Reviews" },
];

const FACILITIES = [
  "Purified Drinking Water",
  "Hot Water",
  "Attached bathroom",
  "Garden",
  "Environment friendly",
  "Yoga hall",
  "Free Wi-Fi",
  "Dining area",
  "Terrace",
  "Paid laundry service",
  "Shower",
];

function lowestFee(packages: RetreatDocument["packages"]): string {
  const prices = packages
    .map((pkg) => Number.parseFloat(pkg.price.replace(/[^0-9.]/g, "")))
    .filter((value) => !Number.isNaN(value));
  if (prices.length === 0) return "From 299 USD";
  return `From ${Math.min(...prices)} USD`;
}

function mapPricing(packages: RetreatDocument["packages"]): PricingOption[] {
  return packages.map((pkg) => ({
    roomType: pkg.title,
    price: pkg.price,
    originalPrice: pkg.originalPrice,
    description:
      pkg.description ??
      "Includes stay, sattvic meals, and the full retreat program.",
    features: pkg.features ?? [
      "Daily yoga & meditation",
      "Sattvic meals included",
      "Excursions & ceremonies",
    ],
    image: pkg.image,
  }));
}

/**
 * Keeps only retreat lodging tiers shown in the accommodation section
 * (private balcony + 2-shared balcony). Drops YTT-style extras like
 * 3/4-shared or non-residential options if they appear in source data.
 *
 * @param pricing - Mapped package options for a retreat
 * @returns Pricing filtered to retreat room types
 */
export function filterRetreatLodgingPricing(
  pricing: PricingOption[],
): PricingOption[] {
  return pricing.filter((option) => {
    const type = option.roomType.toLowerCase();
    if (
      type.includes("without") ||
      type.includes("no accom") ||
      /\b[34][ -]?shared\b/.test(type) ||
      type.includes("dorm")
    ) {
      return false;
    }
    return type.includes("private") || type.includes("shared");
  });
}

function mapBatches(dates: RetreatDocument["dates"]) {
  return dates.map((entry) => {
    const tone = entry.tone ?? "open";
    const isFast = tone === "fast" || tone === "last";

    return {
      dates: entry.range,
      status: isFast ? "Filling Fast" : "Open",
      spaces: entry.availability,
      statusColor: isFast
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-emerald-700 bg-emerald-50 border-emerald-200",
      tone,
    };
  });
}

/**
 * Builds a deduplicated hero media list for retreat pages — venue webp
 * room galleries first, then program and lodging photos from content JSON.
 *
 * @param retreat - Retreat document from static JSON
 * @returns Unique image URLs for CourseHero (no stock fallbacks)
 */
export function buildRetreatHeroImages(retreat: RetreatDocument): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  const add = (src?: string) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    urls.push(src);
  };

  for (const room of RETREAT_ROOM_GALLERIES) {
    for (const image of room.images) add(image.url);
  }

  for (const src of retreat.accommodation.images ?? []) add(src);
  add(retreat.accommodation.image);
  add(retreat.heroImage);

  for (const src of retreat.gallery ?? []) add(src);
  for (const src of retreat.overviewImages ?? []) add(src);
  for (const src of retreat.inclusionImages ?? []) add(src);

  for (const highlight of retreat.highlights ?? []) add(highlight.image);
  for (const day of retreat.schedule ?? []) add(day.image);
  for (const pkg of retreat.packages ?? []) add(pkg.image);

  for (const image of RETREAT_FOOD_GALLERY.slice(0, 4)) add(image.url);

  return urls;
}

export type MappedRetreatPage = {
  navItems: StickyNavItem[];
  fee: string;
  heroImage: string;
  heroImages: string[];
  pricing: PricingOption[];
  pricingDescription: string;
  batches: ReturnType<typeof mapBatches>;
  accommodationFacilities: string[];
};

export function mapRetreatPage(retreat: RetreatDocument): MappedRetreatPage {
  const heroImages = buildRetreatHeroImages(retreat);

  return {
    navItems: RETREAT_NAV,
    fee: lowestFee(retreat.packages),
    heroImage: heroImages[0] ?? retreat.heroImage,
    heroImages,
    pricing: filterRetreatLodgingPricing(mapPricing(retreat.packages)),
    pricingDescription:
      "Choose your dates and room — packages include stay, meals, and the full retreat program.",
    batches: mapBatches(retreat.dates),
    accommodationFacilities:
      retreat.accommodation.facilities &&
      retreat.accommodation.facilities.length > 0
        ? retreat.accommodation.facilities
        : FACILITIES,
  };
}

export function retreatWhatsAppHref(
  duration: string,
  roomType: string,
  batch: string,
) {
  const text = encodeURIComponent(
    `Hi Nirvana Yoga School, I would like to book the ${duration} retreat (${roomType}) for ${batch}.`,
  );
  return `https://wa.me/918218564835?text=${text}`;
}
