import { revalidatePath } from "next/cache";
import { upsertPageSeo, YTT_HUB_SLUG } from "@/content/repositories/page-seo";
import type { PageSeoMeta } from "@/content/types/page-seo";
import type { ExamCertificationContent } from "@/content/types/shared-sections";
import { jsonError, jsonForbidden, jsonOk } from "@/lib/cms/api-response";
import { getServerSession } from "@/lib/cms/auth";
import { invalidateGlobalSettingsCache } from "@/lib/cms/cache";
import { hasExamCertificationContent } from "@/lib/cms/section-visibility";
import {
  createDefaultCourseFood,
  createDefaultExamCertification,
  createDefaultRetreatFood,
  createEmptyBookingAddons,
  createEmptyWhyNirvana,
  createExamCertificationAdminScaffold,
  normalizeExamCertification,
} from "@/lib/cms/structural-defaults";
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
  "courseFood",
  "retreatFood",
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

/**
 * Loads exam certification, healing empty scaffolds to the site default.
 *
 * @returns Normalized exam document
 */
async function loadExamCertificationSettings(): Promise<ExamCertificationContent> {
  const defaults = createDefaultExamCertification();
  const value = await ensureSharedSettings("examCertification", defaults);
  const normalized = normalizeExamCertification(
    value && typeof value === "object"
      ? (value as Partial<ExamCertificationContent>)
      : null,
  );

  if (hasExamCertificationContent(normalized)) {
    return normalized;
  }

  const healed = {
    ...defaults,
    live: normalized.live !== false,
  };
  await db.globalSettings.upsert({
    where: { key: "examCertification" },
    update: { value: healed },
    create: { key: "examCertification", value: healed },
  });
  invalidateGlobalSettingsCache("examCertification");
  return healed;
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
    const settings = await loadExamCertificationSettings();
    return jsonOk({ settings });
  }

  if (key === "bookingAddons") {
    const value = await ensureSharedSettings(key, createEmptyBookingAddons());
    return jsonOk({ settings: value });
  }

  if (key === "courseFood") {
    const value = await ensureSharedSettings(key, createDefaultCourseFood());
    return jsonOk({ settings: value });
  }

  if (key === "retreatFood") {
    const value = await ensureSharedSettings(key, createDefaultRetreatFood());
    return jsonOk({ settings: value });
  }

  if (key === "residentialLife" || key === "retreatAccommodation") {
    const value = await ensureSharedSettings(key, {
      live: true,
      stay: { title: "", description: "" },
      facilities: [],
    });
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

  const body = await request.json();
  let value = body.value;

  if (key === "examCertification") {
    value = normalizeExamCertification(
      value && typeof value === "object"
        ? (value as Partial<ExamCertificationContent>)
        : createExamCertificationAdminScaffold(),
    );
  }

  await db.globalSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  if (key === "yttHub" && value && typeof value === "object") {
    const meta = (value as { meta?: unknown }).meta;
    if (meta && typeof meta === "object") {
      await upsertPageSeo(YTT_HUB_SLUG, meta as PageSeoMeta).catch((error) => {
        console.error("[settings PUT] YTT hub SEO sync failed", error);
      });
    }
  }

  invalidateGlobalSettingsCache(key);
  revalidatePath("/");
  revalidatePath(`/api/content/${key}`);
  if (key === "examCertification") {
    revalidatePath("/api/content/exam-certification");
    revalidatePath("/course", "layout");
    revalidatePath("/online-course", "layout");
    revalidatePath("/retreat", "layout");
  }
  if (
    key === "courseFood" ||
    key === "retreatFood" ||
    key === "residentialLife" ||
    key === "retreatAccommodation"
  ) {
    revalidatePath("/course", "layout");
    revalidatePath("/online-course", "layout");
    revalidatePath("/retreat", "layout");
  }

  return jsonOk({ success: true });
}
