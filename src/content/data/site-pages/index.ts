import { pagePath } from "@/content/pages/path";
import sitePagesJson from "@/content/data/site-pages/site-pages.json";
import type { SitePageCard, SitePageDocument } from "@/content/types";

const courseCards: SitePageCard[] = [
  {
    title: "200 Hour Yoga Teacher Training",
    description:
      "A Yoga Alliance certified foundation in Hatha, Ashtanga, Vinyasa, pranayama, meditation, anatomy, and teaching methodology.",
    href: pagePath({
      type: "course",
      slug: "200-hour-yoga-teacher-training-in-rishikesh-india",
    }),
  },
  {
    title: "300 Hour Yoga Teacher Training",
    description:
      "An advanced residential training for graduates who want to deepen teaching skill, sequencing, yoga therapy, and inner practice.",
    href: pagePath({
      type: "course",
      slug: "300-hour-yoga-teacher-training-in-rishikesh-india",
    }),
  },
  {
    title: "500 Hour Yoga Teacher Training",
    description:
      "A complete 200 + 300 hour journey for students seeking the highest Yoga Alliance teacher training pathway.",
    href: pagePath({
      type: "course",
      slug: "500-hour-yoga-teacher-training-in-rishikesh-india",
    }),
  },
  {
    title: "Yin Yoga & Sound Healing",
    description:
      "Specialty immersions for restorative practice, nervous-system care, and subtle-energy study in Rishikesh.",
    href: pagePath({
      type: "course",
      slug: "yin-yoga-teacher-training-in-rishikesh-india",
    }),
  },
];

const onlineCards: SitePageCard[] = [
  {
    title: "200 Hour Online Yoga TTC",
    description:
      "Study the core Yoga Alliance curriculum from home with guided practice, lectures, and teacher support.",
    href: pagePath({
      type: "online",
      slug: "200-hour-online-yoga-teacher-training",
    }),
  },
  {
    title: "Ayurveda, Meditation & Yin Modules",
    description:
      "Focused online programs for students who want to deepen one area of practice without travelling.",
    href: pagePath({
      type: "site",
      slug: "online-yoga-teacher-training-courses",
    }),
  },
  {
    title: "Short Continuing Education Courses",
    description:
      "Bite-sized yoga, pranayama, anatomy, philosophy, mindfulness, and office-yoga trainings.",
    href: pagePath({ type: "online", slug: "online-50-hour-hatha-yoga-course" }),
  },
];

const retreatCards: SitePageCard[] = [
  {
    title: "3-Day Yoga Meditation Ayurveda Wellness Retreat",
    description:
      "A short reset with yoga, meditation, sattvic meals, and time to breathe in Rishikesh.",
    href: pagePath({
      type: "retreat",
      slug: "3-day-yoga-retreat-in-rishikesh-india",
    }),
  },
  {
    title: "5-Day Yoga Meditation Ayurveda Wellness Retreat",
    description:
      "A balanced retreat rhythm for practice, rest, Ayurvedic care, and guided reflection.",
    href: pagePath({
      type: "retreat",
      slug: "5-day-yoga-retreat-in-rishikesh-india",
    }),
  },
  {
    title: "7-Day Yoga Meditation Ayurveda Wellness Retreat",
    description:
      "A fuller immersion into yogic living, self-care, and Rishikesh's sacred landscape.",
    href: pagePath({
      type: "retreat",
      slug: "7-day-yoga-retreat-in-rishikesh-india",
    }),
  },
];

const CARD_OVERRIDES: Partial<
  Record<string, Pick<SitePageDocument, "cards" | "ctaLabel" | "ctaHref">>
> = {
  "yoga-teacher-training-in-rishikesh-india": { cards: courseCards },
  "online-yoga-teacher-training-courses": { cards: onlineCards },
  "3-day-yoga-retreat-in-rishikesh-india": { cards: retreatCards },
  "5-day-yoga-retreat-in-rishikesh-india": { cards: retreatCards },
  "7-day-yoga-retreat-in-rishikesh-india": { cards: retreatCards },
  "retreat-booking": { cards: retreatCards },
  contact: {
    ctaLabel: "WhatsApp Us",
    ctaHref: "https://wa.me/918218564835",
  },
  "kundalini-yoga-teacher-training-in-rishikesh-india": {
    cards: [
      {
        title: "200 Hour Kundalini Hatha Yoga Teacher Training",
        description:
          "A residential Kundalini, Hatha, kriya, mantra, mudra, and meditation pathway.",
        href: pagePath({
          type: "course",
          slug: "200-hour-kundalini-yoga-teacher-training-in-rishikesh-india",
        }),
      },
    ],
  },
};

const ONLINE_SHORT_SLUGS = [
  "online-50-hour-hatha-yoga-course",
  "online-25-hour-ashtanga-vinyasa-yoga-course",
  "online-25-hour-yoga-philosophy-course",
  "online-25-hour-pranayama-course",
  "online-25-hour-meditation-course",
  "online-25-hour-ayurveda-course",
  "online-20-hour-yoga-nidra-course",
  "online-20-hour-mindfulness-course",
  "online-10-hour-office-yoga-course",
  "online-25-hour-yoga-anatomy-physiology-course",
];

for (const slug of ONLINE_SHORT_SLUGS) {
  CARD_OVERRIDES[slug] = { cards: onlineCards };
}

const basePages = sitePagesJson as Record<string, SitePageDocument>;

/** Static fallback registry — swap repository source to API/DB without changing shape. */
export const SITE_PAGES: Record<string, SitePageDocument> = Object.fromEntries(
  Object.entries(basePages).map(([slug, page]) => [
    slug,
    { ...page, ...CARD_OVERRIDES[slug] },
  ]),
);

export function getStaticSitePage(slug: string): SitePageDocument | null {
  return SITE_PAGES[slug] ?? null;
}

export function getStaticSitePageSlugs(): string[] {
  return Object.keys(SITE_PAGES);
}
