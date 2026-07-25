/**
 * Single source of truth for public page layout families and their admin editors.
 * Maps page type + slug → layoutId and ordered section descriptors.
 */

import { KIRTAN_SLUG } from "@/content/mappers/kirtan-page";
import {
  ONLINE_COURSE_SLUGS,
  RESIDENTIAL_COURSE_SLUGS,
  RETREAT_SLUGS,
  VENUE_SLUGS,
} from "@/content/pages/slugs";

/** Layout family identifiers used by the admin page router. */
export type PageLayoutId =
  | "home"
  | "contact"
  | "enquire"
  | "teachers"
  | "residentialCourse"
  | "onlineCourse"
  | "retreat"
  | "venue"
  | "yttHub"
  | "hub"
  | "kirtan"
  | "editorial"
  | "blogPost"
  | "booking";

/** Where a section’s editable content lives. */
export type PageSectionSource =
  | "pageModules"
  | "contentData"
  | "globalSettings"
  | "courseDocument"
  | "hardcoded"
  | "link";

/** One ordered admin/public section for a layout family. */
export type PageLayoutSection = {
  /** Stable section id (matches live anchors where possible) */
  id: string;
  /** Admin panel label */
  label: string;
  /** Storage / edit strategy */
  source: PageSectionSource;
  /** `global_settings` key when source is globalSettings or link */
  settingsKey?: string;
  /** Deep-link href when source is link */
  linkHref?: string;
};

/** Full layout descriptor. */
export type PageLayoutDefinition = {
  layoutId: PageLayoutId;
  /** Human label for admin chrome */
  label: string;
  sections: PageLayoutSection[];
};

const YTT_HUB_SLUG = "yoga-teacher-training-in-rishikesh-india";

const MARKETING_HUB_SLUGS = new Set([
  "online-yoga-teacher-training-courses",
  "kundalini-yoga-teacher-training-in-rishikesh-india",
]);

const BOOKING_SLUGS = new Set(["booking", "retreat-booking"]);

const RESIDENTIAL_SET = new Set<string>(RESIDENTIAL_COURSE_SLUGS);
const ONLINE_SET = new Set<string>(ONLINE_COURSE_SLUGS);
const RETREAT_SET = new Set<string>(
  RETREAT_SLUGS.filter((s) => s !== "retreat-booking"),
);
const VENUE_SET = new Set<string>(VENUE_SLUGS);

const SHARED_LINK = (key: string, label: string): PageLayoutSection => ({
  id: `link-${key}`,
  label,
  source: "link",
  settingsKey: key,
  linkHref: `/admin/sections/shared#${key}`,
});

/**
 * Layout definitions keyed by layoutId.
 */
export const PAGE_LAYOUTS: Record<PageLayoutId, PageLayoutDefinition> = {
  home: {
    layoutId: "home",
    label: "Home",
    sections: [
      { id: "hero", label: "Hero", source: "contentData" },
      { id: "welcome", label: "Welcome", source: "contentData" },
      { id: "video", label: "Video", source: "contentData" },
      { id: "gallery", label: "Gallery", source: "contentData" },
      { id: "why-rishikesh", label: "Why Rishikesh", source: "contentData" },
      { id: "courses", label: "Courses", source: "contentData" },
      { id: "yoga-alliance", label: "Yoga Alliance", source: "contentData" },
      {
        id: "teachers-teaser",
        label: "Teachers teaser",
        source: "contentData",
      },
      { id: "testimonials", label: "Testimonials", source: "contentData" },
      SHARED_LINK("siteMap", "Map (shared embed)"),
      { id: "map", label: "Map (page live)", source: "contentData" },
      { id: "faqs", label: "FAQ", source: "contentData" },
      { id: "final-cta", label: "Final CTA", source: "contentData" },
    ],
  },
  contact: {
    layoutId: "contact",
    label: "Contact",
    sections: [
      { id: "hero", label: "Hero", source: "contentData" },
      { id: "details", label: "Contact details", source: "contentData" },
      { id: "form", label: "Form copy", source: "contentData" },
      { id: "map", label: "Map", source: "contentData" },
    ],
  },
  enquire: {
    layoutId: "enquire",
    label: "Enquire",
    sections: [
      { id: "hero", label: "Hero", source: "contentData" },
      { id: "steps", label: "Steps", source: "contentData" },
      { id: "form", label: "Form copy", source: "contentData" },
      { id: "map", label: "Map", source: "contentData" },
    ],
  },
  teachers: {
    layoutId: "teachers",
    label: "Teachers",
    sections: [
      { id: "hero", label: "Hero band", source: "contentData" },
      { id: "faculty", label: "Faculty profiles", source: "contentData" },
      { id: "home-teaser", label: "Home teaser", source: "contentData" },
    ],
  },
  residentialCourse: {
    layoutId: "residentialCourse",
    label: "Residential course",
    sections: [
      { id: "hero", label: "Hero", source: "pageModules" },
      { id: "sticky-nav", label: "Sticky nav", source: "pageModules" },
      { id: "overview", label: "Overview", source: "pageModules" },
      { id: "inclusions", label: "Inclusions", source: "pageModules" },
      { id: "eligibility", label: "Eligibility", source: "pageModules" },
      { id: "syllabus", label: "Syllabus", source: "pageModules" },
      { id: "schedule", label: "Schedule", source: "pageModules" },
      SHARED_LINK("whyNirvana", "Why Nirvana (shared)"),
      SHARED_LINK("siteMap", "Map (shared)"),
      SHARED_LINK("instagram", "Instagram (shared)"),
      SHARED_LINK("travel", "Travel (shared)"),
      SHARED_LINK("examCertification", "Exam & certification (shared)"),
      {
        id: "accommodation",
        label: "Accommodation & food",
        source: "pageModules",
      },
      { id: "pricing", label: "Pricing", source: "pageModules" },
      { id: "travel-live", label: "Travel (page live)", source: "pageModules" },
      {
        id: "instagram-live",
        label: "Instagram (page live)",
        source: "pageModules",
      },
      { id: "map", label: "Map (page live)", source: "pageModules" },
      { id: "faq", label: "FAQ", source: "pageModules" },
    ],
  },
  onlineCourse: {
    layoutId: "onlineCourse",
    label: "Online course",
    sections: [
      { id: "hero", label: "Hero", source: "pageModules" },
      { id: "trust-bar", label: "Trust bar", source: "courseDocument" },
      { id: "sticky-nav", label: "Sticky nav", source: "pageModules" },
      { id: "overview", label: "Overview", source: "courseDocument" },
      { id: "inclusions", label: "Inclusions", source: "courseDocument" },
      { id: "pricing", label: "Pricing", source: "courseDocument" },
      { id: "curriculum", label: "Curriculum", source: "courseDocument" },
      { id: "teachers", label: "Teachers", source: "courseDocument" },
      { id: "testimonials", label: "Testimonials", source: "courseDocument" },
      SHARED_LINK("examCertification", "Exam & certification (shared)"),
      { id: "faq", label: "FAQ", source: "courseDocument" },
    ],
  },
  retreat: {
    layoutId: "retreat",
    label: "Retreat",
    sections: [
      { id: "hero", label: "Hero", source: "pageModules" },
      { id: "highlights", label: "Highlights", source: "courseDocument" },
      { id: "sticky-nav", label: "Sticky nav", source: "pageModules" },
      { id: "overview", label: "Overview", source: "courseDocument" },
      { id: "inclusions", label: "Inclusions", source: "courseDocument" },
      { id: "schedule", label: "Day schedule", source: "courseDocument" },
      {
        id: "accommodation",
        label: "Accommodation & food",
        source: "pageModules",
      },
      { id: "packages", label: "Packages & dates", source: "courseDocument" },
      { id: "testimonials", label: "Testimonials", source: "courseDocument" },
      SHARED_LINK("whyNirvana", "Why Nirvana (shared)"),
      SHARED_LINK("siteMap", "Map (shared)"),
      SHARED_LINK("instagram", "Instagram (shared)"),
      SHARED_LINK("travel", "Travel (shared)"),
      SHARED_LINK("examCertification", "Exam & certification (shared)"),
      { id: "faq", label: "FAQ", source: "courseDocument" },
    ],
  },
  venue: {
    layoutId: "venue",
    label: "Venue gallery",
    sections: [
      { id: "meta", label: "SEO", source: "pageModules" },
      { id: "hero", label: "Page title", source: "pageModules" },
      { id: "gallery", label: "Photo gallery", source: "pageModules" },
      { id: "videos", label: "Videos", source: "pageModules" },
      SHARED_LINK("siteMap", "Map (shared)"),
      { id: "faq", label: "FAQ", source: "pageModules" },
    ],
  },
  yttHub: {
    layoutId: "yttHub",
    label: "YTT Hub",
    sections: [
      {
        id: "hero",
        label: "Hero",
        source: "globalSettings",
        settingsKey: "yttHub",
      },
      {
        id: "sticky-nav",
        label: "Sticky nav",
        source: "globalSettings",
        settingsKey: "yttHub",
      },
      {
        id: "overview",
        label: "Overview",
        source: "globalSettings",
        settingsKey: "yttHub",
      },
      { id: "video", label: "Video", source: "hardcoded" },
      { id: "gallery", label: "Gallery", source: "hardcoded" },
      {
        id: "why-rishikesh",
        label: "Why Rishikesh",
        source: "globalSettings",
        settingsKey: "yttHub",
      },
      {
        id: "courses",
        label: "Courses",
        source: "globalSettings",
        settingsKey: "yttHub",
      },
      {
        id: "eligibility",
        label: "Eligibility",
        source: "globalSettings",
        settingsKey: "yttHub",
      },
      {
        id: "teachers",
        label: "Teachers",
        source: "link",
        linkHref: "/admin/sections/teachers",
      },
      SHARED_LINK("whyNirvana", "Why Nirvana (shared)"),
      SHARED_LINK("siteMap", "Map (shared)"),
      SHARED_LINK("instagram", "Instagram (shared)"),
      SHARED_LINK("travel", "Travel (shared)"),
      SHARED_LINK("examCertification", "Exam & certification (shared)"),
      {
        id: "faq",
        label: "FAQ",
        source: "globalSettings",
        settingsKey: "yttHub",
      },
    ],
  },
  hub: {
    layoutId: "hub",
    label: "Marketing hub",
    sections: [
      { id: "hero", label: "Hero", source: "pageModules" },
      { id: "overview", label: "Overview", source: "pageModules" },
      { id: "inclusions", label: "Inclusions", source: "pageModules" },
      { id: "dates", label: "Dates / pricing", source: "pageModules" },
      { id: "teachers", label: "Teachers", source: "contentData" },
      { id: "programs", label: "Programs", source: "contentData" },
      { id: "gallery", label: "Gallery", source: "contentData" },
      { id: "editorial", label: "Editorial", source: "contentData" },
      {
        id: "accommodation",
        label: "Accommodation & food",
        source: "pageModules",
      },
      SHARED_LINK("whyNirvana", "Why Nirvana (shared)"),
      SHARED_LINK("siteMap", "Map (shared)"),
      SHARED_LINK("instagram", "Instagram (shared)"),
      SHARED_LINK("examCertification", "Exam & certification (shared)"),
      SHARED_LINK("travel", "Travel (shared)"),
      { id: "travel-live", label: "Travel (page live)", source: "pageModules" },
      {
        id: "instagram-live",
        label: "Instagram (page live)",
        source: "pageModules",
      },
      { id: "faq", label: "FAQ", source: "pageModules" },
      { id: "map", label: "Map (page live)", source: "pageModules" },
    ],
  },
  kirtan: {
    layoutId: "kirtan",
    label: "Kirtan",
    sections: [
      { id: "hero", label: "Hero", source: "pageModules" },
      { id: "sticky-nav", label: "Sticky nav", source: "pageModules" },
      { id: "overview", label: "Overview", source: "pageModules" },
      { id: "inclusions", label: "Inclusions", source: "pageModules" },
      { id: "eligibility", label: "Eligibility", source: "pageModules" },
      { id: "syllabus", label: "Syllabus", source: "pageModules" },
      { id: "gallery", label: "Gallery", source: "contentData" },
      { id: "certification", label: "Certification", source: "contentData" },
      {
        id: "accommodation",
        label: "Accommodation & food",
        source: "pageModules",
      },
      { id: "dates", label: "Dates / pricing", source: "pageModules" },
      { id: "highlights", label: "Highlights", source: "contentData" },
      SHARED_LINK("whyNirvana", "Why Nirvana (shared)"),
      SHARED_LINK("siteMap", "Map (shared)"),
      SHARED_LINK("instagram", "Instagram (shared)"),
      SHARED_LINK("examCertification", "Exam & certification (shared)"),
      {
        id: "instagram-live",
        label: "Instagram (page live)",
        source: "pageModules",
      },
      { id: "faq", label: "FAQ", source: "pageModules" },
      { id: "map", label: "Map (page live)", source: "pageModules" },
    ],
  },
  editorial: {
    layoutId: "editorial",
    label: "Editorial",
    sections: [
      { id: "hero", label: "Hero", source: "pageModules" },
      { id: "overview", label: "Overview", source: "pageModules" },
      { id: "programs", label: "Programs", source: "contentData" },
      { id: "gallery", label: "Gallery", source: "contentData" },
      { id: "editorial", label: "Editorial", source: "contentData" },
      { id: "faq", label: "FAQ", source: "pageModules" },
      SHARED_LINK("siteMap", "Map (shared)"),
      { id: "map", label: "Map (visibility)", source: "pageModules" },
    ],
  },
  blogPost: {
    layoutId: "blogPost",
    label: "Blog post",
    sections: [{ id: "post", label: "Post body", source: "contentData" }],
  },
  booking: {
    layoutId: "booking",
    label: "Booking",
    sections: [],
  },
};

/**
 * Resolves the layout family for a CMS page.
 *
 * @param type - Neon / PageRef type string
 * @param slug - Page slug
 * @returns Layout id used by the admin router
 */
export function resolvePageLayoutId(type: string, slug: string): PageLayoutId {
  if (type === "blog") return "blogPost";
  if (BOOKING_SLUGS.has(slug) || type === "booking") return "booking";

  if (type === "course" || RESIDENTIAL_SET.has(slug)) {
    return "residentialCourse";
  }
  if (type === "online" || ONLINE_SET.has(slug)) {
    return "onlineCourse";
  }
  if (type === "retreat" || RETREAT_SET.has(slug)) {
    return "retreat";
  }
  if (type === "venue" || VENUE_SET.has(slug)) {
    return "venue";
  }

  if (slug === "home") return "home";
  if (slug === "contact") return "contact";
  if (slug === "enquire-now") return "enquire";
  if (slug === "teacher") return "teachers";
  if (slug === YTT_HUB_SLUG) return "yttHub";
  if (slug === KIRTAN_SLUG) return "kirtan";
  if (MARKETING_HUB_SLUGS.has(slug)) return "hub";

  return "editorial";
}

/**
 * Returns the layout definition for a page.
 *
 * @param type - Page type
 * @param slug - Page slug
 */
export function getPageLayout(
  type: string,
  slug: string,
): PageLayoutDefinition {
  return PAGE_LAYOUTS[resolvePageLayoutId(type, slug)];
}

/**
 * Shared-section deep-links for a layout.
 *
 * @param layoutId - Resolved layout id
 */
export function sharedSectionLinksForLayout(
  layoutId: PageLayoutId,
): Array<{ label: string; href: string; hint?: string }> {
  return PAGE_LAYOUTS[layoutId].sections
    .filter(
      (section): section is PageLayoutSection & { linkHref: string } =>
        section.source === "link" && Boolean(section.linkHref),
    )
    .map((section) => ({
      label: section.label,
      href: section.linkHref,
      hint: "Shared global content — page Live toggles are on this page editor",
    }));
}

/**
 * Public View URL for an admin section row (handles home → `/`).
 *
 * @param type - Page type
 * @param slug - Page slug
 * @returns Absolute path on the public site
 */
export function publicViewHref(type: string, slug: string): string {
  if (slug === "home") return "/";
  if (slug === "contact") return "/contact";
  if (slug === "enquire-now") return "/enquire-now";
  if (slug === "teacher") return "/teacher";
  if (type === "course") return `/course/${slug}`;
  if (type === "online") return `/online-course/${slug}`;
  if (type === "retreat") return `/retreat/${slug}`;
  if (type === "venue") return `/venue/${slug}`;
  return `/${slug}`;
}

/** Slugs that have dedicated sidebar section entries (excluded from Other). */
export const DEDICATED_SITE_SECTION_SLUGS = [
  "home",
  "teacher",
  "contact",
  "enquire-now",
] as const;

/**
 * Whether a site slug should appear under Other Pages.
 * Hubs / kirtan / editorial stay listed; dedicated sidebar + booking are excluded.
 *
 * @param slug - Site page slug
 */
export function isOtherSectionSlug(slug: string): boolean {
  if (
    (DEDICATED_SITE_SECTION_SLUGS as readonly string[]).includes(slug) ||
    BOOKING_SLUGS.has(slug)
  ) {
    return false;
  }
  return true;
}
