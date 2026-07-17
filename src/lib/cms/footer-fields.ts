import type { GlobalFooter } from "@/content/types/global-settings";

function str(
  data: Record<string, unknown>,
  key: string,
  fallback = "",
): string {
  const v = data[key];
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

/**
 * Parses “Label | /path” lines into footer link objects.
 *
 * @param raw - Multiline textarea value
 */
export function parseLabelHrefLines(
  raw: string,
): Array<{ label: string; href: string }> {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split("|");
      return {
        label: (label ?? "").trim(),
        href: rest.join("|").trim() || "#",
      };
    })
    .filter((row) => row.label);
}

/**
 * Formats footer links for a textarea field.
 *
 * @param links - Label/href pairs
 */
export function formatLabelHrefLines(
  links: Array<{ label: string; href: string }>,
): string {
  return links.map((l) => `${l.label} | ${l.href}`).join("\n");
}

/**
 * Maps flat site_footer fields → GlobalFooter (keeps defaults for missing bits).
 *
 * @param data - Form field values
 * @param previous - Existing footer (columns contact merged when empty)
 */
export function footerFieldsToGlobalFooter(
  data: Record<string, unknown>,
  previous?: GlobalFooter | null,
): GlobalFooter {
  const programs = parseLabelHrefLines(str(data, "column_programs"));
  const school = parseLabelHrefLines(str(data, "column_school"));
  const legal = parseLabelHrefLines(str(data, "legal_links"));

  const social: GlobalFooter["social"] = [];
  const ig = str(data, "social_instagram");
  const yt = str(data, "social_youtube");
  const fb = str(data, "social_facebook");
  const wa = str(data, "social_whatsapp");
  if (ig) social.push({ label: "Instagram", href: ig, icon: "instagram" });
  if (yt) social.push({ label: "YouTube", href: yt, icon: "youtube" });
  if (fb) social.push({ label: "Facebook", href: fb, icon: "facebook" });
  if (wa) social.push({ label: "WhatsApp", href: wa, icon: "whatsapp" });

  const prevColumns = previous?.columns ?? [];
  const columns: GlobalFooter["columns"] = [
    {
      heading: "Programs",
      links:
        programs.length > 0
          ? programs
          : (prevColumns.find((c) => c.heading === "Programs")?.links ?? []),
    },
    {
      heading: "School",
      links:
        school.length > 0
          ? school
          : (prevColumns.find((c) => c.heading === "School")?.links ?? []),
    },
    {
      heading: "Contact",
      links: [
        {
          label: str(data, "contact_address", previous?.contact.address ?? ""),
          href: "#",
        },
        {
          label: str(data, "contact_email", previous?.contact.email ?? ""),
          href: `mailto:${str(data, "contact_email", previous?.contact.email ?? "")}`,
        },
        {
          label: str(data, "contact_phone", previous?.contact.phone ?? ""),
          href: str(
            data,
            "social_whatsapp",
            previous?.social.find((s) => s.icon === "whatsapp")?.href ?? "#",
          ),
        },
      ].filter((l) => l.label),
    },
  ];

  return {
    brand: {
      logo: str(data, "brand_logo", previous?.brand.logo ?? "/logo.png"),
      tagline: str(data, "brand_tagline", previous?.brand.tagline ?? ""),
      credentials: str(
        data,
        "brand_credentials",
        previous?.brand.credentials ?? "",
      ),
    },
    social: social.length > 0 ? social : (previous?.social ?? []),
    columns,
    contact: {
      address: str(data, "contact_address", previous?.contact.address ?? ""),
      email: str(data, "contact_email", previous?.contact.email ?? ""),
      phone: str(data, "contact_phone", previous?.contact.phone ?? ""),
    },
    legal: legal.length > 0 ? legal : (previous?.legal ?? []),
  };
}

/**
 * Flattens GlobalFooter into a field-value map for admin editors.
 *
 * @param footer - Stored footer settings
 */
export function globalFooterToFields(
  footer: GlobalFooter,
): Record<string, unknown> {
  const programs =
    footer.columns.find((c) => c.heading === "Programs")?.links ?? [];
  const school =
    footer.columns.find((c) => c.heading === "School")?.links ?? [];
  const byIcon = (icon: string) =>
    footer.social.find((s) => s.icon === icon)?.href ?? "";

  return {
    brand_logo: footer.brand.logo,
    brand_tagline: footer.brand.tagline,
    brand_credentials: footer.brand.credentials,
    contact_address: footer.contact.address,
    contact_email: footer.contact.email,
    contact_phone: footer.contact.phone,
    social_instagram: byIcon("instagram"),
    social_youtube: byIcon("youtube"),
    social_facebook: byIcon("facebook"),
    social_whatsapp: byIcon("whatsapp"),
    column_programs: formatLabelHrefLines(programs),
    column_school: formatLabelHrefLines(school),
    legal_links: formatLabelHrefLines(footer.legal),
  };
}
