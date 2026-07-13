import { getServerSession } from "@/lib/cms/auth";
import { prisma } from "@/lib/db";
import { jsonError, jsonForbidden, jsonOk } from "@/lib/cms/api-response";
import type { ApiRouteParams } from "@/lib/types/api";

const ALLOWED_KEYS = ["header", "footer", "siteConfig"] as const;

export async function GET(
  _request: Request,
  context: ApiRouteParams<{ key: string }>,
) {
  const { key } = await context.params;
  if (!ALLOWED_KEYS.includes(key as (typeof ALLOWED_KEYS)[number])) {
    return jsonError("Invalid settings key", 400, { code: "BAD_REQUEST" });
  }

  const record = await prisma.globalSettings.findUnique({ where: { key } });
  if (!record) return jsonError("Settings not found", 404, { code: "NOT_FOUND" });

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
    update: { value: value as any },
    create: { key, value: value as any },
  });

  return jsonOk({ success: true });
}
