import { SIGN_IN_URL } from "@/constants/navigation";
import type {
  GlobalHeader,
  HeaderCta,
  HeaderCtaVariant,
} from "@/content/types/global-settings";

/**
 * Stamps `sort` (0, 10, 20…) from array order.
 *
 * @param items - CTA rows in display order
 */
function withCtaSort(items: HeaderCta[]): HeaderCta[] {
  return items.map((item, index) => ({ ...item, sort: index * 10 }));
}

/** Default header CTA (Enquire now only — Sign in removed from site chrome). */
export const DEFAULT_HEADER_CTAS: HeaderCta[] = [
  {
    label: "Enquire Now",
    href: "/enquire-now",
    variant: "primary",
    sort: 0,
  },
];

/**
 * True when a CTA is the legacy Sign in link (label or enroll URL).
 *
 * @param cta - Normalized header CTA row
 */
function isSignInCta(cta: HeaderCta): boolean {
  const label = cta.label.trim().toLowerCase();
  if (label === "sign in" || label === "signin" || label === "log in") {
    return true;
  }
  return cta.href.trim() === SIGN_IN_URL;
}

const DEFAULT_HEADER_LOGO = {
  light: "/logo.png",
  dark: "/logo_white.png",
  lightAlt: "Nirvana Yoga School",
  darkAlt: "Nirvana Yoga School",
  href: "/",
} as const;

/**
 * Adds defaults to a legacy or incomplete header logo configuration.
 *
 * @param logo - Stored header logo configuration
 */
function normalizeHeaderLogo(
  logo: Partial<GlobalHeader["logo"]> | null | undefined,
): GlobalHeader["logo"] {
  return {
    light:
      typeof logo?.light === "string" && logo.light.trim()
        ? logo.light.trim()
        : DEFAULT_HEADER_LOGO.light,
    dark:
      typeof logo?.dark === "string" && logo.dark.trim()
        ? logo.dark.trim()
        : DEFAULT_HEADER_LOGO.dark,
    lightAlt:
      typeof logo?.lightAlt === "string" && logo.lightAlt.trim()
        ? logo.lightAlt.trim()
        : DEFAULT_HEADER_LOGO.lightAlt,
    darkAlt:
      typeof logo?.darkAlt === "string" && logo.darkAlt.trim()
        ? logo.darkAlt.trim()
        : DEFAULT_HEADER_LOGO.darkAlt,
    href:
      typeof logo?.href === "string" && logo.href.trim()
        ? logo.href.trim()
        : DEFAULT_HEADER_LOGO.href,
  };
}

/**
 * Coerces a raw variant string into a supported header CTA style.
 *
 * @param value - Raw variant from CMS / form
 */
function toCtaVariant(value: unknown): HeaderCtaVariant {
  if (value === "secondary" || value === "link") return value;
  return "primary";
}

/**
 * Normalizes one CTA row from CMS JSON or form data.
 *
 * @param raw - Untyped row
 * @param index - Fallback sort index
 */
function normalizeCtaRow(raw: unknown, index: number): HeaderCta | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const label = typeof row.label === "string" ? row.label.trim() : "";
  const href = typeof row.href === "string" ? row.href.trim() : "";
  if (!label && !href) return null;
  const sort =
    typeof row.sort === "number" && Number.isFinite(row.sort)
      ? row.sort
      : index * 10;
  const external = typeof row.external === "boolean" ? row.external : undefined;
  return {
    label: label || "CTA",
    href: href || "#",
    variant: toCtaVariant(row.variant),
    sort,
    ...(external !== undefined ? { external } : {}),
  };
}

/**
 * Builds an ordered CTA list from a header document, migrating legacy
 * single `cta` when `ctas` is missing or empty. Legacy Sign in rows are dropped.
 *
 * @param header - Partial or legacy global header value
 */
export function normalizeHeaderCtas(
  header: Partial<GlobalHeader> | Record<string, unknown> | null | undefined,
): HeaderCta[] {
  if (!header || typeof header !== "object") {
    return DEFAULT_HEADER_CTAS.map((c) => ({ ...c }));
  }

  const rawCtas = (header as GlobalHeader).ctas;
  if (Array.isArray(rawCtas) && rawCtas.length > 0) {
    const normalized = rawCtas
      .map((row, index) => normalizeCtaRow(row, index))
      .filter((row): row is HeaderCta => row != null)
      .filter((row) => !isSignInCta(row));
    // Array order is authoritative (admin DnD). `sort` is stamped on save.
    if (normalized.length > 0) return normalized;
  }

  const legacyCta = (header as GlobalHeader).cta;
  const enquireLabel =
    typeof legacyCta?.label === "string" && legacyCta.label.trim()
      ? legacyCta.label.trim()
      : "Enquire Now";
  const enquireHref =
    typeof legacyCta?.href === "string" && legacyCta.href.trim()
      ? legacyCta.href.trim()
      : "/enquire-now";
  const enquireVariant =
    legacyCta?.variant === "secondary" ? "secondary" : "primary";

  return [
    {
      label: enquireLabel,
      href: enquireHref,
      variant: enquireVariant,
      sort: 0,
    },
  ];
}

/**
 * Stamps `sort` and derives deprecated `signInUrl` / `cta` for older readers.
 *
 * @param header - Header with a `ctas` list (or legacy fields)
 */
export function prepareHeaderForSave(header: GlobalHeader): GlobalHeader {
  const ctas = withCtaSort(normalizeHeaderCtas(header));
  const linkCta = ctas.find((c) => c.variant === "link");
  const buttonCta = ctas.find(
    (c) => c.variant === "primary" || c.variant === "secondary",
  );
  return {
    ...header,
    logo: normalizeHeaderLogo(header.logo),
    ctas,
    signInUrl: linkCta?.href ?? SIGN_IN_URL,
    cta: buttonCta
      ? {
          label: buttonCta.label,
          href: buttonCta.href,
          variant: buttonCta.variant === "secondary" ? "secondary" : "primary",
        }
      : {
          label: "Enquire Now",
          href: "/enquire-now",
          variant: "primary",
        },
  };
}
