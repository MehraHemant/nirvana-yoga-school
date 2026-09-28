import type { StickyNavItem } from "@/components/courses/CourseStickyNav";
import type { PricingOption } from "@/components/courses/upcomingDatesShared";
import { DEFAULT_RETREAT_NAV } from "@/content/page-modules-defaults";
import type { RetreatDocument } from "@/content/types/retreat-page";
import type { ResidentialLifeContent } from "@/content/types/shared-sections";

const RETREAT_PUBLIC_NAV_IDS = new Set<StickyNavItem["id"]>([
  "#overview",
  "#inclusions",
  "#schedule",
  "#accommodation",
  "#pricing",
  "#reviews",
  "#faq",
]);

/**
 * Keeps sticky-nav items that match sections on the live retreat pages.
 *
 * @param items - CMS or mapped nav items
 * @param options.showFaqs - Whether the FAQ section will render
 * @param options.showReviews - Whether testimonials will render
 */
export function filterRetreatNavItems(
  items: StickyNavItem[],
  options: { showFaqs: boolean; showReviews: boolean },
): StickyNavItem[] {
  const filtered = items.filter((item) => {
    if (!RETREAT_PUBLIC_NAV_IDS.has(item.id)) return false;
    if (item.id === "#faq") return options.showFaqs;
    if (item.id === "#reviews") return options.showReviews;
    return true;
  });

  if (
    options.showReviews &&
    !filtered.some((item) => item.id === "#reviews")
  ) {
    const faqIndex = filtered.findIndex((item) => item.id === "#faq");
    const reviewsItem = {
      id: "#reviews" as const,
      label: "Testimonials",
      shortLabel: "Reviews",
    };
    if (faqIndex >= 0) filtered.splice(faqIndex, 0, reviewsItem);
    else filtered.push(reviewsItem);
  }

  if (options.showFaqs && !filtered.some((item) => item.id === "#faq")) {
    filtered.push({ id: "#faq", label: "FAQ", shortLabel: "FAQ" });
  }

  return filtered;
}

function lowestFee(packages: RetreatDocument["packages"]): string {
  const prices = packages
    .map((pkg) => Number.parseFloat(pkg.price.replace(/[^0-9.]/g, "")))
    .filter((value) => !Number.isNaN(value));
  if (prices.length === 0) return "From 299 USD";
  return `From ${Math.min(...prices)} USD`;
}

function mapPricing(packages: RetreatDocument["packages"]): PricingOption[] {
  return packages.map((pkg) => ({
    roomId: pkg.roomId,
    roomType: pkg.title,
    price: pkg.price,
    originalPrice: pkg.originalPrice,
    description: pkg.description ?? "",
    features: pkg.features ?? [],
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
 * Builds a deduplicated hero media list for retreat pages — room galleries
 * first, then program and lodging photos from content JSON.
 *
 * @param retreat - Retreat document from MySQL
 * @param residentialLife - Course-compatible lodging/food document
 * @returns Unique image URLs for CourseHero (no stock fallbacks)
 */
export function buildRetreatHeroImages(
  retreat: RetreatDocument,
  residentialLife: ResidentialLifeContent | null,
): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  const add = (src?: string) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    urls.push(src);
  };

  for (const room of residentialLife?.accommodation.galleries ?? []) {
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

  for (const image of (residentialLife?.food.gallery ?? []).slice(0, 4)) {
    add(image.url);
  }

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
};

/**
 * Maps a retreat document into UI props for the retreat client.
 *
 * @param retreat - Retreat document from MySQL
 * @param residentialLife - Course-compatible lodging/food document
 */
export function mapRetreatPage(
  retreat: RetreatDocument,
  residentialLife: ResidentialLifeContent | null,
): MappedRetreatPage {
  const heroImages = buildRetreatHeroImages(retreat, residentialLife);

  return {
    navItems: DEFAULT_RETREAT_NAV,
    fee: lowestFee(retreat.packages),
    heroImage: heroImages[0] ?? retreat.heroImage,
    heroImages,
    pricing: filterRetreatLodgingPricing(mapPricing(retreat.packages)),
    pricingDescription: "",
    batches: mapBatches(retreat.dates),
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
