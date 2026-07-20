import type { NavItem } from "@/content/types/navigation";

/** Visual style for a header CTA button or text link. */
export type HeaderCtaVariant = "primary" | "secondary" | "link";

/**
 * One ordered call-to-action in the site header (e.g. Sign in, Enquire now).
 */
export interface HeaderCta {
  /** Display label */
  label: string;
  /** Destination URL (internal path or absolute) */
  href: string;
  /** Button style, or `link` for text-link CTAs like Sign in */
  variant: HeaderCtaVariant;
  /** Optional sort weight (0, 10, 20…); array order is authoritative when present */
  sort?: number;
  /** Force new-tab behavior; defaults to true for absolute http(s) URLs */
  external?: boolean;
}

export interface GlobalHeader {
  navigation: NavItem[];
  logo: {
    /** Image shown when the header has a light or solid background. */
    light: string;
    /** Image shown over dark or transparent hero backgrounds. */
    dark: string;
    /** Accessible description for the light logo image. */
    lightAlt: string;
    /** Accessible description for the dark logo image. */
    darkAlt: string;
    /** Internal path or absolute URL used by both header logo variants. */
    href: string;
  };
  /** Ordered header CTAs (Sign in, Enquire now, custom…) */
  ctas: HeaderCta[];
  /**
   * @deprecated Prefer `ctas`. Kept when migrating older header documents.
   */
  signInUrl?: string;
  /**
   * @deprecated Prefer `ctas`. Kept when migrating older header documents.
   */
  cta?: {
    label: string;
    href: string;
    variant: "primary" | "secondary";
  };
}

export interface GlobalFooter {
  brand: {
    logo: string;
    tagline: string;
    credentials: string;
  };
  social: Array<{
    label: string;
    href: string;
    icon: "instagram" | "youtube" | "facebook" | "whatsapp";
  }>;
  columns: Array<{
    heading: string;
    links: Array<{ label: string; href: string; external?: boolean }>;
  }>;
  contact: {
    address: string;
    email: string;
    phone: string;
  };
  legal: Array<{ label: string; href: string }>;
}

export interface GlobalSettings {
  key: string;
  value: GlobalHeader | GlobalFooter | Record<string, unknown>;
}

export const GLOBAL_SETTINGS_KEYS = {
  HEADER: "header",
  FOOTER: "footer",
  SITE_CONFIG: "siteConfig",
} as const;

export interface SiteConfig {
  siteName: string;
  siteUrl: string;
  defaultSeo: {
    title: string;
    description: string;
    ogImage: string;
  };
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}
