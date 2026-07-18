import { revalidatePath } from "next/cache";
import { createDefaultWhyNirvana } from "@/content/data/why-nirvana-defaults";
import { jsonError, jsonForbidden, jsonOk } from "@/lib/cms/api-response";
import { getServerSession } from "@/lib/cms/auth";
import { invalidateGlobalSettingsCache } from "@/lib/cms/cache";
import { prisma } from "@/lib/db";
import type { ApiRouteParams } from "@/lib/types/api";

const ALLOWED_KEYS = [
  "header",
  "footer",
  "siteConfig",
  "residentialLife",
  "whyNirvana",
  "siteMap",
  "instagram",
  "travel",
  "reviews",
  "homeFaqs",
  "venueFaqs",
  "retreatAccommodation",
  "yttHub",
] as const;

/**
 * Ensures Why Nirvana exists so Shared sections admin can open the panel.
 *
 * @returns Persisted whyNirvana value
 */
async function ensureWhyNirvanaSettings() {
  const existing = await prisma.globalSettings.findUnique({
    where: { key: "whyNirvana" },
  });
  if (existing) return existing.value;
  const value = createDefaultWhyNirvana();
  await prisma.globalSettings.create({
    data: { key: "whyNirvana", value },
  });
  invalidateGlobalSettingsCache("whyNirvana");
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
    const value = await ensureWhyNirvanaSettings();
    return jsonOk({ settings: value });
  }

  const record = await prisma.globalSettings.findUnique({ where: { key } });
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

  await prisma.globalSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  invalidateGlobalSettingsCache(key);
  revalidatePath("/");
  revalidatePath(`/api/content/${key}`);

  return jsonOk({ success: true });
}
