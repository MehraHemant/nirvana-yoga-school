/**
 * schema.org JSON-LD builders. Search engines use these for rich results;
 * AI assistants (ChatGPT, Claude, Perplexity, Gemini) use them to extract
 * accurate facts — program names, prices, durations, location, FAQs.
 */
import type { PageSeoContext } from "@/content/repositories/page-seo";
import {
  absoluteUrl,
  htmlToText,
  isoDuration,
  parsePrice,
  SITE_ADDRESS,
  SITE_LOGO_URL,
  SITE_NAME,
  SITE_URL,
  socialImageUrl,
} from "@/lib/seo/site";

type Json = Record<string, unknown>;

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Social profiles linked from Organization.sameAs. */
export type SiteIdentity = {
  sameAs?: string[];
  email?: string;
  phone?: string;
  description?: string;
};

/**
 * Site-wide Organization + WebSite graph nodes.
 *
 * @param identity - Contact details and social profiles from CMS
 */
export function organizationGraph(identity: SiteIdentity = {}): Json[] {
  const sameAs = (identity.sameAs ?? []).filter(Boolean);
  return [
    {
      "@type": "EducationalOrganization",
      "@id": ORG_ID,
      name: SITE_NAME,
      alternateName: "Nirvana Yoga School India",
      url: absoluteUrl("/"),
      logo: { "@type": "ImageObject", url: SITE_LOGO_URL },
      image: SITE_LOGO_URL,
      description:
        identity.description ||
        "Yoga Alliance registered yoga school in Rishikesh, India offering 200, 300 and 500 hour yoga teacher training, yoga retreats, and online yoga courses.",
      foundingDate: "2012",
      address: { "@type": "PostalAddress", ...SITE_ADDRESS },
      areaServed: "Worldwide",
      knowsAbout: [
        "Yoga Teacher Training",
        "Hatha Yoga",
        "Ashtanga Vinyasa Yoga",
        "Kundalini Yoga",
        "Yin Yoga",
        "Meditation",
        "Yoga Nidra",
        "Pranayama",
        "Ayurveda",
        "Sound Healing",
        "Yoga Philosophy",
      ],
      ...(identity.email ? { email: identity.email } : {}),
      ...(identity.phone ? { telephone: identity.phone } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: absoluteUrl("/"),
      name: SITE_NAME,
      inLanguage: "en",
      publisher: { "@id": ORG_ID },
    },
  ];
}

/**
 * BreadcrumbList from ordered (name, path) pairs. Home is prepended.
 *
 * @param items - Crumbs after Home
 */
export function breadcrumbNode(items: { name: string; path: string }[]): Json {
  const crumbs = [{ name: "Home", path: "/" }, ...items];
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/**
 * FAQPage node, or null when there are no usable FAQs.
 *
 * @param faqs - Question / answer pairs (answers may be HTML)
 */
export function faqNode(
  faqs: { question: string; answer: string }[],
): Json | null {
  const items = faqs
    .map((f) => ({ q: f.question?.trim(), a: htmlToText(f.answer ?? "") }))
    .filter((f) => f.q && f.a);
  if (!items.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Section label + listing path used in breadcrumbs per page type. */
export const SECTION_BY_TYPE: Record<string, { name: string; path: string }> = {
  course: {
    name: "Yoga Teacher Training in Rishikesh",
    path: "/yoga-teacher-training-in-rishikesh-india",
  },
  online: {
    name: "Online Yoga Teacher Training",
    path: "/online-yoga-teacher-training-courses",
  },
};

/**
 * Main entity for a program page: Course (residential / online) or
 * TouristTrip (retreat).
 *
 * @param page - Page row context
 * @param url - Absolute page URL
 * @param title - Display title
 * @param description - Plain description
 */
export function programNode(
  page: PageSeoContext,
  url: string,
  title: string,
  description: string,
): Json | null {
  const image = page.image ? socialImageUrl(page.image) : undefined;
  const price = parsePrice(page.fee);
  const duration = isoDuration(page.duration);
  const offer = price
    ? {
        "@type": "Offer",
        price: price.price,
        priceCurrency: price.currency,
        availability: "https://schema.org/InStock",
        url,
        category: /from/i.test(page.fee) ? "Starting price" : "Tuition",
      }
    : undefined;

  if (page.type === "course" || page.type === "online") {
    const online = page.type === "online";
    const hours = /teacher training/i.test(title)
      ? title.match(/\b(200|300|500)[ -]hour\b/i)?.[1]
      : undefined;
    const credential = hours
      ? `${hours} Hour Yoga Teacher Training certificate (Yoga Alliance)`
      : undefined;
    return {
      "@type": "Course",
      "@id": `${url}#course`,
      name: title,
      description,
      url,
      ...(image ? { image } : {}),
      provider: { "@id": ORG_ID },
      inLanguage: "en",
      ...(credential ? { educationalCredentialAwarded: credential } : {}),
      ...(offer ? { offers: offer } : {}),
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: online ? "Online" : "Onsite",
        ...(online
          ? { courseWorkload: "Self-paced" }
          : {
              location: {
                "@type": "Place",
                name: SITE_NAME,
                address: { "@type": "PostalAddress", ...SITE_ADDRESS },
              },
              ...(duration ? { duration } : {}),
            }),
      },
    };
  }

  if (page.type === "retreat") {
    return {
      "@type": "TouristTrip",
      "@id": `${url}#retreat`,
      name: title,
      description,
      url,
      ...(image ? { image } : {}),
      touristType: ["Yoga practitioners", "Wellness travellers"],
      provider: { "@id": ORG_ID },
      itinerary: {
        "@type": "Place",
        name: `${SITE_NAME}, Rishikesh`,
        address: { "@type": "PostalAddress", ...SITE_ADDRESS },
      },
      ...(offer ? { offers: offer } : {}),
    };
  }

  return null;
}
