import { revalidatePath } from "next/cache";
import { createEmptyBookingAddons, createEmptyExamCertification, createEmptyWhyNirvana } from "@/lib/cms/structural-defaults";
import { jsonError, jsonForbidden, jsonOk } from "@/lib/cms/api-response";
import { getServerSession } from "@/lib/cms/auth";
import { invalidateGlobalSettingsCache } from "@/lib/cms/cache";
import { db } from "@/lib/db";
import type { ApiRouteParams } from "@/lib/types/api";

const ALLOWED_KEYS = [
  "header",
  "footer",
  "siteConfig",
  "residentialLife",
  "whyNirvana",
  "examCertification",
  "siteMap",
  "instagram",
  "travel",
  "reviews",
  "homeFaqs",
  "venueFaqs",
  "retreatAccommodation",
  "yttHub",
  "bookingAddons",
] as const;

/**
 * Ensures a default shared document exists so Shared sections admin can open it.
 *
 * @param key - Shared setting key
 * @param value - Default value to persist
 * @returns Persisted shared settings value
 */
async function ensureSharedSettings(key: string, value: object) {
  const existing = await db.globalSettings.findUnique({
    where: { key },
  });
  if (existing) return existing.value;
  await db.globalSettings.create({
    data: { key, value },
  });
  invalidateGlobalSettingsCache(key);
  return value;
}

export async function GET(
  _request: Request,
  context: ApiRouteParams<{ key: string }>,
) {
  const { key } = await context.params;
  if (!ALLOWED_KEYS.includes(key as (typeof ALLOWED_KEYS)[number])) {
    return jsonError("Invalid settings key", 400, { code: "BAD_REQUEST" });
  }

  if (key === "whyNirvana") {
    const value = await ensureSharedSettings(key, createEmptyWhyNirvana());
    return jsonOk({ settings: value });
  }

  if (key === "examCertification") {
    const value = await ensureSharedSettings(key, createEmptyExamCertification());
    return jsonOk({ settings: value });
  }

  if (key === "bookingAddons") {
    const value = await ensureSharedSettings(key, createEmptyBookingAddons());
    return jsonOk({ settings: value });
  }

  const record = await db.globalSettings.findUnique({ where: { key } });
  if (!record)
    return jsonError("Settings not found", 404, { code: "NOT_FOUND" });

  return jsonOk({ settings: record.value });
}

export async function PUT(
  request: Request,
  context: ApiRouteParams<{ key: string }>,
) {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  const { key } = await context.params;
  if (!ALLOWED_KEYS.includes(key as (typeof ALLOWED_KEYS)[number])) {
    return jsonError("Invalid settings key", 400, { code: "BAD_REQUEST" });
  }

  const { value } = await request.json();

  await db.globalSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  invalidateGlobalSettingsCache(key);
  revalidatePath("/");
  revalidatePath(`/api/content/${key}`);

  return jsonOk({ success: true });
}
