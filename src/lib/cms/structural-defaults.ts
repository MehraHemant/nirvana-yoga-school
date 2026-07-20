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
    intro: "",
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
