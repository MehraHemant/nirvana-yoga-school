/**
 * Builds seed payloads for shared site sections from legacy `@/data` modules.
 * Used by `scripts/seed-cms.ts` — runtime UI reads Neon via `/api/content/*`.
 *
 * Home FAQs are inlined (string image URLs) so seed does not import Next static assets.
 */

import { DEFAULT_HOME_PAGE_CONTENT } from "../src/content/data/dedicated-page-defaults";
import { DEFAULT_EXAM_CERTIFICATION } from "../src/content/data/exam-certification-defaults";
import { DEFAULT_TRAVEL_GUIDE } from "../src/content/data/travel-guide-defaults";
import { VENUE_FAQS } from "../src/content/data/venue-faqs";
import {
  ACCOMMODATION_GALLERIES,
  COMFORTABLE_STAY,
  FACILITY_ITEMS,
  FOOD_CONTENT,
  FOOD_GALLERY,
} from "../src/data/accommodationFood";
import {
  RETREAT_FOOD_GALLERY,
  RETREAT_MEAL_HIGHLIGHTS,
  RETREAT_ROOM_GALLERIES,
} from "../src/data/retreatAccommodation";
import { REVIEWS } from "../src/data/reviews";
import {
  WHY_NIRVANA_BANNER,
  WHY_NIRVANA_CLOSING,
  WHY_NIRVANA_HIGHLIGHTS,
} from "../src/data/whyNirvana";
import {
  YTT_HUB_COURSES,
  YTT_HUB_COURSES_INTRO,
  YTT_HUB_ELIGIBILITY,
  YTT_HUB_FAQS,
  YTT_HUB_HERO_IMAGE,
  YTT_HUB_INTRO,
  YTT_HUB_NAV,
  YTT_HUB_OVERVIEW_IMAGE,
  YTT_HUB_OVERVIEW_INSET_IMAGE,
  YTT_HUB_WHY_RISHIKESH,
} from "../src/data/yttHubPage";
import { FALLBACK_INSTAGRAM_FEED } from "../src/lib/instagram";

const FACILITY_ICON_KEYS: Record<string, string> = {
  Shower: "shower",
  Terrace: "terrace",
  "Dining area": "bowl",
  "Free Wi-Fi": "wifi",
  "Yoga hall": "lotus",
  "Environment friendly": "leaf",
  Garden: "garden",
  "Attached bathroom": "bathroom",
  "Hot water": "flame",
  "Purified drinking water": "droplet",
  "Paid laundry service": "laundry",
  Heater: "flame",
  "Air conditioning": "wind",
};

/** Homepage FAQ seed — mirrors `src/data/homeFaqs.ts` with URL strings only. */
const HOME_FAQS_SEED = [
  {
    question: "How much does yoga teacher training cost in India?",
    answer:
      "Yoga teacher training in India typically costs between $700 and $1,800. At Nirvana, our 200-hour course starts at $649 all-inclusive — covering accommodation, three sattvic meals a day, course manual, excursions and Yoga Alliance certification.",
    image:
      "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1200&auto=format&fit=crop&q=80",
    tag: "Pricing",
  },
  {
    question: "Which certification is best for yoga teachers?",
    answer:
      "Yoga Alliance USA is the most widely recognised yoga certification in the world. We offer RYT 200, RYT 300, and RYT 500-hour programs — all meeting international standards so you can teach confidently anywhere.",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80",
    tag: "Certification",
  },
  {
    question: "Do I need prior yoga experience to join?",
    answer:
      "No advanced experience is required for our 200-hour foundational course. An open heart, basic familiarity with yoga, and the willingness to commit fully are all you need. Our courses gently guide you from the ground up.",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80",
    tag: "Prerequisites",
  },
  {
    question: "What kind of food do you serve?",
    answer:
      "Three nourishing sattvic vegetarian meals daily, prepared fresh with Ayurvedic balance and cold-pressed sunflower oil. Vegan and gluten-free options are available on request — just let us know at registration.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop&q=80",
    tag: "Nutrition",
  },
  {
    question: "Why is Rishikesh called the yoga capital of the world?",
    answer:
      "Rishikesh is where ancient sages first practiced and taught yoga, on the banks of the Ganges and beneath the Himalayas. To this day seekers come here to feel its radiant spiritual energy and deep yogic culture firsthand.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80",
    tag: "Heritage",
  },
  {
    question: "What does a typical day look like?",
    answer:
      "Days begin around 6am with meditation and pranayama, followed by Hatha or Ashtanga practice, breakfast, philosophy and anatomy classes, lunch, rest, alignment workshops, evening practice, satsang or kirtan, and dinner. Sundays are reserved for excursions and rest.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80",
    tag: "Daily Vibe",
  },
];

/**
 * Shared section rows for `global_settings` upsert.
 *
 * @returns Key/value pairs ready for JSON columns
 */
export function buildSharedSectionSeeds(): Array<{
  key: string;
  value: object;
}> {
  return [
    {
      key: "residentialLife",
      value: {
        live: true,
        accommodation: {
          live: true,
          stay: COMFORTABLE_STAY,
          galleries: ACCOMMODATION_GALLERIES.map((gallery) => ({
            id: gallery.id,
            label: gallery.label,
            description: gallery.description,
            images: gallery.images.map((image) => ({ ...image })),
          })),
        },
        food: {
          live: true,
          content: FOOD_CONTENT,
          gallery: FOOD_GALLERY.map((image) => ({ ...image })),
        },
        facilities: FACILITY_ITEMS.map((item) => ({
          label: item.label,
          iconKey: FACILITY_ICON_KEYS[item.label] ?? "leaf",
          ...(item.note ? { note: item.note } : {}),
        })),
      },
    },
    {
      key: "reviews",
      value: {
        reviews: REVIEWS,
      },
    },
    {
      key: "homeFaqs",
      value: {
        faqs: HOME_FAQS_SEED,
      },
    },
    {
      key: "whyNirvana",
      value: {
        live: true,
        highlights: WHY_NIRVANA_HIGHLIGHTS,
        closing: WHY_NIRVANA_CLOSING,
        banner: WHY_NIRVANA_BANNER,
      },
    },
    {
      key: "examCertification",
      value: {
        ...DEFAULT_EXAM_CERTIFICATION,
        steps: DEFAULT_EXAM_CERTIFICATION.steps.map((step) => ({ ...step })),
        certificates: DEFAULT_EXAM_CERTIFICATION.certificates.map(
          (certificate) => ({ ...certificate }),
        ),
      },
    },
    {
      key: "siteMap",
      value: {
        live: true,
        eyebrow: DEFAULT_HOME_PAGE_CONTENT.map.eyebrow,
        title: DEFAULT_HOME_PAGE_CONTENT.map.title,
        description: DEFAULT_HOME_PAGE_CONTENT.map.description,
        embedUrl: DEFAULT_HOME_PAGE_CONTENT.map.embedUrl,
        iframeTitle: DEFAULT_HOME_PAGE_CONTENT.map.iframeTitle,
      },
    },
    {
      key: "venueFaqs",
      value: {
        faqs: VENUE_FAQS,
      },
    },
    {
      key: "retreatAccommodation",
      value: {
        live: true,
        accommodation: { live: true },
        food: { live: true },
        roomGalleries: RETREAT_ROOM_GALLERIES.map((gallery) => ({
          id: gallery.id,
          label: gallery.label,
          description: gallery.description,
          images: gallery.images.map((image) => ({ ...image })),
        })),
        foodGallery: RETREAT_FOOD_GALLERY.map((image) => ({ ...image })),
        mealHighlights: [...RETREAT_MEAL_HIGHLIGHTS],
        defaultFacilities: [
          "Purified Drinking Water",
          "Hot Water",
          "Attached bathroom",
          "Garden",
          "Environment friendly",
          "Yoga hall",
          "Free Wi-Fi",
          "Dining area",
          "Terrace",
          "Paid laundry service",
          "Shower",
        ],
      },
    },
    {
      key: "yttHub",
      value: {
        heroImage: YTT_HUB_HERO_IMAGE,
        overviewImage: YTT_HUB_OVERVIEW_IMAGE,
        overviewInsetImage: YTT_HUB_OVERVIEW_INSET_IMAGE,
        intro: {
          pill: YTT_HUB_INTRO.pill,
          title: YTT_HUB_INTRO.title,
          lead: YTT_HUB_INTRO.lead,
          overviewPoints: [...YTT_HUB_INTRO.overviewPoints],
          stats: YTT_HUB_INTRO.stats.map((stat) => ({ ...stat })),
        },
        whyRishikesh: {
          title: YTT_HUB_WHY_RISHIKESH.title,
          paragraphs: [...YTT_HUB_WHY_RISHIKESH.paragraphs],
          images: [...YTT_HUB_WHY_RISHIKESH.images],
        },
        coursesIntro: {
          title: YTT_HUB_COURSES_INTRO.title,
          paragraphs: [...YTT_HUB_COURSES_INTRO.paragraphs],
        },
        courses: YTT_HUB_COURSES.map((course) => ({
          ...course,
          focusAreas: [...course.focusAreas],
        })),
        eligibility: {
          title: YTT_HUB_ELIGIBILITY.title,
          paragraphs: [...YTT_HUB_ELIGIBILITY.paragraphs],
        },
        nav: YTT_HUB_NAV.map((item) => ({ ...item })),
        faqs: YTT_HUB_FAQS.map((faq) => ({ ...faq })),
      },
    },
    {
      key: "instagram",
      value: {
        live: true,
        username: FALLBACK_INSTAGRAM_FEED.username,
        displayName: FALLBACK_INSTAGRAM_FEED.displayName,
        bio: FALLBACK_INSTAGRAM_FEED.bio,
        website: FALLBACK_INSTAGRAM_FEED.website,
        profileUrl: FALLBACK_INSTAGRAM_FEED.profileUrl,
        postsCount: FALLBACK_INSTAGRAM_FEED.postsCount,
        followersCount: FALLBACK_INSTAGRAM_FEED.followersCount,
        followingCount: FALLBACK_INSTAGRAM_FEED.followingCount,
        media: FALLBACK_INSTAGRAM_FEED.media.map((item) => ({ ...item })),
      },
    },
    {
      key: "travel",
      value: {
        ...DEFAULT_TRAVEL_GUIDE,
        quickFacts: DEFAULT_TRAVEL_GUIDE.quickFacts.map((fact) => ({
          ...fact,
        })),
        topics: DEFAULT_TRAVEL_GUIDE.topics.map((topic) => ({ ...topic })),
      },
    },
  ];
}
