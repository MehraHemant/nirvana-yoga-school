import type { NavItem, NavLink } from "@/content/data/navigation/types";

export interface GlobalHeader {
  navigation: NavItem[];
  signInUrl: string;
  logo: {
    light: string;
    dark: string;
  };
  cta: {
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
