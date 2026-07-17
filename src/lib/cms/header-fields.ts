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

/** Default Sign in + Enquire now CTAs (Sign in first). */
export const DEFAULT_HEADER_CTAS: HeaderCta[] = [
  {
    label: "Sign in",
    href: SIGN_IN_URL,
    variant: "link",
    sort: 0,
  },
  {
    label: "Enquire Now",
    href: "/enquire-now",
    variant: "primary",
    sort: 10,
  },
];

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
  const external =
    typeof row.external === "boolean" ? row.external : undefined;
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
 * `signInUrl` + single `cta` when `ctas` is missing or empty.
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
      .filter((row): row is HeaderCta => row != null);
    // Array order is authoritative (admin DnD). `sort` is stamped on save.
    if (normalized.length > 0) return normalized;
  }

  const signInUrl =
    typeof (header as GlobalHeader).signInUrl === "string" &&
    (header as GlobalHeader).signInUrl!.trim()
      ? (header as GlobalHeader).signInUrl!.trim()
      : SIGN_IN_URL;
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
      label: "Sign in",
      href: signInUrl,
      variant: "link",
      sort: 0,
    },
    {
      label: enquireLabel,
      href: enquireHref,
      variant: enquireVariant,
      sort: 10,
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
    ctas,
    signInUrl: linkCta?.href ?? SIGN_IN_URL,
    cta: buttonCta
      ? {
          label: buttonCta.label,
          href: buttonCta.href,
          variant:
            buttonCta.variant === "secondary" ? "secondary" : "primary",
        }
      : {
          label: "Enquire Now",
          href: "/enquire-now",
          variant: "primary",
        },
  };
}

/**
 * Maps flat CMS field values (site_header content type) → GlobalHeader shape.
 * Navigation is supplied separately from the Navigation admin.
 *
 * @param data - Field values from the header content type form
 * @param navigation - Optional nav items to attach
 */
export function headerFieldsToGlobalHeader(
  data: Record<string, unknown>,
  navigation: GlobalHeader["navigation"] = [],
): GlobalHeader {
  const str = (key: string, fallback = "") => {
    const v = data[key];
    return typeof v === "string" && v.trim() ? v.trim() : fallback;
  };

  let ctas: HeaderCta[] | null = null;
  if (Array.isArray(data.ctas)) {
    const fromRepeater = data.ctas
      .map((row, index) => normalizeCtaRow(row, index))
      .filter((row): row is HeaderCta => row != null);
    if (fromRepeater.length > 0) ctas = fromRepeater;
  }

  const legacy: Partial<GlobalHeader> = {
    signInUrl: str("sign_in_url", SIGN_IN_URL),
    cta: {
      label: str("cta_label", "Enquire Now"),
      href: str("cta_href", "/enquire-now"),
      variant: str("cta_variant", "primary") === "secondary"
        ? "secondary"
        : "primary",
    },
  };

  return prepareHeaderForSave({
    navigation,
    logo: {
      light: str("logo_light", "/logo.png"),
      dark: str("logo_dark", "/logo_white.png"),
    },
    ctas: ctas ?? normalizeHeaderCtas(legacy),
    ...legacy,
  });
}

/**
 * Flattens a GlobalHeader into a field-value map for admin editors.
 *
 * @param header - Stored global header settings
 */
export function globalHeaderToFields(
  header: GlobalHeader,
): Record<string, unknown> {
  const prepared = prepareHeaderForSave(header);
  return {
    logo_light: prepared.logo.light,
    logo_dark: prepared.logo.dark,
    sign_in_url: prepared.signInUrl ?? SIGN_IN_URL,
    cta_label: prepared.cta?.label ?? "Enquire Now",
    cta_href: prepared.cta?.href ?? "/enquire-now",
    cta_variant: prepared.cta?.variant ?? "primary",
    ctas: prepared.ctas,
  };
}
