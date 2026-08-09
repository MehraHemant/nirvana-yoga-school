"use server";

import { revalidatePath } from "next/cache";
import type { GlobalFooter } from "@/content/types/global-settings";
import { readDataFromFormData } from "@/lib/cms/content-schema-utils";
import {
  footerFieldsToGlobalFooter,
  globalFooterToFields,
} from "@/lib/cms/footer-fields";
import { createDefaultGlobalFooter } from "@/lib/cms/structural-defaults";
import { db } from "@/lib/db";

const DEFAULT_FOOTER_FIELDS = globalFooterToFields(createDefaultGlobalFooter());

/**
 * Saves the global site footer from the Footer admin form.
 *
 * @param formData - Footer field values from the admin form
 */
export async function saveSiteFooterAction(formData: FormData) {
  const fields = readDataFromFormData(formData);
  const existing = await db.globalSettings.findUnique({
    where: { key: "footer" },
  });
  const previous =
    existing?.value && typeof existing.value === "object"
      ? (existing.value as unknown as GlobalFooter)
      : null;

  const footer = footerFieldsToGlobalFooter(fields, previous);

  await db.globalSettings.upsert({
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
  const row = await db.globalSettings.findUnique({
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
