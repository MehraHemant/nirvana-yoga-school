import type {
  RetreatProductAccommodationContent,
  RetreatProductBatch,
  RetreatProductFoodContent,
  RetreatProductScheduleActivityKind,
  RetreatProductSections,
} from "@/components/retreat/product/retreatProductTypes";
import type { MappedRetreatPage } from "@/content/mappers/retreat-page";
import type { PageModulesDocument } from "@/content/types/page-modules";
import type {
  RetreatDocument,
  RetreatScheduleActivityKind,
} from "@/content/types/retreat-page";
import type {
  ResidentialLifeContent,
  ReviewsContent,
} from "@/content/types/shared-sections";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { parseYouTubeId } from "@/lib/youtube";

type MapRetreatProductInput = {
  retreat: RetreatDocument;
  mapped: MappedRetreatPage;
  modules: PageModulesDocument | null;
  residentialLife: ResidentialLifeContent | null;
  reviews: ReviewsContent | null;
};

/**
 * CMS → retreat product UI field mapping.
 *
 * | Product section   | Primary CMS source |
 * |-------------------|--------------------|
 * | Overview          | `page_modules.overview` — eyebrow, title, lead, glance |
 * | Inclusions        | `page_modules.inclusions` — eyebrow, title, description, items, arrivalSupport |
 * | Schedule          | `page_modules.schedule` — eyebrow, title, description; days from `retreat.schedule` |
 * | Accommodation     | `residentialLife.accommodation` + shared facilities |
 * | Dates & fees      | `page_modules.pricing` — eyebrow, title, description, batches; packages from DB offers |
 * | Testimonials      | `page_modules.testimonials`, else shared `reviews` |
 * | FAQ               | `page_modules.faqs` — eyebrow, title, description, items |
 * | Sticky offer card | `page_modules.pricing` — promoHeadline, promoSubhead, description, duration, offerBullets, startingFee |
 */

/**
 * Resolves the first YouTube URL from overview module media items.
 *
 * @param modules - Page modules document
 */
function firstOverviewVideoUrl(
  modules: PageModulesDocument | null,
): string | null {
  const items = modules?.overview?.media?.items ?? [];
  for (const item of items) {
    const url = item.url?.trim();
    if (!url) continue;
    if (item.type === "video" || parseYouTubeId(url)) return url;
  }
  return null;
}

/**
 * Maps shared residential-life data into retreat product accommodation props.
 *
 * @param residentialLife - Resolved lodging/food CMS payload
 */
function mapRetreatProductAccommodation(
  residentialLife: ResidentialLifeContent | null,
): RetreatProductAccommodationContent | null {
  if (!residentialLife) return null;
  const acc = residentialLife.accommodation;
  const galleries = (acc.galleries ?? []).filter((room) => room.live !== false);

  const hasStayCopy = Boolean(
    acc.stay.title?.trim() || acc.stay.description?.trim(),
  );
  const hasSectionCopy = Boolean(acc.eyebrow?.trim() || acc.title?.trim());
  const hasData = galleries.length > 0 || hasStayCopy || hasSectionCopy;

  const isLive =
    shouldRenderSection(residentialLife, hasData) &&
    shouldRenderSection(acc, hasData);
  if (!isLive) return null;

  const stayTitle = acc.stay.title?.trim() ?? "";
  const stayDescription = acc.stay.description?.trim() ?? "";
  const sectionEyebrow = acc.eyebrow?.trim() ?? "";
  const sectionTitle = acc.title?.trim() || stayTitle || "Accommodation";

  return {
    eyebrow: sectionEyebrow,
    title: sectionTitle,
    stayTitle,
    stayDescription,
    galleries,
    facilities: residentialLife.facilities ?? [],
  };
}

/**
 * Maps shared food settings into retreat product food section props.
 *
 * @param residentialLife - Resolved lodging/food CMS payload
 */
function mapRetreatProductFood(
  residentialLife: ResidentialLifeContent | null,
): RetreatProductFoodContent | null {
  if (!residentialLife) return null;
  const gallery = (residentialLife.food.gallery ?? []).filter((image) =>
    image.url?.trim(),
  );

  const foodContent = residentialLife.food.content;
  const hasData = Boolean(
    gallery.length > 0 ||
      foodContent.title.trim() ||
      foodContent.description.trim() ||
      (foodContent.points?.length ?? 0) > 0,
  );
  const isLive =
    shouldRenderSection(residentialLife, hasData) &&
    shouldRenderSection(residentialLife.food, hasData);
  if (!isLive) return null;

  return {
    eyebrow: "",
    title: foodContent.title.trim(),
    description: foodContent.description.trim(),
    points: foodContent.points ?? [],
    dietaryNote: foodContent.dietaryNote?.trim() ?? "",
    gallery,
  };
}

/**
 * Splits overview copy into paragraphs for the product layout.
 *
 * @param raw - HTML or plain overview text
 */
function overviewParagraphs(raw: string): string[] {
  const stripped = raw
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
  if (!stripped) return [];
  return stripped
    .split(/\n\s*\n/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/**
 * Maps a CMS schedule activity label to a product icon kind when `kind` is unset.
 *
 * @param label - Activity title from the retreat document
 */
function inferScheduleActivityKind(
  label: string,
): RetreatProductScheduleActivityKind {
  const text = label.toLowerCase();
  if (text.includes("wake")) return "wake";
  if (
    text.includes("lights off") ||
    text.includes("bedtime") ||
    text.includes("sleep")
  )
    return "sleep";
  if (
    text.includes("lunch") ||
    text.includes("dinner") ||
    text.includes("breakfast") ||
    text.includes("tea") ||
    text.includes("meal")
  )
    return "meal";
  if (
    text.includes("meditation") ||
    text.includes("nidra") ||
    text.includes("mindfulness")
  )
    return "meditation";
  if (
    text.includes("yoga") ||
    text.includes("asana") ||
    text.includes("pranayama") ||
    text.includes("neti")
  )
    return "yoga";
  if (
    text.includes("massage") ||
    text.includes("healing") ||
    text.includes("destress") ||
    text.includes("trauma")
  )
    return "healing";
  if (
    text.includes("kirtan") ||
    text.includes("ceremony") ||
    text.includes("hawan") ||
    text.includes("bonfire")
  )
    return "community";
  if (
    text.includes("trek") ||
    text.includes("excursion") ||
    text.includes("ganga") ||
    text.includes("sunrise") ||
    text.includes("waterfall") ||
    text.includes("visit") ||
    text.includes("aarti") ||
    text.includes("arti")
  )
    return "excursion";
  if (
    text.includes("art") ||
    text.includes("workshop") ||
    text.includes("philosophy") ||
    text.includes("ayurveda")
  )
    return "workshop";
  if (text.includes("check-in") || text.includes("rest")) return "rest";
  return "yoga";
}

function cmsActivityKind(
  kind: RetreatScheduleActivityKind | undefined,
  activityLabel: string,
): RetreatProductScheduleActivityKind {
  return (kind ?? inferScheduleActivityKind(activityLabel)) as RetreatProductScheduleActivityKind;
}

function mapPricingBatches(
  modules: PageModulesDocument | null,
  mapped: MappedRetreatPage,
  retreat: RetreatDocument,
): RetreatProductBatch[] {
  const fromModules = modules?.pricing.batches?.filter((b) => b.dates.trim());
  if (fromModules?.length) {
    return fromModules.map((batch) => ({
      dates: batch.dates,
      status: batch.status || "Open",
      statusTone: batch.tone ?? "open",
    }));
  }
  if (mapped.batches.length > 0) {
    return mapped.batches.map((batch) => ({
      dates: batch.dates,
      status: batch.status,
      statusTone: (batch.tone === "fast" || batch.tone === "last"
        ? batch.tone
        : "open") as "open" | "fast" | "last",
    }));
  }
  return retreat.dates
    .filter((d) => d.range.trim())
    .map((entry) => ({
      dates: entry.range,
      status: entry.availability || "Open",
      statusTone: entry.tone ?? "open",
    }));
}

/**
 * Builds retreat product section props from CMS / DB page data.
 *
 * @param input - Loaded retreat page payload
 */
export function mapRetreatProductSections(
  input: MapRetreatProductInput,
): RetreatProductSections {
  const { retreat, mapped, modules, residentialLife, reviews } = input;

  const moduleOverview = modules?.overview;
  const leadSource =
    moduleOverview?.lead?.trim() || retreat.overview?.trim() || "";
  const lead = overviewParagraphs(leadSource);
  const glance =
    (moduleOverview?.glance?.length ?? 0) > 0
      ? moduleOverview!.glance
      : retreat.duration
        ? [{ label: "Duration", value: retreat.duration }]
        : [];

  const overviewBlocks =
    (moduleOverview?.blocks?.length ?? 0) > 0
      ? moduleOverview!.blocks!
      : [];

  const overviewVideoItem = moduleOverview?.media?.items?.find(
    (item) => item.type === "video" && item.url?.trim(),
  );
  const youtubeUrl = firstOverviewVideoUrl(modules) ?? undefined;
  const videoTitle = overviewVideoItem?.title?.trim() || undefined;

  const hasOverview =
    lead.length > 0 ||
    glance.length > 0 ||
    overviewBlocks.length > 0 ||
    Boolean(youtubeUrl?.trim());

  const overview = hasOverview
    ? {
        eyebrow:
          moduleOverview?.eyebrow?.trim() || retreat.eyebrow?.trim() || "",
        title: moduleOverview?.title?.trim() || retreat.title,
        lead,
        glance,
        blocks: overviewBlocks.length > 0 ? overviewBlocks : undefined,
        youtubeUrl,
        videoTitle: youtubeUrl ? videoTitle : undefined,
      }
    : null;

  const inclusionItems =
    (modules?.inclusions?.items?.length ?? 0) > 0
      ? modules!.inclusions.items
      : retreat.inclusions.filter(
          (item) => !item.trim().endsWith("?") && item.trim().length > 0,
        );

  const inclusions =
    inclusionItems.length > 0
      ? {
          eyebrow: modules?.inclusions?.eyebrow?.trim() ?? "",
          title: modules?.inclusions?.title?.trim() ?? "",
          description: modules?.inclusions?.description?.trim() ?? "",
          items: inclusionItems,
          arrivalNote:
            modules?.inclusions?.arrivalSupport?.body?.trim() || undefined,
        }
      : null;

  const scheduleDays = retreat.schedule ?? [];
  const schedule =
    scheduleDays.length > 0
      ? {
          eyebrow: modules?.schedule?.eyebrow?.trim() ?? "",
          title:
            modules?.schedule?.title?.trim() ||
            (retreat.duration
              ? `Your ${retreat.duration.toLowerCase()} retreat`
              : ""),
          description: modules?.schedule?.description?.trim() ?? "",
          days: scheduleDays.map((day) => ({
            day: day.day,
            title: day.title,
            note: day.note,
            activities: day.activities.map((row) => ({
              time: row.time,
              title: row.activity,
              detail: row.detail,
              kind: cmsActivityKind(row.kind, row.activity),
            })),
          })),
        }
      : null;

  const batches = mapPricingBatches(modules, mapped, retreat);

  const packages = mapped.pricing.map((option, index) => ({
    roomId: option.roomId ?? `room-${index}`,
    roomType: option.roomType,
    price: option.price,
    originalPrice: option.originalPrice,
    description: option.description,
  }));

  const dates =
    batches.length > 0 && packages.length > 0
      ? {
          eyebrow: modules?.pricing?.eyebrow?.trim() ?? "",
          title: modules?.pricing?.title?.trim() ?? "",
          description:
            modules?.pricing?.description?.trim() ||
            mapped.pricingDescription.trim() ||
            "",
          batches,
          packages,
        }
      : null;

  const pageTestimonials =
    modules?.testimonials?.items?.filter(
      (item) => item.quote?.trim() && item.name?.trim(),
    ) ?? [];

  const reviewItems =
    pageTestimonials.length > 0
      ? pageTestimonials.map((item) => ({
          name: item.name,
          location: item.location?.trim() ?? "",
          quote: item.quote,
          rating: item.rating ?? 5,
        }))
      : (reviews?.reviews
          ?.filter((item) => item.message?.trim())
          .slice(0, 3)
          .map((item) => ({
            name: item.name,
            location: item.title?.trim() || item.source,
            quote: item.message,
            rating: 5,
          })) ?? []);

  const testimonials =
    reviewItems.length > 0
      ? {
          eyebrow: modules?.testimonials?.eyebrow?.trim() ?? "",
          title: modules?.testimonials?.title?.trim() ?? "",
          description: modules?.testimonials?.description?.trim() ?? "",
          items: reviewItems,
        }
      : null;

  const faqItems =
    (modules?.faqs?.items?.length ?? 0) > 0
      ? modules!.faqs.items
      : (retreat.faqs ?? []).map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        }));

  const faqs =
    faqItems.length > 0
      ? {
          eyebrow: modules?.faqs?.eyebrow?.trim() ?? "",
          title: modules?.faqs?.title?.trim() ?? "",
          description: modules?.faqs?.description?.trim() ?? "",
          items: faqItems,
        }
      : null;

  const startingFee =
    modules?.pricing?.startingFee?.trim() || mapped.pricing[0]?.price || "";

  const offerBullets =
    (modules?.pricing?.offerBullets?.length ?? 0) > 0
      ? modules!.pricing.offerBullets!
      : retreat.inclusions.length > 0
        ? retreat.inclusions.slice(0, 4)
        : [];

  const promoHeadline = modules?.pricing?.promoHeadline?.trim() ?? "";
  const promoSubhead = modules?.pricing?.promoSubhead?.trim() ?? "";
  const pricingDescription = modules?.pricing?.description?.trim() ?? "";
  const duration =
    modules?.pricing?.duration?.trim() || retreat.duration?.trim() || "";
  const hasListedOriginals = mapped.pricing.some((option) =>
    option.originalPrice?.trim(),
  );

  const hasOffer =
    Boolean(startingFee) ||
    offerBullets.length > 0 ||
    Boolean(promoHeadline) ||
    Boolean(promoSubhead) ||
    Boolean(pricingDescription) ||
    Boolean(duration) ||
    packages.length > 0;

  const offer = hasOffer
    ? {
        promoHeadline: promoHeadline || undefined,
        promoSubhead: promoSubhead || undefined,
        pricingDescription: pricingDescription || undefined,
        startingFee,
        duration,
        bullets: offerBullets,
        /** Listed strikethrough prices from CMS — no synthetic coupon math. */
        listPriceOnly: hasListedOriginals,
      }
    : null;

  const accommodation = mapRetreatProductAccommodation(residentialLife);
  const food = mapRetreatProductFood(residentialLife);

  return {
    overview,
    inclusions,
    schedule,
    accommodation,
    food,
    dates,
    testimonials,
    faqs,
    offer,
  };
}

/** @deprecated Use {@link mapRetreatProductSections}. */
export const mapRetreatProductContent = mapRetreatProductSections;
