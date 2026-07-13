import { prisma } from "@/lib/db";
import type { ContentResult, RepositoryOptions } from "./fetch";
import type { GlobalHeader, GlobalFooter, SiteConfig } from "@/content/types/global-settings";

const DEFAULT_HEADER: GlobalHeader = {
  navigation: [],
  signInUrl: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=1600&q=85",
  logo: { light: "/logo.png", dark: "/logo_white.png" },
  cta: { label: "Enquire Now", href: "/enquire-now", variant: "primary" },
};

const DEFAULT_FOOTER: GlobalFooter = {
  brand: {
    logo: "/logo.png",
    tagline: "A residential sanctuary for seekers — where classical Hatha, philosophy, and meditation converge on the sacred banks of the Ganga.",
    credentials: "Yoga Alliance RYS · Est. 2012 · Tapovan, Rishikesh",
  },
  social: [
    { label: "Instagram", href: "https://www.instagram.com/nirvanayogaschool", icon: "instagram" },
    { label: "YouTube", href: "https://www.youtube.com/@nirvanayogaschool", icon: "youtube" },
    { label: "Facebook", href: "https://www.facebook.com/nirvanayogaschool", icon: "facebook" },
    { label: "WhatsApp", href: "https://wa.me/919876543210", icon: "whatsapp" },
  ],
  columns: [
    {
      heading: "Programs",
      links: [
        { label: "200-Hour YTT", href: "/course/200-hour-yoga-teacher-training-in-rishikesh-india" },
        { label: "300-Hour YTT", href: "/course/300-hour-yoga-teacher-training-in-rishikesh-india" },
        { label: "500-Hour YTT", href: "/course/500-hour-yoga-teacher-training-in-rishikesh-india" },
        { label: "Kundalini YTT", href: "/course/200-hour-kundalini-yoga-teacher-training-in-rishikesh-india" },
        { label: "Online Courses", href: "/online-yoga-teacher-training-courses" },
        { label: "Retreats", href: "/retreat/3-day-yoga-retreat-in-rishikesh-india" },
      ],
    },
    {
      heading: "School",
      links: [
        { label: "About", href: "/#about" },
        { label: "Teachers", href: "/teacher" },
        { label: "Reviews", href: "/#reviews" },
        { label: "Course Venue", href: "/venue/course-venue" },
        { label: "Contact", href: "/contact" },
        { label: "Journal", href: "/blog" },
        { label: "FAQ", href: "/#faq" },
      ],
    },
    {
      heading: "Contact",
      links: [
        { label: "Tapovan, Rishikesh, Uttarakhand 249192, India", href: "#" },
        { label: "hello@nirvanayogaschoolindia.com", href: "mailto:hello@nirvanayogaschoolindia.com" },
        { label: "+91 98765 43210", href: "https://wa.me/919876543210" },
      ],
    },
  ],
  contact: {
    address: "Tapovan, Rishikesh, Uttarakhand 249192, India",
    email: "hello@nirvanayogaschoolindia.com",
    phone: "+91 98765 43210",
  },
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Sitemap", href: "#" },
  ],
};

const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: "Nirvana Yoga School",
  siteUrl: "https://www.nirvanayogaschoolindia.com",
  defaultSeo: {
    title: "Nirvana Yoga School — Yoga Teacher Training in Rishikesh, India",
    description: "Residential yoga teacher training courses (200/300/500-hour), retreats, and online programs. Yoga Alliance certified. Est. 2012 in Rishikesh.",
    ogImage: "/logo.png",
  },
  whatsappNumber: "919876543210",
  contactEmail: "hello@nirvanayogaschoolindia.com",
  contactPhone: "+91 98765 43210",
  address: "Tapovan, Rishikesh, Uttarakhand 249192, India",
};

async function fetchFromDb<T>(key: string): Promise<T | null> {
  const record = await prisma.globalSettings.findUnique({ where: { key } });
  return record?.value as T | null;
}

async function fetchWithFallback<T>(key: string, fallback: T): Promise<T> {
  const dbValue = await fetchFromDb<T>(key);
  return dbValue ?? fallback;
}

export async function getGlobalHeader(
  options?: RepositoryOptions,
): Promise<ContentResult<GlobalHeader>> {
  try {
    const data = await fetchWithFallback("header", DEFAULT_HEADER);
    return { data, source: "db" as const };
  } catch {
    return { data: DEFAULT_HEADER, source: "json" as const };
  }
}

export async function getGlobalFooter(
  options?: RepositoryOptions,
): Promise<ContentResult<GlobalFooter>> {
  try {
    const data = await fetchWithFallback("footer", DEFAULT_FOOTER);
    return { data, source: "db" as const };
  } catch {
    return { data: DEFAULT_FOOTER, source: "json" as const };
  }
}

export async function getSiteConfig(
  options?: RepositoryOptions,
): Promise<ContentResult<SiteConfig>> {
  try {
    const data = await fetchWithFallback("siteConfig", DEFAULT_SITE_CONFIG);
    return { data, source: "db" as const };
  } catch {
    return { data: DEFAULT_SITE_CONFIG, source: "json" as const };
  }
}
