"use server";

import { revalidatePath } from "next/cache";
import { PRIMARY_NAV } from "@/constants/navigation";
import { readDataFromFormData } from "@/lib/cms/content-schema-utils";
import {
  globalHeaderToFields,
  headerFieldsToGlobalHeader,
} from "@/lib/cms/header-fields";
import { db } from "@/lib/db";

/**
 * Saves the global site header from the Header component form.
 *
 * @param formData - Header field values from the admin form
 */
export async function saveSiteHeaderAction(formData: FormData) {
  const fields = readDataFromFormData(formData);
  const existing = await db.globalSettings.findUnique({
    where: { key: "header" },
  });
  const prev = (existing?.value ?? {}) as Record<string, unknown>;
  const prevNav = Array.isArray(prev.navigation) ? prev.navigation : [];

  const header = headerFieldsToGlobalHeader(fields, prevNav as never);

  await db.globalSettings.upsert({
    where: { key: "header" },
    create: { key: "header", value: header },
    update: { value: header },
  });

  revalidatePath("/");
  revalidatePath("/admin/components/header");
  revalidatePath("/admin/settings/header");
  revalidatePath("/api/content/header");
}

/**
 * Loads header field values for the admin editor (with defaults).
 */
export async function loadSiteHeaderFields(): Promise<Record<string, unknown>> {
  const row = await db.globalSettings.findUnique({
    where: { key: "header" },
  });
  if (!row?.value || typeof row.value !== "object") {
    return globalHeaderToFields({
      navigation: PRIMARY_NAV,
      logo: {
        light: "/logo.png",
        dark: "/logo_white.png",
        lightAlt: "Nirvana Yoga School",
        darkAlt: "Nirvana Yoga School",
        href: "/",
      },
      ctas: [
        {
          label: "Sign in",
          href: "https://www.nirvanayogaschoolindia.com/student-login",
          variant: "link",
          sort: 0,
        },
        {
          label: "Enquire Now",
          href: "/enquire-now",
          variant: "primary",
          sort: 10,
        },
      ],
    });
  }
  const raw = row.value as Record<string, unknown>;
  if (typeof raw.logo === "object" && raw.logo) {
    return globalHeaderToFields(raw as never);
  }
  if (typeof raw.logo_light === "string") {
    return {
      logo_light_alt: "Nirvana Yoga School",
      logo_dark_alt: "Nirvana Yoga School",
      logo_href: "/",
      ...raw,
    };
  }
  return globalHeaderToFields(raw as never);
}
