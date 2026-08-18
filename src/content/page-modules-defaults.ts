import type {
  EligibilityRequirement,
  ModuleFlags,
  PageModulesDocument,
  WhyOnlineModule,
} from "@/content/types/page-modules";
import type { StickyNavItem } from "@/content/types/shared";

/** Default residential course sticky nav anchors. */
export const DEFAULT_RESIDENTIAL_NAV: StickyNavItem[] = [
  { id: "#overview", label: "Overview", shortLabel: "Overview" },
  { id: "#inclusions", label: "Inclusions", shortLabel: "Include" },
  { id: "#eligibility", label: "Eligibility", shortLabel: "Eligible" },
  { id: "#syllabus", label: "Syllabus", shortLabel: "Syllabus" },
  { id: "#schedule", label: "Schedule", shortLabel: "Schedule" },
  { id: "#exam", label: "Exam", shortLabel: "Exam" },
  { id: "#accommodation", label: "Lodging", shortLabel: "Lodging" },
  { id: "#pricing", label: "Dates & Fees", shortLabel: "Dates" },
  { id: "#why-nirvana", label: "Why Nirvana", shortLabel: "Why" },
  { id: "#travel", label: "Travel", shortLabel: "Travel" },
  { id: "#faq", label: "FAQ", shortLabel: "FAQ" },
];

/** Default site/hub sticky nav when modules are not customized. */
export const DEFAULT_SITE_NAV: StickyNavItem[] = [
  { id: "#overview", label: "Overview", shortLabel: "Overview" },
  { id: "#inclusions", label: "Inclusions", shortLabel: "Include" },
  { id: "#pricing", label: "Dates & Fees", shortLabel: "Dates" },
  { id: "#faq", label: "FAQ", shortLabel: "FAQ" },
];

/** Sticky nav for the online courses marketing hub. */
export const DEFAULT_ONLINE_HUB_NAV: StickyNavItem[] = [
  { id: "#about", label: "Overview", shortLabel: "Overview" },
  { id: "#why-online", label: "Why Online", shortLabel: "Why" },
  { id: "#courses", label: "Courses", shortLabel: "Courses" },
  { id: "#faq", label: "FAQ", shortLabel: "FAQ" },
];

/** Default Why Online band for the online courses hub. */
export const DEFAULT_ONLINE_HUB_WHY_ONLINE: WhyOnlineModule = {
  live: true,
  _id: "why-online",
  eyebrow: "Why learn online",
  title: "Rishikesh teachers, from anywhere",
  description:
    "Study with the same curriculum depth as our in-person trainings — flexible pacing, lifetime resources, and live support from Rishikesh faculty.",
  items: [
    {
      title: "Study on your schedule",
      description:
        "Self-paced lessons that fit work, family, and travel — without fixed classroom hours.",
    },
    {
      title: "Lifetime course access",
      description:
        "Keep videos, manuals, and practice resources available whenever you return to the material.",
    },
    {
      title: "Live teacher support",
      description:
        "Weekly Q&A with Rishikesh teachers so questions never wait for the next module.",
    },
    {
      title: "Same curriculum depth",
      description:
        "Asana, philosophy, anatomy, and teaching skills aligned with our residential programs.",
    },
  ],
};

/** Default online course sticky nav. */
export const DEFAULT_ONLINE_NAV: StickyNavItem[] = [
  { id: "#overview", label: "Overview", shortLabel: "Overview" },
  { id: "#inclusions", label: "Inclusions", shortLabel: "Include" },
  { id: "#syllabus", label: "Curriculum", shortLabel: "Curriculum" },
  { id: "#pricing", label: "Pricing", shortLabel: "Pricing" },
  { id: "#faq", label: "FAQ", shortLabel: "FAQ" },
];

/** Default YTT admission standard cards. */
export const DEFAULT_ELIGIBILITY_REQUIREMENTS: EligibilityRequirement[] = [
  {
    num: "01",
    title: "Practitioner Level",
    desc: "Perfect for beginner to intermediate practitioners wishing to deepen their practice, learn alignment, and obtain credentials to teach. No prior teaching experience required.",
  },
  {
    num: "02",
    title: "Sincere Will to Grow",
    desc: "Applicants should nurture a genuine study of and dedication to living by yoga, supporting balance, mindfulness, and inner peace.",
  },
  {
    num: "03",
    title: "Language Proficiency",
    desc: "Courses are conducted fully in English. A basic understanding is required to participate in lectures, philosophy debates, and teaching practicums.",
  },
  {
    num: "04",
    title: "Age Guideline",
    desc: "To ensure the maturity, responsibility, and physical preparedness required for intensive ashram living, applicants must be at least 16 years of age.",
  },
];

/** Default module visibility flags for residential courses. */
export const DEFAULT_RESIDENTIAL_FLAGS: ModuleFlags = {
  showExam: true,
  showAccommodation: true,
  showWhyNirvana: true,
  showTravel: true,
  showInstagram: true,
  showMap: true,
};

/** Default module visibility flags for site/hub pages. */
export const DEFAULT_SITE_FLAGS: ModuleFlags = {
  showExam: false,
  showAccommodation: false,
  showWhyNirvana: false,
  showTravel: false,
  showInstagram: false,
  showMap: false,
};

/** Default module visibility flags for venue pages. */
export const DEFAULT_VENUE_FLAGS: ModuleFlags = {
  showExam: false,
  showAccommodation: false,
  showWhyNirvana: false,
  showTravel: false,
  showInstagram: false,
  showMap: true,
};

/**
 * Create an empty module document scaffold for a new page.
 *
 * @param heroType - Initial hero layout type
 */
export function createEmptyPageModules(
  heroType: PageModulesDocument["hero"]["type"] = "page-minimal",
): PageModulesDocument {
  const hero =
    heroType === "bento-media"
      ? {
          type: "bento-media" as const,
          title: "",
          subtitle: "",
          heroImages: [],
          videos: [],
        }
      : heroType === "split-copy"
        ? {
            type: "split-copy" as const,
            title: "",
            previewType: "image" as const,
            previewUrl: "",
          }
        : heroType === "simple-banner"
          ? {
              type: "simple-banner" as const,
              title: "",
              backgroundImage: "",
            }
          : {
              type: "page-minimal" as const,
              title: "",
              heroImage: "",
            };

  return {
    hero,
    stickyNav: { items: [...DEFAULT_RESIDENTIAL_NAV] },
    overview: {
      eyebrow: "",
      title: "",
      lead: "",
      supportingCopy: "",
      glance: [],
      media: { mode: "image", items: [] },
    },
    inclusions: { items: [] },
    eligibility: {
      requirements: [...DEFAULT_ELIGIBILITY_REQUIREMENTS],
      showAllianceBadge: true,
    },
    syllabus: { description: "", chapters: [] },
    schedule: { description: "", items: [] },
    pricing: { description: "", options: [], batches: [] },
    teachers: { selectedSlugs: [] },
    faqs: { items: [] },
    flags: { ...DEFAULT_RESIDENTIAL_FLAGS },
  };
}
