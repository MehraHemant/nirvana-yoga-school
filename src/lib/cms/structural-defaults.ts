import type { BookingAddonsContent } from "@/content/types/booking";
import type {
  BookingPageContent,
  ContactPageContent,
  EnquirePageContent,
  HomePageContent,
} from "@/content/types/dedicated-pages";
import type {
  ExamCertificationContent,
  InstagramFeedContent,
  TravelGuideContent,
  WhyNirvanaContent,
} from "@/content/types/shared-sections";
import type { ResidentialLifeContent } from "@/content/types/shared-sections";

const EMPTY_HOME_HERO_VIDEO = {
  mobileSrc: "",
  mobilePoster: "",
  desktopSrc: "",
  desktopPoster: "",
};

/** Empty homepage CMS scaffold for normalization and admin defaults. */
export function createEmptyHomePageContent(): HomePageContent {
  return {
    kind: "home",
    hero: {
      badge: "",
      titleLead: "",
      titleAccent: "",
      ctaLabel: "",
      ctaHref: "",
      marqueeItems: [],
      mobileTrust: [],
      video: { ...EMPTY_HOME_HERO_VIDEO },
    },
    welcome: {
      eyebrow: "",
      title: "",
      lead: "",
      highlights: [],
      rotatingStats: [],
      ctaLabel: "",
      ctaHref: "",
      images: [],
      vision: { label: "", body: "" },
      promise: { label: "", body: "" },
    },
    video: {
      title: "",
      youtubeUrls: [],
    },
    gallery: {
      title: "",
      items: [],
      categories: [],
    },
    whyRishikesh: {
      title: "",
      youtubeUrl: "",
      trustLogos: [],
      sutras: [],
      closingInvitation: "",
      videoCard: {
        eyebrow: "",
        title: "",
        speakerTag: "",
        speakerSubtitle: "",
      },
    },
    courses: {
      title: "",
      cards: [],
    },
    yogaAlliance: {
      title: "",
      badgeLabel: "",
      sealEyebrow: "",
      sealTitle: "",
      lead: "",
      body: "",
      certifications: [],
    },
    teachersTeaser: {
      eyebrow: "",
      title: "",
      description: "",
      ctaLabel: "",
      ctaHref: "",
    },
    testimonials: {
      reviews: [],
    },
    map: {
      embedUrl: "",
      iframeTitle: "",
    },
    faqs: {
      eyebrow: "",
      title: "",
      faqs: [],
    },
    finalCta: {
      pill: "",
      title: "",
      titleAccent: "",
      lead: "",
      primaryLabel: "",
      primaryHref: "",
      secondaryLabel: "",
      secondaryHref: "",
      image: "",
    },
    seo: {
      organization: { sameAs: [] },
      localBusiness: {},
    },
  };
}

/** Empty contact page CMS scaffold. */
export function createEmptyContactPageContent(): ContactPageContent {
  return {
    kind: "contact",
    hero: {
      image: "",
      eyebrow: "",
      title: "",
      lead: "",
    },
    details: [],
    form: {
      eyebrow: "",
      title: "",
      lead: "",
      submitLabel: "",
    },
    map: { show: true },
  };
}

/** Empty enquire page CMS scaffold. */
export function createEmptyEnquirePageContent(): EnquirePageContent {
  return {
    kind: "enquire",
    hero: {
      image: "",
      eyebrow: "",
      title: "",
      lead: "",
    },
    steps: [],
    form: {
      eyebrow: "",
      title: "",
      lead: "",
      submitLabel: "",
    },
    map: { show: true },
  };
}

/** Empty booking page CMS scaffold. */
export function createEmptyBookingPageContent(): BookingPageContent {
  return {
    kind: "booking",
    hero: {
      image: "",
      eyebrow: "",
      title: "",
      lead: "",
    },
    steps: [],
    form: {
      eyebrow: "",
      title: "",
      lead: "",
      submitLabel: "",
    },
    map: { show: true },
  };
}

/** Empty per-page lodging & food scaffold for admin editors. */
export function createEmptyResidentialLife(): ResidentialLifeContent {
  return {
    live: true,
    accommodation: {
      live: true,
      stay: { title: "", description: "" },
      galleries: [],
    },
    food: {
      live: true,
      content: {
        title: "",
        description: "",
        points: [],
        dietaryNote: "",
      },
      gallery: [],
    },
    facilities: [],
  };
}

/** Empty optional booking add-ons document. */
export function createEmptyBookingAddons(): BookingAddonsContent {
  return {
    live: true,
    intro: "Choose optional add-ons for this program, or skip this step.",
    items: [],
  };
}

/** Empty exam & certification shared section. */
export function createEmptyExamCertification(): ExamCertificationContent {
  return {
    live: true,
    eyebrow: "",
    title: "",
    description: "",
    steps: [],
    certificates: [],
  };
}

/**
 * Default exam & certification copy used before CMS migration (restored for Live pages).
 * Empty admin scaffolds are healed to this so course pages can render the section.
 */
export function createDefaultExamCertification(): ExamCertificationContent {
  return {
    live: true,
    eyebrow: "Evaluation & Alignment",
    title: "Exam & Certification Process",
    description:
      "Yoga teaching is a skill that is given due relevance at Nirvana Yoga School. It is recognized that yoga is not just something one learns; it is actually something that one lives and breathes into existence.",
    steps: [
      {
        title: "Applied Practical Exam",
        tag: "Practical Evaluation",
        description:
          "Your growth will be tested in an applied practical exam wherein you must demonstrate your knowledge of asanas, pranayama, meditation, sequencing, and safe alignment, as well as care and clarity in guiding others.",
        image: "",
      },
      {
        title: "Written Examinations",
        tag: "Theoretical Evaluation",
        description:
          "You will be subjected to written examinations representing your understanding of the core areas of yoga philosophy, anatomy, breathwork, meditation, and the vast knowledge on which authentic teaching rests.",
        image: "",
      },
      {
        title: "Classroom Participation",
        tag: "Daily Engagement",
        description:
          "Your classroom participation and active engagement throughout the yoga teacher training in India will be observed gently, as how you show up — with presence, enthusiasm, and openness — is equally important as what you know.",
        image: "",
      },
      {
        title: "Teaching Seat Assessment",
        tag: "Final Practice",
        description:
          "Being the last chance to teach, an assessment will let you slip into the teacher’s seat, working your way through all of your learning and receiving nurturing critiques to grow from.",
        image: "",
      },
      {
        title: "Attendance & Consistency",
        tag: "Yogic Discipline",
        description:
          "Attendance and sincere participation in all activities of the yoga teacher training in Rishikesh are plenty enough requirements for certification, for Yoga is as much about discipline and consistency as inspiration.",
        image: "",
      },
    ],
    certificates: [
      {
        title: "Hatha Ashtanga Vinyasa YTTC Certificate",
        subtitle: "Yoga Alliance USA Accredited Course Certificate",
        image:
          "https://www.nirvanayogaschoolindia.com/img/certificate/200h-hatha-ashtanga-yttc-certificate.webp",
      },
      {
        title: "Nirvana Yoga School Certificate",
        subtitle: "Official Institutional Graduation Certificate",
        image:
          "https://www.nirvanayogaschoolindia.com/img/certificate/200-nirvana-yttc-certificate.webp",
      },
    ],
  };
}

/**
 * Admin scaffold for exam & certification when the DB row is missing or empty.
 * Uses the site default so Live + save immediately has public content.
 */
export function createExamCertificationAdminScaffold(): ExamCertificationContent {
  return createDefaultExamCertification();
}

/**
 * Normalizes a partial exam document for storage and public reads.
 *
 * @param raw - Partial CMS value
 */
export function normalizeExamCertification(
  raw: Partial<ExamCertificationContent> | null | undefined,
): ExamCertificationContent {
  const base = createEmptyExamCertification();
  if (!raw || typeof raw !== "object") return base;
  return {
    ...base,
    ...raw,
    live: raw.live !== false,
    eyebrow: raw.eyebrow ?? "",
    title: raw.title ?? "",
    description: raw.description ?? "",
    steps: Array.isArray(raw.steps) ? raw.steps : [],
    certificates: Array.isArray(raw.certificates) ? raw.certificates : [],
  };
}

/** Empty travel guide shared section. */
export function createEmptyTravelGuide(): TravelGuideContent {
  return {
    live: true,
    intro: "",
    quickFacts: [],
    topics: [],
  };
}

/** Empty Why Nirvana shared section. */
export function createEmptyWhyNirvana(): WhyNirvanaContent {
  return {
    live: true,
    highlights: [],
    closing: "",
    banner: "",
  };
}

/** Empty Instagram feed when API and DB are unavailable. */
export function createEmptyInstagramFeed(): InstagramFeedContent {
  return {
    live: false,
    username: null,
    media: [],
    profileUrl: "https://www.instagram.com/",
    postsCount: 0,
  };
}

/** Minimal header navigation scaffold for admin when DB row is missing. */
export function createEmptyPrimaryNav() {
  return [
    { type: "link" as const, label: "HOME", href: "/" },
    { type: "dropdown" as const, label: "YOGA COURSES", items: [] },
    { type: "dropdown" as const, label: "ONLINE COURSES", items: [] },
    { type: "dropdown" as const, label: "RETREATS", items: [] },
    { type: "link" as const, label: "TEACHERS", page: { type: "site" as const, slug: "teacher" } },
    { type: "dropdown" as const, label: "VENUE", items: [] },
    { type: "link" as const, label: "BLOG", href: "/blog" },
    { type: "link" as const, label: "CONTACT", page: { type: "site" as const, slug: "contact" } },
  ];
}

export const SIGN_IN_URL =
  "https://www.nirvanayogaschoolindia.com/student-login";
