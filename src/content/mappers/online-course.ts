import type { StickyNavItem } from "@/components/courses/CourseStickyNav";
import type { TeacherProfile } from "@/components/home/TeachersSection";
import onlineCourseMeta from "@/content/data/online-courses/meta.json";
import { SITE_PAGES } from "@/content/data/site-pages";
import type {
  CourseScheduleItem,
  CourseSyllabusSection,
  FAQ,
  OnlineCourseDocument,
  SitePageDocument,
  SitePageSection,
} from "@/content/types";
import { ONLINE_COURSE_SLUGS } from "@/content/pages/slugs";

import { ENROLL_BASE, LIVE_SITE } from "@/lib/live-site";

export { ONLINE_COURSE_SLUGS };

const SITE = LIVE_SITE;
const SLIDER = (n: number) => `${SITE}/img/gallery/course-slider/${n}.webp`;

type CourseMeta = {
  enrollId: string;
  price: string;
  video: string | null;
  testimonials: { name: string; quote: string }[];
  faqs: FAQ[];
};

const META = onlineCourseMeta as Record<string, CourseMeta>;

function findSection(
  page: SitePageDocument,
  ...titles: string[]
): SitePageSection | undefined {
  const normalized = titles.map((t) => t.toLowerCase());
  return page.sections.find((section) =>
    normalized.some((t) => section.title.toLowerCase().includes(t)),
  );
}

function splitParagraphs(text?: string): string[] {
  if (!text) return [];
  return text
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitList(text?: string): string[] {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function titleCaseName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bJi\b/g, "Ji")
    .replace(/\bDr\./g, "Dr.");
}

function isExperienceLine(line: string): boolean {
  return /experience|years|taught in|clinical/i.test(line);
}

function isEducationLine(line: string): boolean {
  return /^(m\.|b\.|masters|bachelors|certified|e-ryt|500|diploma|p\.g\.|m\.a\.|m\.sc|msc|ccy|award|graduate)/i.test(
    line,
  );
}

function parseTeachers(section?: SitePageSection): TeacherProfile[] {
  if (!section?.subsections?.length) return [];

  return section.subsections.map((teacher, index) => {
    const bodyParts = splitParagraphs(teacher.body);
    const role = bodyParts[0] ?? "Yoga Instructor";
    const bio = bodyParts.slice(1).join(" ") || role;
    const items = teacher.items ?? [];

    const education: string[] = [];
    const detailedExperience: string[] = [];
    const expertise: string[] = [];

    for (const item of items) {
      if (isExperienceLine(item)) {
        detailedExperience.push(item);
      } else if (
        expertise.length > 0 ||
        (!isEducationLine(item) &&
          detailedExperience.length > 0 &&
          item.length < 40 &&
          !item.includes("University") &&
          !item.includes("Certified"))
      ) {
        expertise.push(item.replace(/^\d+\.\s*/, ""));
      } else if (isEducationLine(item) || detailedExperience.length === 0) {
        education.push(item);
      } else {
        expertise.push(item.replace(/^\d+\.\s*/, ""));
      }
    }

    const image =
      teacher.image ??
      section.images?.[index] ??
      `${SITE}/img/teacher/gurudev.webp`;

    return {
      name: titleCaseName(teacher.title),
      experienceSummary: detailedExperience[0] ?? role,
      image,
      bio,
      education,
      detailedExperience,
      expertise,
    };
  });
}

function parseSyllabus(section?: SitePageSection): CourseSyllabusSection[] {
  if (!section?.subsections?.length) return [];

  return section.subsections.map((block) => ({
    title: block.title,
    description: block.body ?? "",
    subtopics: block.items ?? [],
  }));
}

function parseSchedule(section?: SitePageSection): CourseScheduleItem[] {
  if (!section?.body) return [];
  return splitList(section.body).map((line) => {
    const [time, ...rest] = line.split(":");
    if (rest.length === 0) {
      return { time: line, activity: "Live Q&A session" };
    }
    return {
      time: `${time.trim()}:`,
      activity: rest.join(":").trim(),
    };
  });
}

function inferCertification(inclusions: string[]): string {
  const joined = inclusions.join(" ").toLowerCase();
  if (joined.includes("ryt-200") || joined.includes("ryt 200")) {
    return "RYT-200, Yoga Alliance";
  }
  if (joined.includes("yacep")) {
    return "YACEP, Yoga Alliance";
  }
  return "Yoga Alliance Certified";
}

function inferLevel(page: SitePageDocument, inclusions: string[]): string {
  const promo = findSection(page, "inclusions")?.subsections?.[0]?.items ?? [];
  const joined = [...promo, ...inclusions].join(" ").toLowerCase();
  if (joined.includes("all level")) return "All Levels";
  if (joined.includes("beginner")) return "Beginner to Intermediate";
  return "All Levels";
}

function collectHeroImages(page: SitePageDocument): string[] {
  const overview = findSection(page, "overview");
  const images = overview?.images?.length
    ? overview.images
    : overview?.image
      ? [overview.image]
      : [page.image];

  if (page.slug.includes("200-hour-online") || page.slug.includes("200-hour")) {
    const slider = Array.from({ length: 16 }, (_, i) => SLIDER(i + 1));
    return [...new Set([...images, ...slider])];
  }

  return images.filter(Boolean);
}

function buildNavItems(options: {
  hasTeachers: boolean;
  hasTestimonials: boolean;
}): StickyNavItem[] {
  const items: StickyNavItem[] = [
    { id: "#overview", label: "Overview", shortLabel: "Overview" },
    { id: "#inclusions", label: "Inclusions", shortLabel: "Include" },
    { id: "#syllabus", label: "Curriculum", shortLabel: "Curriculum" },
  ];

  if (options.hasTeachers) {
    items.push({ id: "#teachers", label: "Teachers", shortLabel: "Teachers" });
  }

  if (options.hasTestimonials) {
    items.push({
      id: "#testimonials",
      label: "Reviews",
      shortLabel: "Reviews",
    });
  }

  items.push(
    { id: "#pricing", label: "Pricing", shortLabel: "Pricing" },
    { id: "#faq", label: "FAQ", shortLabel: "FAQ" },
  );

  return items;
}

function condenseOverview(body: string): string {
  const paragraphs = splitParagraphs(body);
  if (paragraphs.length <= 2) return body;
  return paragraphs.slice(0, 2).join("\n\n");
}

export function buildOnlineCourseFromSitePage(
  slug: string,
): OnlineCourseDocument {
  const page = SITE_PAGES[slug];
  const meta = META[slug];

  if (!page || !meta) {
    throw new Error(`Missing site page or meta for online course: ${slug}`);
  }

  const overviewSection = findSection(page, "overview");
  const inclusionsSection = findSection(page, "inclusions");
  const curriculumSection = findSection(page, "curriculum");
  const teachersSection = findSection(page, "teachers");
  const scheduleSection = findSection(page, "live class");

  const inclusions = splitList(inclusionsSection?.body);
  const teachers = parseTeachers(teachersSection);
  const syllabus = parseSyllabus(curriculumSection);
  const schedule = parseSchedule(scheduleSection);
  const heroImages = collectHeroImages(page);
  const certification = inferCertification(inclusions);
  const level = inferLevel(page, inclusions);
  const enrollHref = `${ENROLL_BASE}/${meta.enrollId}`;

  return {
    slug,
    title: page.title,
    subtitle: page.description,
    level,
    duration: "Self-Paced",
    certification,
    fee: meta.price,
    image: heroImages[0] ?? page.image,
    certBadge: `${SITE}/img/rys200.png`,
    heroImages,
    overview: condenseOverview(overviewSection?.body ?? page.description),
    highlights: [
      "Self-paced — learn on your schedule",
      "Lifetime access to videos & resources",
      "4K video · studio-quality audio",
      certification.includes("RYT-200")
        ? "RYT-200 eligible upon completion"
        : "YACEP continuing education credits",
    ],
    syllabusDescription:
      curriculumSection?.body ??
      "A structured curriculum crafted by experienced teachers at Nirvana Yoga School.",
    syllabus,
    scheduleDescription: schedule.length
      ? "Optional live Q&A sessions (IST) for enrolled students — join weekly to clarify concepts and connect with teachers."
      : "",
    schedule,
    pricingDescription:
      "Lifetime access · self-paced · 20% off with code NIRVANA (valid till 30 June 2026).",
    pricing: [
      {
        roomType: "Full Online Course",
        price: meta.price,
        description: `One-time payment · lifetime access · ${certification} certificate upon completion.`,
        features: [
          "Pre-recorded 4K course videos",
          "e-Books, manual & assignments",
          "Email & WhatsApp support",
          certification.includes("RYT-200")
            ? "Eligible for Yoga Alliance RYT-200"
            : "Yoga Alliance YACEP credits",
        ],
        image: heroImages[0] ?? page.image,
      },
    ],
    inclusions,
    exclusions: [],
    faqs: meta.faqs,
    teachers,
    testimonials: meta.testimonials,
    ctaPrimary: "Buy Now",
    ctaPrimaryHref: enrollHref,
    ctaSecondary: "Free Preview",
    ctaSecondaryHref: `${enrollHref}?et=free_trial`,
    navItems: buildNavItems({
      hasTeachers: teachers.length > 0,
      hasTestimonials: meta.testimonials.length > 0,
    }),
  };
}

export function buildAllOnlineCoursesFromSitePages(
  excludeSlugs: string[] = [],
): Record<string, OnlineCourseDocument> {
  return Object.fromEntries(
    ONLINE_COURSE_SLUGS.filter((slug) => !excludeSlugs.includes(slug)).map(
      (slug) => [slug, buildOnlineCourseFromSitePage(slug)],
    ),
  );
}
