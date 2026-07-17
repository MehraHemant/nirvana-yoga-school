"use server";

import { revalidatePath } from "next/cache";
import type { GlobalFooter } from "@/content/types/global-settings";
import { readDataFromFormData } from "@/lib/cms/content-schema-utils";
import {
  footerFieldsToGlobalFooter,
  globalFooterToFields,
} from "@/lib/cms/footer-fields";
import { prisma } from "@/lib/db";

const DEFAULT_FOOTER_FIELDS = globalFooterToFields({
  brand: {
    logo: "/logo.png",
    tagline:
      "A residential sanctuary for seekers — where classical Hatha, philosophy, and meditation converge on the sacred banks of the Ganga.",
    credentials: "Yoga Alliance RYS · Est. 2012 · Tapovan, Rishikesh",
  },
  social: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/nirvanayogaschool",
      icon: "instagram",
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/@nirvanayogaschool",
      icon: "youtube",
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/nirvanayogaschool",
      icon: "facebook",
    },
    {
      label: "WhatsApp",
      href: "https://wa.me/919876543210",
      icon: "whatsapp",
    },
  ],
  columns: [
    {
      heading: "Programs",
      links: [
        {
          label: "200-Hour YTT",
          href: "/course/200-hour-yoga-teacher-training-in-rishikesh-india",
        },
        {
          label: "Online Courses",
          href: "/online-yoga-teacher-training-courses",
        },
        {
          label: "Retreats",
          href: "/retreat/3-day-yoga-retreat-in-rishikesh-india",
        },
      ],
    },
    {
      heading: "School",
      links: [
        { label: "About", href: "/#about" },
        { label: "Teachers", href: "/teacher" },
        { label: "Contact", href: "/contact" },
      ],
    },
    { heading: "Contact", links: [] },
  ],
  contact: {
    address: "Tapovan, Rishikesh, Uttarakhand 249192, India",
    email: "hello@nirvanayogaschoolindia.com",
    phone: "+91 98765 43210",
  },
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
});

/**
 * Saves the global site footer from the Footer admin form.
 *
 * @param formData - Footer field values from the admin form
 */
export async function saveSiteFooterAction(formData: FormData) {
  const fields = readDataFromFormData(formData);
  const existing = await prisma.globalSettings.findUnique({
    where: { key: "footer" },
  });
  const previous =
    existing?.value && typeof existing.value === "object"
      ? (existing.value as unknown as GlobalFooter)
      : null;

  const footer = footerFieldsToGlobalFooter(fields, previous);

  await prisma.globalSettings.upsert({
    where: { key: "footer" },
    create: { key: "footer", value: footer },
    update: { value: footer },
  });

  revalidatePath("/");
  revalidatePath("/admin/components/footer");
  revalidatePath("/admin/settings/footer");
  revalidatePath("/api/content/footer");
}

/**
 * Loads footer field values for the admin editor.
 */
export async function loadSiteFooterFields(): Promise<Record<string, unknown>> {
  const row = await prisma.globalSettings.findUnique({
    where: { key: "footer" },
  });
  if (!row?.value || typeof row.value !== "object") {
    return DEFAULT_FOOTER_FIELDS;
  }
  const raw = row.value as Record<string, unknown>;
  if (typeof raw.brand === "object" && raw.brand) {
    return globalFooterToFields(raw as unknown as GlobalFooter);
  }
  if (typeof raw.brand_logo === "string") return raw;
  return DEFAULT_FOOTER_FIELDS;
}
