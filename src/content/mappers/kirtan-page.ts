import type { PricingOption } from "@/components/courses/upcomingDatesShared";
import type { FAQEntry } from "@/components/ui/FAQSection";
import type { MappedSitePage } from "@/content/mappers/site-page";
import { buildNavItems, mapSitePage } from "@/content/mappers/site-page";
import {
  refineFaqs,
  refineInclusions,
  refineOverview,
} from "@/content/mappers/site-page-copy";
import type {
  SitePageDocument,
  SitePageGalleryImage,
  SitePageSection,
} from "@/content/types";
import { enquireNowHref } from "@/lib/enquire-programs";

export const KIRTAN_SLUG = "kirtan-vocal-and-instrumental-music-training";

/** Static sidebar copy for the kirtan syllabus section (not stored in site-pages JSON). */
export const KIRTAN_SYLLABUS_SIDEBAR = {
  title: "Program at a Glance",
  subtitle: "5-day immersive format in Rishikesh",
  items: [
    { area: "Daily guided sessions", hours: "3 hours" },
    { area: "Harmonium & vocal training", hours: "Ch. 1" },
    { area: "Mridangam & rhythm", hours: "Ch. 2" },
    { area: "Group kirtan practice", hours: "Daily" },
    { area: "Certificate", hours: "On completion" },
  ],
  footerNote:
    "Both chapters complement each other and can be taken together for a fuller musical foundation.",
};

const JUNK_LINE =
  /WHATSAPP|nirvanayogaschool@gmail|\$\{price\}|Limited Time Offer|Book Before/i;

const HIGHLIGHT_PREFIXES = [
  "Simple and Accessible Approach",
  "Balanced Learning",
  "Practical Focus",
  "Short and Effective Format",
  "Supportive Environment",
] as const;

const KIRTAN_ROOM_LABELS = [
  "Private Room with Balcony",
  "2-Shared Room with Balcony",
  "4-Shared Dorm with Balcony",
  "Private Double Balcony Room (2 people)",
  "Without Accommodation",
] as const;

const FALLBACK_HERO_IMAGE =
  "https://www.nirvanayogaschoolindia.com/admin/uploads/yoga/yoga-11-06-2026-1781120152-yoga-03-07-2023-1688377619-3.png";

export type KirtanEligibilityItem = {
  title: string;
  desc: string;
  num: string;
};

export type KirtanSyllabusChapter = {
  title: string;
  description: string;
  subtopics: string[];
};

export type KirtanHighlight = {
  title: string;
  description: string;
};

export type KirtanPageContent = {
  heroImage: string;
  heroImages: string[];
  overviewImages: string[];
  gallery: SitePageGalleryImage[];
  certificationImages: string[];
  highlightImages: string[];
  metaItems: { label: string; value: string }[];
  eligibility: KirtanEligibilityItem[];
  syllabus: KirtanSyllabusChapter[];
  syllabusDescription: string;
  certification: string;
  highlights: KirtanHighlight[];
};

const EXCLUDED_GALLERY_SECTIONS =
  /hear from our students|why nirvana|faq|frequently asked/i;

function findSection(page: SitePageDocument, pattern: RegExp) {
  return page.sections.find((section) => pattern.test(section.title));
}

function isValidImageUrl(url?: string): url is string {
  return Boolean(url && !url.endsWith("/yoga/") && !JUNK_LINE.test(url));
}

function normalizeItem(item: string): string {
  return item.replace(/\s+/g, " ").trim();
}

function collectSectionImages(section?: SitePageSection): string[] {
  if (!section) return [];

  const images = new Set<string>();
  for (const url of [section.image, ...(section.images ?? [])]) {
    if (isValidImageUrl(url) && !/google\.png/i.test(url)) images.add(url);
  }
  return [...images];
}

function categorizeKirtanSection(title: string): string {
  if (/accommodation|food/i.test(title)) return "accommodation";
  if (/dates|fee|why choose/i.test(title)) return "campus";
  return "practice";
}

function collectKirtanGallery(page: SitePageDocument): SitePageGalleryImage[] {
  const seen = new Set<string>();
  const gallery: SitePageGalleryImage[] = [];

  for (const section of page.sections) {
    if (EXCLUDED_GALLERY_SECTIONS.test(section.title)) continue;

    const category = categorizeKirtanSection(section.title);
    for (const url of collectSectionImages(section)) {
      if (seen.has(url)) continue;
      seen.add(url);
      gallery.push({ url, category });
    }
  }

  if (page.gallery?.length) {
    for (const image of page.gallery) {
      if (!isValidImageUrl(image.url) || seen.has(image.url)) continue;
      seen.add(image.url);
      gallery.push(image);
    }
  }

  return gallery;
}

function collectKirtanOverviewImages(page: SitePageDocument): string[] {
  const sections = [
    findSection(page, /^overview/i),
    findSection(page, /what is included/i),
    findSection(page, /curriculum/i),
    findSection(page, /eligibility/i),
  ];

  const images = new Set<string>();
  for (const section of sections) {
    for (const url of collectSectionImages(section)) images.add(url);
  }

  return [...images].slice(0, 6);
}

function collectKirtanHeroImages(page: SitePageDocument): string[] {
  const images = new Set<string>();

  for (const url of [
    page.image,
    ...page.sections.flatMap((section) => [
      section.image,
      ...(section.images ?? []),
    ]),
  ]) {
    if (isValidImageUrl(url)) images.add(url);
  }

  const collected = [...images];
  if (collected.length === 0) return [FALLBACK_HERO_IMAGE];
  return collected.slice(0, 16);
}

function parseDropDownTopics(body?: string): string[] {
  if (!body) return [];

  const topics: string[] = [];
  const regex = /([^(]+?)\s*\(drop[- ]down\)/gi;

  for (const match of body.matchAll(regex)) {
    const topic = normalizeItem(match[1]);
    if (topic.length > 2) topics.push(topic);
  }

  return topics;
}

function syllabusDescription(body?: string): string {
  if (!body) return "";

  const intro = body.split(/\n\nWhat You Will Learn/i)[0] ?? body;
  return intro
    .split("\n\n")
    .map((part) => part.replace(/\n/g, " ").trim())
    .filter((part) => part.length > 24 && !JUNK_LINE.test(part))
    .slice(0, 2)
    .join("\n\n");
}

function parseKirtanSyllabus(
  section?: SitePageSection,
): KirtanSyllabusChapter[] {
  if (!section?.subsections?.length) return [];

  return section.subsections.map((sub) => {
    const fromBody = parseDropDownTopics(sub.body);
    const fromItems = (sub.items ?? []).map(normalizeItem).filter(Boolean);
    const subtopics = [...fromItems];
    for (const topic of fromBody) {
      if (
        !subtopics.some((item) => item.toLowerCase() === topic.toLowerCase())
      ) {
        subtopics.push(topic);
      }
    }

    return {
      title: sub.title,
      description: syllabusDescription(sub.body),
      subtopics,
    };
  });
}

function parseKirtanEligibility(
  section?: SitePageSection,
): KirtanEligibilityItem[] {
  const items = (section?.items ?? []).map(normalizeItem).filter(Boolean);
  return items.map((item, index) => ({
    title: item,
    desc: item,
    num: String(index + 1).padStart(2, "0"),
  }));
}

function parseKirtanHighlights(section?: SitePageSection): KirtanHighlight[] {
  if (!section?.body) return [];

  return section.body
    .split("\n\n")
    .map((chunk) => chunk.replace(/\n/g, " ").trim())
    .filter((chunk) => chunk.length > 8 && !JUNK_LINE.test(chunk))
    .map((chunk) => {
      const prefix = HIGHLIGHT_PREFIXES.find((title) =>
        chunk.startsWith(title),
      );
      if (!prefix) {
        return { title: chunk, description: "" };
      }
      return {
        title: prefix,
        description: chunk.slice(prefix.length).trim(),
      };
    });
}

function parseKirtanPricing(page: SitePageDocument): PricingOption[] {
  if (page.packages?.length) {
    return page.packages.map((pkg) => {
      const match = pkg.price.match(
        /^([\d$ A-Za-z]+)\s*\(\s*([\d$ A-Za-z]+)\s*\)$/,
      );
      return {
        roomType: pkg.title,
        price: match ? match[1].trim() : pkg.price,
        originalPrice: match?.[2]?.trim(),
        description:
          "Includes 5-day kirtan training, ashram stay, and sattvic meals.",
        features: [
          "5-day music training",
          "Daily guided sessions",
          "Accommodation option",
          "Sattvic meals",
        ],
        image: pkg.image,
      };
    });
  }

  const feeSection = findSection(page, /dates?\s*&\s*fee|pricing/i);
  const feeBody = feeSection?.subsections?.find((sub) =>
    /total course fee|fee/i.test(sub.title),
  )?.body;

  if (!feeBody) return [];

  const priceLines = feeBody
    .split("\n\n")
    .map((line) => line.trim())
    .filter((line) => /\d+\s*USD/i.test(line));

  return priceLines.map((line, index) => {
    const match = line.match(/(\d+)\s*USD\s*\(\s*(\d+)\s*USD\s*\)/i);
    return {
      roomType: KIRTAN_ROOM_LABELS[index] ?? `Package ${index + 1}`,
      price: match ? `${match[1]} USD` : line,
      originalPrice: match ? `${match[2]} USD` : undefined,
      description:
        "Includes 5-day kirtan training, ashram stay, and sattvic meals.",
      features: [
        "5-day music training",
        "Daily guided sessions",
        "Accommodation option",
        "Sattvic meals",
      ],
    };
  });
}

function parseKirtanBatches(page: SitePageDocument) {
  const pricingSection = findSection(page, /dates?\s*&\s*fee|pricing/i);
  const datesSub = pricingSection?.subsections?.find((sub) =>
    /course dates|dates/i.test(sub.title),
  );

  if (!datesSub?.items?.length) return [];

  return datesSub.items.map((item, index) => {
    const tone = index === 0 ? "fast" : "open";
    const status = tone === "fast" ? "Filling Fast" : "Open";
    const statusColor =
      tone === "fast"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-emerald-700 bg-emerald-50 border-emerald-200";

    return {
      dates: item.split("—")[0]?.trim() ?? item,
      spaces: item.includes("—")
        ? (item.split("—")[1]?.trim() ?? "Spaces available")
        : "Spaces available",
      status,
      statusColor,
      tone: tone as "open" | "fast" | "last",
    };
  });
}

function parseKirtanFaqs(section?: SitePageSection): FAQEntry[] {
  if (section?.subsections?.length) {
    return refineFaqs(
      section.subsections
        .filter((sub) => sub.title && sub.body && !JUNK_LINE.test(sub.body))
        .map((sub) => ({
          question: sub.title.endsWith("?") ? sub.title : `${sub.title}?`,
          answer: sub.body ?? "",
        })),
    );
  }

  if (!section?.body) return [];

  const questions = section.body
    .split("\n\n")
    .map((line) => line.trim())
    .filter(
      (line) => line.endsWith("?") && line.length > 8 && !JUNK_LINE.test(line),
    );

  return refineFaqs(
    questions.map((question) => ({
      question,
      answer: "Please contact our team for details about this topic.",
    })),
  );
}

function parseKirtanMeta(
  pricing: PricingOption[],
): { label: string; value: string }[] {
  const lowest = pricing.at(-1)?.price ?? pricing[0]?.price ?? "$299 USD";
  return [
    { label: "Duration", value: "5 Days" },
    { label: "Style", value: "Kirtan & Devotional Music" },
    { label: "From", value: lowest },
    { label: "Certificate", value: "On completion" },
  ];
}

/**
 * Parse kirtan-specific sections from the site page JSON document.
 *
 * @param page - Kirtan site page document from `site-pages.json`
 */
export function parseKirtanContent(page: SitePageDocument): KirtanPageContent {
  const eligibilitySection = findSection(page, /eligibility/i);
  const curriculumSection = findSection(page, /curriculum/i);
  const certificationSection = findSection(page, /exam|certification/i);
  const highlightsSection = findSection(page, /why choose/i);

  const heroImages = collectKirtanHeroImages(page);
  const pricing = parseKirtanPricing(page);

  return {
    heroImage: heroImages[0] ?? FALLBACK_HERO_IMAGE,
    heroImages,
    overviewImages: collectKirtanOverviewImages(page),
    gallery: collectKirtanGallery(page),
    certificationImages: collectSectionImages(certificationSection).slice(0, 3),
    highlightImages: collectSectionImages(highlightsSection).slice(0, 3),
    metaItems: parseKirtanMeta(pricing),
    eligibility: parseKirtanEligibility(eligibilitySection),
    syllabus: parseKirtanSyllabus(curriculumSection),
    syllabusDescription:
      curriculumSection?.body?.split("\n\n")[0]?.trim() ??
      "Two complementary chapters cover harmonium, voice, kirtan, and mridangam rhythm.",
    certification:
      certificationSection?.body?.trim() ??
      "Participants receive a certificate upon completion of the training.",
    highlights: parseKirtanHighlights(highlightsSection),
  };
}

/**
 * Map the kirtan page from `site-pages.json` into the dedicated client layout.
 *
 * @param page - Raw kirtan site page document
 */
export function mapKirtanPage(page: SitePageDocument): MappedSitePage {
  const base = mapSitePage(page);
  const kirtan = parseKirtanContent(page);

  const inclusionsSection = findSection(page, /what is included/i);
  const inclusions = refineInclusions(
    inclusionsSection?.items ?? [],
    inclusionsSection?.body,
  ).filter((item) => !JUNK_LINE.test(item));

  const pricing = parseKirtanPricing(page);
  const batches = parseKirtanBatches(page);
  const faqs = parseKirtanFaqs(findSection(page, /faq|frequently asked/i));

  const partial: Omit<MappedSitePage, "navItems"> = {
    ...base,
    heroImages: kirtan.heroImages,
    metaItems: kirtan.metaItems,
    duration: "5 Days",
    overview: refineOverview(page, findSection(page, /^overview/i)?.body),
    inclusions,
    exclusions: [],
    editorialSections: [],
    pricing,
    batches,
    faqs,
    gallery: kirtan.gallery,
    showAccommodation: true,
    showWhyNirvana: true,
    showTravelGuide: false,
    showInstagram: true,
    showMap: true,
    ctaPrimary: page.ctaLabel ?? "Enquire Now",
    ctaPrimaryHref: enquireNowHref(page.title),
    ctaSecondary: "View Curriculum",
    ctaSecondaryHref: "#syllabus",
    pricingDescription:
      "All-inclusive packages cover your 5-day program, sattvic meals, and ashram stay. Some rooms have private balconies; others share a balcony.",
  };

  return {
    ...partial,
    navItems: buildNavItems(partial),
  };
}

/**
 * Whether the slug is the kirtan music training page.
 *
 * @param slug - Site page slug
 */
export function isKirtanPage(slug: string): boolean {
  return slug === KIRTAN_SLUG;
}

/**
 * Resolve a usable hero image from the page document.
 *
 * @param page - Kirtan site page document
 */
export function kirtanHeroImage(page: SitePageDocument): string {
  return parseKirtanContent(page).heroImage;
}
