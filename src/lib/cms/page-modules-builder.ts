import { COURSES_MEDIA } from "@/content/data/media";
import type retreatsJson from "@/content/data/retreats/retreats.json";
import { buildOnlineCourseFromSitePage } from "@/content/mappers/online-course";
import {
  getPagePresentation,
  refineInclusions,
  refineOverview,
  refineSupportingCopy,
} from "@/content/mappers/site-page-copy";
import {
  DEFAULT_ELIGIBILITY_REQUIREMENTS,
  DEFAULT_ONLINE_NAV,
  DEFAULT_RESIDENTIAL_FLAGS,
  DEFAULT_RESIDENTIAL_NAV,
  DEFAULT_SITE_FLAGS,
  DEFAULT_SITE_NAV,
  DEFAULT_VENUE_FLAGS,
} from "@/content/page-modules-defaults";
import { teacherSlug } from "@/content/teachers-slug";
import type {
  CourseDocument,
  CourseMedia,
  OnlineCourseDocument,
  SitePageDocument,
} from "@/content/types";
import { cmsImageUrl } from "@/content/types/cms-image";
import type {
  BentoMediaHero,
  GlanceItem,
  PageModulesDocument,
  SplitCopyHero,
} from "@/content/types/page-modules";
import type { CourseData } from "@/data/coursesData";

type RetreatRecord = (typeof retreatsJson.retreats)[number];

function findSection(page: SitePageDocument, pattern: RegExp) {
  return page.sections.find((s) => pattern.test(s.title)) ?? page.sections[0];
}

function buildGlanceFromCourse(course: {
  level: string;
  duration: string;
  certification: string;
  fee: string;
}): GlanceItem[] {
  return [
    { label: "Level", value: course.level, hint: "Experience required" },
    { label: "Duration", value: course.duration, hint: "Residential program" },
    {
      label: "Certification",
      value: course.certification,
      hint: "Yoga Alliance",
    },
    { label: "Program Fee", value: course.fee, hint: "From" },
  ];
}

/**
 * Build page modules from a residential course document + media.
 *
 * @param course - Residential course data
 * @param media - Hero gallery media
 */
export function buildModulesFromCourse(
  course: CourseDocument | CourseData,
  media?: CourseMedia,
): PageModulesDocument {
  const courseMedia = media ??
    COURSES_MEDIA[course.slug] ?? { images: [], videos: [] };

  const hero: BentoMediaHero = {
    type: "bento-media",
    title: course.title,
    subtitle: course.subtitle,
    duration: course.duration,
    level: course.level,
    certification: course.certification,
    fee: course.fee,
    certBadge: course.certBadge,
    heroImages: course.heroImages,
    imageDetails: courseMedia.imageDetails,
    videos: courseMedia.videos,
  };

  return {
    hero,
    stickyNav: { items: [...DEFAULT_RESIDENTIAL_NAV] },
    overview: {
      eyebrow: "The Inner Path",
      title: "Course Overview",
      lead: course.overview,
      supportingCopy:
        "Live the ashram rhythm — morning practice, philosophy, anatomy, teaching labs, and community meals — while earning a credential recognized worldwide.",
      glance: buildGlanceFromCourse(course),
      media: {
        mode: courseMedia.videos.length > 0 ? "video" : "carousel",
        items:
          courseMedia.videos.length > 0
            ? courseMedia.videos.map((id) => ({
                type: "video" as const,
                url: id,
                title: "Student experience",
              }))
            : (courseMedia.images.slice(0, 4).map((url) => ({
                type: "image" as const,
                url,
              })) ?? []),
      },
    },
    inclusions: {
      eyebrow: "Fine Print",
      title: "What is Included in Your Fee",
      description:
        "We operate on complete transparency. Your program fee covers all essential living, training, and excursion expenses during your stay so you can focus entirely on your training.",
      items: course.inclusions,
    },
    eligibility: {
      eyebrow: "Admission Standards",
      title: "Who Can Join",
      description:
        "Our programs welcome sincere students ready for immersive ashram living and dedicated study.",
      requirements: [...DEFAULT_ELIGIBILITY_REQUIREMENTS],
      showAllianceBadge: true,
    },
    syllabus: {
      description: course.syllabusDescription,
      chapters: course.syllabus,
    },
    schedule: {
      description: course.scheduleDescription,
      items: course.schedule,
    },
    pricing: {
      description: course.pricingDescription,
      duration: course.duration,
      options: course.pricing,
    },
    faqs: { items: course.faqs },
    flags: { ...DEFAULT_RESIDENTIAL_FLAGS },
  };
}

/**
 * Build page modules from an online course document.
 *
 * @param course - Online course document
 */
export function buildModulesFromOnlineCourse(
  course: OnlineCourseDocument,
): PageModulesDocument {
  const hero: SplitCopyHero = {
    type: "split-copy",
    eyebrow: "Online Course",
    title: course.title,
    subtitle: course.subtitle,
    metaItems: [
      { label: "Level", value: course.level },
      { label: "Duration", value: course.duration },
      { label: "Certification", value: course.certification },
      { label: "Fee", value: course.fee },
    ],
    ctaPrimary: course.ctaPrimary,
    ctaPrimaryHref: course.ctaPrimaryHref,
    ctaSecondary: course.ctaSecondary,
    ctaSecondaryHref: course.ctaSecondaryHref,
    previewType: "image",
    previewUrl: course.image,
  };

  return {
    hero,
    stickyNav: {
      items:
        course.navItems.length > 0 ? course.navItems : [...DEFAULT_ONLINE_NAV],
    },
    overview: {
      eyebrow: "Course Overview",
      title: course.title,
      lead: course.overview,
      glance: buildGlanceFromCourse(course),
      media: {
        mode: "image",
        items: [{ type: "image", url: course.image }],
      },
    },
    inclusions: { items: course.inclusions },
    eligibility: {
      requirements: [...DEFAULT_ELIGIBILITY_REQUIREMENTS],
      showAllianceBadge: true,
    },
    syllabus: {
      description: course.syllabusDescription,
      chapters: course.syllabus,
    },
    schedule: {
      description: course.scheduleDescription,
      items: course.schedule,
    },
    pricing: {
      description: course.pricingDescription,
      duration: course.duration,
      options: course.pricing,
    },
    faqs: { items: course.faqs },
    teachers: {
      selectedSlugs: course.teachers.map((t) => teacherSlug(t.name)),
    },
    flags: {
      showExam: false,
      showAccommodation: false,
      showWhyNirvana: false,
      showTravel: false,
      showInstagram: false,
      showMap: false,
    },
  };
}

/**
 * Build page modules from a site page document.
 *
 * @param page - Site page document
 * @param options - Page kind hints
 */
export function buildModulesFromSitePage(
  page: SitePageDocument,
  options?: { isVenue?: boolean; isHub?: boolean },
): PageModulesDocument {
  const presentation = getPagePresentation(page);
  const overviewSection = findSection(page, /^overview|about|introduction/i);
  const inclusionsSection = findSection(page, /inclusions|what's included/i);
  const scheduleSection = findSection(page, /schedule|itinerary/i);
  const faqSection = findSection(page, /faq/i);

  const inclusions = refineInclusions(
    inclusionsSection?.items ?? [],
    inclusionsSection?.body,
  );

  const isVenue = options?.isVenue ?? page.slug.includes("venue");
  const flags = isVenue
    ? { ...DEFAULT_VENUE_FLAGS }
    : options?.isHub
      ? {
          ...DEFAULT_SITE_FLAGS,
          showAccommodation: true,
          showWhyNirvana: true,
          showTravel: true,
          showInstagram: true,
        }
      : { ...DEFAULT_SITE_FLAGS };

  const heroImages = [
    page.image,
    ...(page.gallery?.map((g) => g.url) ?? []),
    ...(overviewSection?.images ?? []),
  ].filter(Boolean);

  const useBento = page.slug.includes("retreat") || heroImages.length > 3;

  const hero = useBento
    ? ({
        type: "bento-media",
        title: page.title,
        subtitle: presentation.heroSubtitle,
        heroImages: heroImages.slice(0, 12),
      } satisfies BentoMediaHero)
    : ({
        type: "page-minimal",
        eyebrow: page.eyebrow,
        title: page.title,
        subtitle: presentation.heroSubtitle,
        description: page.description,
        heroImage: page.image,
        ctaLabel: page.ctaLabel ?? undefined,
        ctaHref: page.ctaHref ?? undefined,
      } satisfies PageModulesDocument["hero"]);

  const scheduleItems =
    scheduleSection?.subsections?.flatMap((sub) =>
      (sub.items ?? []).map((item) => {
        const [time, ...rest] = item.split("—").map((p) => p.trim());
        return {
          time: time ?? "",
          activity: rest.join(" — ") || item,
        };
      }),
    ) ?? [];

  return {
    hero,
    stickyNav: { items: [...DEFAULT_SITE_NAV] },
    overview: {
      eyebrow: presentation.overviewEyebrow || "Overview",
      title: page.title,
      lead: refineOverview(page, overviewSection?.body),
      supportingCopy: refineSupportingCopy(page),
      glance: [],
      media: {
        mode: overviewSection?.images?.length
          ? "carousel"
          : page.image
            ? "image"
            : "image",
        items: overviewSection?.images?.length
          ? overviewSection.images.map((url) => ({
              type: "image" as const,
              url,
            }))
          : page.image
            ? [{ type: "image" as const, url: page.image }]
            : [],
      },
    },
    inclusions: {
      items: inclusions,
    },
    eligibility: {
      requirements: [...DEFAULT_ELIGIBILITY_REQUIREMENTS],
      showAllianceBadge: false,
    },
    syllabus: { description: "", chapters: [] },
    schedule: {
      description: presentation.scheduleDescription,
      items: scheduleItems,
    },
    pricing: {
      description: presentation.pricingDescription,
      options:
        page.packages?.map((pkg) => ({
          roomType: pkg.title,
          price: pkg.price,
          description: "",
          features: [],
          image: pkg.image,
        })) ?? [],
    },
    faqs: {
      items:
        faqSection?.items?.map((item) => {
          const [question, ...rest] = item.split("?");
          return {
            question: `${question}?`.trim(),
            answer: rest.join("?").trim() || item,
          };
        }) ?? [],
    },
    teachers: page.people?.length
      ? { selectedSlugs: page.people.map((p) => teacherSlug(p.name)) }
      : undefined,
    gallery: page.gallery?.length ? { images: page.gallery } : undefined,
    programs: page.cards?.length ? { cards: page.cards } : undefined,
    flags,
  };
}

/**
 * Build page modules from a retreat JSON record.
 *
 * @param retreat - Retreat record from retreats.json
 */
export function buildModulesFromRetreat(
  retreat: RetreatRecord,
): PageModulesDocument {
  const heroImages = [
    retreat.heroImage,
    ...(retreat.overviewImages ?? []),
  ].filter(Boolean);

  return {
    hero: {
      type: "bento-media",
      title: retreat.title,
      subtitle: retreat.description,
      duration: retreat.duration,
      heroImages,
    },
    stickyNav: { items: [...DEFAULT_RESIDENTIAL_NAV] },
    overview: {
      eyebrow: retreat.eyebrow ?? "Retreat",
      title: retreat.title,
      lead: retreat.overview,
      supportingCopy:
        "Wake to herbal tea, move through guided practice, share sattvic meals, and end the day with kirtan, Ganga Aarti, or quiet reflection.",
      glance: [{ label: "Duration", value: retreat.duration }],
      media: {
        mode: "carousel",
        items: (retreat.overviewImages ?? []).map((url) => ({
          type: "image" as const,
          url,
        })),
      },
    },
    inclusions: { items: retreat.inclusions },
    eligibility: {
      requirements: [...DEFAULT_ELIGIBILITY_REQUIREMENTS],
      showAllianceBadge: false,
    },
    syllabus: { description: "", chapters: [] },
    schedule: {
      description: `A ${retreat.duration.toLowerCase()} rhythm balancing practice, rest, excursions, and sacred time by the Ganges.`,
      items:
        retreat.schedule?.flatMap((day) =>
          day.activities.map((a) => ({
            time: a.time,
            activity: `${day.title}: ${a.activity}`,
          })),
        ) ?? [],
    },
    pricing: {
      description:
        "Choose your dates and room — packages include stay, meals, and the full retreat program.",
      duration: retreat.duration,
      options:
        retreat.packages?.map((pkg) => ({
          roomType: pkg.title,
          price: pkg.price,
          description: pkg.description ?? "",
          features: pkg.features ?? [],
          image: pkg.image,
        })) ?? [],
    },
    faqs: { items: retreat.faqs ?? [] },
    gallery: retreat.gallery?.length
      ? {
          images: retreat.gallery.map((url) => ({
            url,
            category: "retreat",
          })),
        }
      : undefined,
    flags: {
      showExam: false,
      showAccommodation: true,
      showWhyNirvana: true,
      showTravel: true,
      showInstagram: true,
      showMap: true,
    },
  };
}

/**
 * Build online course modules from site page slug via existing mapper.
 *
 * @param slug - Online course slug
 */
export function buildModulesFromOnlineSlug(slug: string): PageModulesDocument {
  const course = buildOnlineCourseFromSitePage(slug);
  return buildModulesFromOnlineCourse(course);
}

/**
 * Sync Page listing fields from hero module for admin tables.
 *
 * @param modules - Page modules document
 */
/**
 * Scalar page columns synced from modules so admin lists avoid JSON I/O.
 *
 * @param modules - Full page modules document
 * @returns Title, description, image, eyebrow, fee, and duration
 */
export function syncPageFieldsFromModules(modules: PageModulesDocument): {
  title: string;
  description: string;
  image: string;
  eyebrow: string;
  fee: string;
  duration: string;
} {
  const hero = modules.hero;
  switch (hero.type) {
    case "bento-media":
      return {
        title: hero.title,
        description: hero.subtitle ?? "",
        image: cmsImageUrl(hero.heroImages?.[0] ?? ""),
        eyebrow: "Yoga Teacher Training",
        fee: hero.fee ?? "",
        duration: hero.duration ?? "",
      };
    case "split-copy":
      return {
        title: hero.title,
        description: hero.subtitle ?? "",
        image: hero.previewUrl,
        eyebrow: hero.eyebrow ?? "Online Course",
        fee: "",
        duration: "",
      };
    case "simple-banner":
      return {
        title: hero.title,
        description: hero.subtitle ?? "",
        image: hero.backgroundImage,
        eyebrow: "",
        fee: "",
        duration: "",
      };
    case "page-minimal":
      return {
        title: hero.title,
        description: hero.description ?? hero.subtitle ?? "",
        image: hero.heroImage,
        eyebrow: hero.eyebrow ?? "",
        fee: "",
        duration: "",
      };
    default:
      return {
        title: "",
        description: "",
        image: "",
        eyebrow: "",
        fee: "",
        duration: "",
      };
  }
}
