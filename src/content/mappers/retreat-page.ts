import type { StickyNavItem } from "@/components/courses/CourseStickyNav";
import type { PricingOption } from "@/components/courses/upcomingDatesShared";
import type { RetreatDocument } from "@/content/types/retreat-page";

const RETREAT_NAV: StickyNavItem[] = [
  { id: "#overview", label: "Overview", shortLabel: "Overview" },
  { id: "#inclusions", label: "Inclusions", shortLabel: "Include" },
  { id: "#schedule", label: "Schedule", shortLabel: "Schedule" },
  { id: "#accommodation", label: "Lodging", shortLabel: "Lodging" },
  { id: "#pricing", label: "Packages", shortLabel: "Packages" },
  { id: "#testimonials", label: "Testimonials", shortLabel: "Reviews" },
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

export type MappedRetreatPage = {
  navItems: StickyNavItem[];
  fee: string;
  pricing: PricingOption[];
  pricingDescription: string;
  batches: ReturnType<typeof mapBatches>;
  accommodationFacilities: string[];
};

export function mapRetreatPage(retreat: RetreatDocument): MappedRetreatPage {
  return {
    navItems: RETREAT_NAV,
    fee: lowestFee(retreat.packages),
    pricing: mapPricing(retreat.packages),
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
