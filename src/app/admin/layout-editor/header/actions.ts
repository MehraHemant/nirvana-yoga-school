"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

/**
 * Load header settings from the database, or return defaults.
 */
export async function loadHeaderData(): Promise<Record<string, unknown>> {
  const row = await prisma.globalSettings.findUnique({
    where: { key: "header" },
  });
  if (row?.value && typeof row.value === "object") {
    return row.value as Record<string, unknown>;
  }
  return {
    logo: { light: "/logo.png", dark: "/logo_white.png" },
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
    signInUrl: "https://www.nirvanayogaschoolindia.com/student-login",
    cta: { label: "Enquire Now", href: "/enquire-now", variant: "primary" },
    navigation: [],
  };
}

/**
 * Load navigation items from the NavigationGroup/NavigationItem tables.
 */
export async function loadNavigationData() {
  const groups = await prisma.navigationGroup.findMany({
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  return groups;
}

/**
 * Save header settings (logo + ordered CTAs from legacy flat fields).
 *
 * @param formData - Form fields: logo_light, logo_dark, sign_in_url, cta_label, cta_href, cta_variant
 */
export async function saveHeaderAction(formData: FormData) {
  const existing = await prisma.globalSettings.findUnique({
    where: { key: "header" },
  });
  const prev = (existing?.value ?? {}) as Record<string, unknown>;
  const signInUrl =
    (formData.get("sign_in_url") as string) ||
    "https://www.nirvanayogaschoolindia.com/student-login";
  const ctaLabel = (formData.get("cta_label") as string) || "Enquire Now";
  const ctaHref = (formData.get("cta_href") as string) || "/enquire-now";
  const ctaVariant =
    (formData.get("cta_variant") as string) === "secondary"
      ? "secondary"
      : "primary";

  const header = {
    ...prev,
    logo: {
      light: (formData.get("logo_light") as string) || "/logo.png",
      dark: (formData.get("logo_dark") as string) || "/logo_white.png",
    },
    ctas: [
      { label: "Sign in", href: signInUrl, variant: "link" as const, sort: 0 },
      {
        label: ctaLabel,
        href: ctaHref,
        variant: ctaVariant as "primary" | "secondary",
        sort: 10,
      },
    ],
    signInUrl,
    cta: {
      label: ctaLabel,
      href: ctaHref,
      variant: ctaVariant,
    },
  };

  await prisma.globalSettings.upsert({
    where: { key: "header" },
    create: { key: "header", value: header },
    update: { value: header },
  });

  revalidatePath("/");
  revalidatePath("/admin/layout-editor/header");
  revalidatePath("/api/content/header");
}

/**
 * Save a single navigation item's label and href.
 *
 * @param formData - Form fields: item_id, label, href
 */
export async function saveNavItemAction(formData: FormData) {
  const id = formData.get("item_id") as string;
  const label = formData.get("label") as string;
  const href = formData.get("href") as string;

  if (!id) return;

  await prisma.navigationItem.update({
    where: { id },
    data: {
      label: label || undefined,
      href: href || undefined,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/layout-editor/header");
}
