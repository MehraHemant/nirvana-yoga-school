import { DEFAULT_ONLINE_HUB_NAV } from "@/content/page-modules-defaults";
import type { PageModulesDocument } from "@/content/types";
import type { HomeHeroVideoContent } from "@/content/types/dedicated-pages";
import { liveImage } from "@/lib/live-site";

const HERO_IMAGE = liveImage("/img/home/banner_3.webp");

/**
 * Matches the homepage hero MP4 sources so the online hub autoplays the same
 * full-bleed background (muted, looping, no controls).
 */
export const DEFAULT_ONLINE_HUB_HERO_VIDEO: HomeHeroVideoContent = {
  mobileSrc: "/videos/videomobile.mp4",
  desktopSrc: "/videos/videodesktop.mp4",
  mobilePoster: "/videos/videomobile-poster.webp",
  desktopPoster: "/videos/videodesktop-poster.webp",
};

/**
 * Overview content video from the live online-courses page
 * (`youtube.com/embed/hHjuGhx8qSk` beside the “Online Yoga Courses” heading).
 */
export const DEFAULT_ONLINE_HUB_OVERVIEW_VIDEO_URL =
  "https://www.youtube.com/watch?v=hHjuGhx8qSk";

/** YouTube poster for the overview player when CMS poster is unset. */
export const DEFAULT_ONLINE_HUB_OVERVIEW_VIDEO_POSTER =
  "https://i.ytimg.com/vi/hHjuGhx8qSk/hqdefault.jpg";

const DEFAULT_FAQS = [
  {
    question: "Can I attend an online course as a beginner?",
    answer:
      "Yes. Our 200-hour online trainings are designed to build a strong foundation — from basics through teaching methodology — at a self-paced rhythm.",
  },
  {
    question: "Are the courses certified by Yoga Alliance?",
    answer:
      "Yes. Eligible online teacher training and YACEP courses are accredited by Yoga Alliance USA.",
  },
  {
    question: "Can I complete the course anytime?",
    answer:
      "Yes. Study with pre-recorded sessions, manuals, and weekly live Q&A — on your preferred schedule.",
  },
  {
    question: "Is there an exam?",
    answer:
      "Most teacher trainings include a practical assessment: typically short practice/teaching videos plus written assignments.",
  },
  {
    question: "Is the certification the same as an in-person course?",
    answer:
      "Yes. Online Yoga Alliance certification carries the same recognition as our residential programs.",
  },
  {
    question: "Can I combine online and in-person hours?",
    answer:
      "Yes. Many students complete 200 hours online and continue with 300 hours in Rishikesh (or the reverse).",
  },
];

/**
 * Builds default page modules for the online courses hub.
 */
export function createDefaultOnlineHubModules(): PageModulesDocument {
  return {
    meta: {
      title: "Online Yoga Teacher Training Courses | Nirvana Yoga School",
      description:
        "Self-paced Yoga Alliance online courses from Rishikesh teachers — 200-hour YTT, YACEP specialty courses, lifetime access, and live Q&A support.",
    },
    hero: {
      type: "page-minimal",
      eyebrow: "Online · Yoga Alliance certified",
      title: "Nirvana online yoga teacher training",
      titleLead: "Nirvana online yoga",
      titleAccent: "teacher training",
      subtitle:
        "Self-paced courses from Rishikesh teachers — lifetime access and weekly live Q&A.",
      description:
        "Yoga Alliance certified programs with lifetime access — from specialty YACEP courses to full 200-hour teacher trainings.",
      heroImage: HERO_IMAGE,
      heroVideo: { ...DEFAULT_ONLINE_HUB_HERO_VIDEO },
      ctaLabel: "Browse courses",
      ctaHref: "#courses",
      marqueeItems: [
        "Yoga Alliance certified",
        "Lifetime access",
        "Weekly live Q&A",
        "Self-paced learning",
        "Rishikesh teachers",
      ],
      mobileTrust: [
        { value: "200h", label: "YTT" },
        { value: "YACEP", label: "CE hours" },
        { value: "Live", label: "Q&A" },
      ],
    },
    stickyNav: {
      live: true,
      items: [...DEFAULT_ONLINE_HUB_NAV],
    },
    overview: {
      live: true,
      eyebrow: "Overview",
      title: "Online yoga courses — learn from the teachers of Rishikesh",
      lead: "Our online yoga teacher training focuses on a holistic approach — asana, philosophy, meditation, anatomy, and teaching skills — guided by deeply knowledgeable teachers. Study in the comfort of your home with virtual classes, manuals, and learning resources, then earn Yoga Alliance certification recognized worldwide.",
      supportingCopy:
        "Ideal if you want to deepen practice, gain teaching credentials, or continue education without traveling — while still connecting to the yogic environment of Rishikesh.",
      glance: [],
      media: {
        mode: "video",
        items: [
          {
            type: "video",
            url: DEFAULT_ONLINE_HUB_OVERVIEW_VIDEO_URL,
            poster: DEFAULT_ONLINE_HUB_OVERVIEW_VIDEO_POSTER,
            title: "Online yoga teacher training at Nirvana Yoga School",
          },
        ],
      },
      vision: {
        label: "Learn anywhere",
        body: "Self-paced lessons, manuals, and weekly live Q&A — practice from home while staying connected to Rishikesh teachers.",
      },
      promise: {
        label: "Globally recognized",
        body: "Yoga Alliance certification that supports teaching opportunities worldwide, with the same credibility as our residential programs.",
      },
      highlights: [
        "Yoga Alliance certified",
        "Lifetime course access",
        "Weekly live Q&A",
        "Beginner to advanced paths",
      ],
      rotatingStats: [
        { value: "200h", label: "Online YTT" },
        { value: "YACEP", label: "CE hours" },
        { value: "Live", label: "Weekly Q&A" },
      ],
      ctaLabel: "Browse courses",
      ctaHref: "#courses",
    },
    inclusions: { items: [] },
    eligibility: { requirements: [], showAllianceBadge: false },
    syllabus: { description: "", chapters: [] },
    schedule: { description: "", items: [] },
    pricing: { description: "", options: [] },
    faqs: {
      live: true,
      items: DEFAULT_FAQS,
    },
    flags: {
      showExam: true,
      showAccommodation: false,
      showWhyNirvana: false,
      showTravel: false,
      showInstagram: false,
      showMap: false,
    },
  };
}

export const ONLINE_HUB_HERO_IMAGE = HERO_IMAGE;
