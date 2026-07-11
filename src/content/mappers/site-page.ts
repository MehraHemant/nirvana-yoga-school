import type { PricingOption } from "@/components/courses/upcomingDatesShared";
import type { FAQEntry } from "@/components/ui/FAQSection";
import {
  getPagePresentation,
  type PagePresentation,
  refineEditorialSection,
  refineFaqs,
  refineHighlight,
  refineInclusions,
  refineMetaItems,
  refineOverview,
  refinePrograms,
  refineScheduleActivities,
} from "@/content/mappers/site-page-copy";
import type {
  SitePageCard,
  SitePageDocument,
  SitePageGalleryImage,
  SitePagePerson,
  SitePageSection,
} from "@/content/types";

export type StickyNavItem = {
  id: `#${string}`;
  label: string;
  shortLabel: string;
};

export type MappedSitePage = {
  heroImages: string[];
  metaItems: { label: string; value: string }[];
  duration: string;
  navItems: StickyNavItem[];
  presentation: PagePresentation;
  overview?: string;
  inclusions: string[];
  exclusions: string[];
  scheduleDescription: string;
  schedule: { time: string; activity: string }[];
  pricing: PricingOption[];
  pricingDescription: string;
  batches: {
    dates: string;
    spaces: string;
    status: string;
    statusColor: string;
    tone: "open" | "fast" | "last";
  }[];
  faqs: FAQEntry[];
  teachers: SitePagePerson[];
  gallery: SitePageGalleryImage[];
  programs: SitePageCard[];
  editorialSections: SitePageSection[];
  showWhyNirvana: boolean;
  showTravelGuide: boolean;
  showAccommodation: boolean;
  showInstagram: boolean;
  ctaPrimary: string;
  ctaPrimaryHref: string;
  ctaSecondary?: string;
  ctaSecondaryHref?: string;
};

function findSection(page: SitePageDocument, pattern: RegExp) {
  return page.sections.find((section) => pattern.test(section.title));
}

function parseListFromBody(body?: string) {
  if (!body) return [];
  return body
    .split("\n\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 2 && line.length < 200);
}

function parseInclusions(section?: SitePageSection) {
  if (!section) return { inclusions: [], exclusions: [] as string[] };

  const fromItems = section.items ?? [];
  const fromBody = parseListFromBody(section.body);
  const inclusions = fromItems.length > 0 ? fromItems : fromBody;

  const exclusions =
    section.subsections?.find((sub) =>
      /exclusion|not included/i.test(sub.title),
    )?.items ?? [];

  return { inclusions, exclusions };
}

function parseSchedule(section?: SitePageSection) {
  if (!section?.subsections?.length) {
    return {
      description: section?.body ?? "",
      schedule: [] as { time: string; activity: string }[],
    };
  }

  const schedule = section.subsections.map((step, index) => ({
    time: `Day ${index + 1}`,
    activity: step.body ? `${step.title} — ${step.body}` : step.title,
  }));

  return {
    description:
      section.body?.split("\n\n")[0] ??
      "A thoughtfully paced retreat itinerary designed for rest, practice, and renewal.",
    schedule,
  };
}

function parseFaqs(section?: SitePageSection): FAQEntry[] {
  if (!section) return [];

  const faqs: FAQEntry[] = [];
  const faqPatterns = [
    { pattern: /^To book/i, question: "How do I book my spot?" },
    { pattern: /^Yes, our/i, question: "Is this retreat family-friendly?" },
    {
      pattern: /^When you arrive|From Dehradun|domestic flight/i,
      question: "How do I reach the school?",
    },
    { pattern: /^Absolutely/i, question: "Do I need prior yoga experience?" },
    { pattern: /^Make sure to bring/i, question: "What should I pack?" },
    {
      pattern: /^The best time/i,
      question: "When is the best time to visit Rishikesh?",
    },
    {
      pattern: /^An advance payment|^Advance payment/i,
      question: "What is the cancellation policy?",
    },
  ];

  if (section.body) {
    for (const paragraph of section.body.split("\n\n")) {
      const text = paragraph.trim();
      if (text.length < 40 || /25% OFF|WHATSAPP|\$\{price\}/i.test(text)) {
        continue;
      }
      const inferred = faqPatterns.find((entry) => entry.pattern.test(text));
      if (inferred) {
        faqs.push({ question: inferred.question, answer: text });
      }
    }
  }

  if (section.subsections?.length) {
    for (const sub of section.subsections) {
      if (sub.title && sub.body && !/25% off|price:/i.test(sub.title)) {
        faqs.push({ question: sub.title, answer: sub.body });
      }
    }
  }

  if (faqs.length > 0) return refineFaqs(faqs);

  return refineFaqs(
    section.body
      ? [{ question: "Common questions", answer: section.body }]
      : [],
  );
}

function parseBatches(section?: SitePageSection) {
  const datesSub = section?.subsections?.find((sub) =>
    /retreat dates|dates/i.test(sub.title),
  );

  if (!datesSub?.items?.length) return [];

  return datesSub.items.map((item, index) => {
    const tone = index === 0 ? "fast" : index === 1 ? "last" : "open";
    const status =
      tone === "fast" ? "Filling Fast" : tone === "last" ? "Open" : "Open";
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

function parsePricing(page: SitePageDocument) {
  const packages = page.packages ?? [];
  return packages.map((pkg) => ({
    roomType: pkg.title,
    price: pkg.price,
    description: "Includes stay, sattvic meals, and the full retreat program.",
    features: [
      "Daily yoga & meditation",
      "Ayurveda wellness",
      "Excursions & ceremonies",
    ],
    image: pkg.image,
  })) satisfies PricingOption[];
}

function collectHeroImages(page: SitePageDocument) {
  const images = new Set<string>();
  if (page.image) images.add(page.image);

  for (const highlight of page.highlights ?? []) {
    if (highlight.image) images.add(highlight.image);
  }

  for (const section of page.sections) {
    if (section.image) images.add(section.image);
    for (const url of section.images ?? []) images.add(url);
  }

  for (const image of page.gallery ?? []) images.add(image.url);

  return [...images].slice(0, 12);
}

function retreatDuration(slug: string) {
  if (slug.includes("3-day")) return "3 Days";
  if (slug.includes("5-day")) return "5 Days";
  if (slug.includes("7-day")) return "7 Days";
  return "";
}

function buildMetaItems(page: SitePageDocument, duration: string) {
  const items: { label: string; value: string }[] = [];

  if (duration) items.push({ label: "Duration", value: duration });
  if (page.highlights?.[0]) {
    items.push({
      label: page.highlights[0].title,
      value: refineHighlight(
        page.highlights[0].title,
        page.highlights[0].description,
      ),
    });
  }
  if (page.highlights?.[1]) {
    items.push({
      label: page.highlights[1].title,
      value: refineHighlight(
        page.highlights[1].title,
        page.highlights[1].description,
      ),
    });
  }
  if (page.packages?.[0]) {
    items.push({
      label: "From",
      value:
        page.packages[0].price.split("(")[0]?.trim() ?? page.packages[0].price,
    });
  }
  if (page.eyebrow && items.length < 4) {
    items.push({ label: "Program", value: page.eyebrow });
  }

  return items.slice(0, 4);
}

function buildNavItems(
  mapped: Omit<MappedSitePage, "navItems">,
): StickyNavItem[] {
  const items: StickyNavItem[] = [];

  if (mapped.overview) {
    items.push({ id: "#overview", label: "Overview", shortLabel: "Overview" });
  }
  if (mapped.inclusions.length > 0) {
    items.push({
      id: "#inclusions",
      label: "Inclusions",
      shortLabel: "Include",
    });
  }
  if (mapped.schedule.length > 0) {
    items.push({ id: "#schedule", label: "Schedule", shortLabel: "Schedule" });
  }
  if (mapped.pricing.length > 0) {
    items.push({ id: "#pricing", label: "Dates & Fees", shortLabel: "Dates" });
  }
  if (mapped.teachers.length > 0) {
    items.push({ id: "#teachers", label: "Teachers", shortLabel: "Teachers" });
  }
  if (mapped.programs.length > 0) {
    items.push({ id: "#programs", label: "Programs", shortLabel: "Programs" });
  }
  if (mapped.gallery.length > 0) {
    items.push({ id: "#gallery", label: "Gallery", shortLabel: "Gallery" });
  }
  if (mapped.showAccommodation) {
    items.push({
      id: "#accommodation",
      label: "Lodging",
      shortLabel: "Lodging",
    });
  }
  if (mapped.showWhyNirvana) {
    items.push({ id: "#why-nirvana", label: "Why Nirvana", shortLabel: "Why" });
  }
  if (mapped.showTravelGuide) {
    items.push({ id: "#travel", label: "Travel", shortLabel: "Travel" });
  }
  if (mapped.showInstagram) {
    items.push({ id: "#instagram", label: "Instagram", shortLabel: "Social" });
  }
  if (mapped.faqs.length > 0) {
    items.push({ id: "#faq", label: "FAQ", shortLabel: "FAQ" });
  }

  return items;
}

export function mapSitePage(page: SitePageDocument): MappedSitePage {
  const overviewSection =
    findSection(page, /^overview|about|introduction/i) ?? page.sections[0];
  const inclusionsSection = findSection(
    page,
    /inclusions|what's included|included/i,
  );
  const scheduleSection = findSection(page, /schedule|itinerary|day-wise/i);
  const pricingSection = findSection(page, /packages|pricing|dates & fees/i);
  const faqSection = findSection(page, /faq|frequently asked/i);

  const duration = retreatDuration(page.slug);
  const presentation = getPagePresentation(page);
  const { inclusions: rawInclusions, exclusions } =
    parseInclusions(inclusionsSection);
  const inclusions = refineInclusions(rawInclusions, inclusionsSection?.body);
  const { description: rawScheduleDescription, schedule: rawSchedule } =
    parseSchedule(scheduleSection);
  const schedule = refineScheduleActivities(rawSchedule);
  const pricing = parsePricing(page);
  const batches = parseBatches(pricingSection);
  const faqs = parseFaqs(faqSection);
  const heroImages = collectHeroImages(page);
  const metaItems = refineMetaItems(buildMetaItems(page, duration));

  const usedTitles = new Set(
    [
      overviewSection,
      inclusionsSection,
      scheduleSection,
      pricingSection,
      faqSection,
    ]
      .filter(Boolean)
      .map((section) => section?.title),
  );

  const editorialSections = page.sections
    .filter(
      (section) =>
        !usedTitles.has(section.title) &&
        !/testimonial|what students say|enquiry form|sign up/i.test(
          section.title,
        ) &&
        !(page.people?.length && /our teachers|faculty/i.test(section.title)),
    )
    .map(refineEditorialSection);

  const isRetreat = page.slug.includes("retreat");
  const isTrainingHub =
    page.slug.includes("teacher-training") ||
    page.slug.includes("online-yoga") ||
    Boolean(page.cards?.length);

  const partial = {
    heroImages,
    metaItems,
    duration: duration || "Flexible",
    presentation,
    overview: refineOverview(page, overviewSection?.body),
    inclusions,
    exclusions,
    scheduleDescription:
      schedule.length > 0
        ? presentation.scheduleDescription
        : rawScheduleDescription,
    schedule,
    pricing,
    pricingDescription: presentation.pricingDescription,
    batches,
    faqs,
    teachers: page.people ?? [],
    gallery: page.gallery ?? [],
    programs: refinePrograms(page.cards ?? []),
    editorialSections,
    showWhyNirvana: isRetreat || isTrainingHub || page.slug === "about-us",
    showTravelGuide: isRetreat || page.slug.includes("teacher-training"),
    showAccommodation:
      isRetreat ||
      page.slug === "course-venue" ||
      page.slug === "retreat-venue" ||
      page.slug.includes("teacher-training"),
    showInstagram: page.slug !== "contact",
    ctaPrimary: page.ctaLabel ?? "Enquire Now",
    ctaPrimaryHref: page.packages?.length
      ? "#pricing"
      : (page.ctaHref ?? "#contact"),
    ctaSecondary:
      schedule.length > 0
        ? "View Schedule"
        : page.cards?.length
          ? "Explore Programs"
          : undefined,
    ctaSecondaryHref:
      schedule.length > 0
        ? "#schedule"
        : page.cards?.length
          ? "#programs"
          : undefined,
  };

  return {
    ...partial,
    navItems: buildNavItems(partial),
  };
}
