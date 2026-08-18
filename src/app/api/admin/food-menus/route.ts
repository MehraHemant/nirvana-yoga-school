import { revalidatePath } from "next/cache";
import { getFoodMenu, upsertFoodMenu } from "@/content/repositories/lodging";
import type { RoomCatalog } from "@/content/types/shared-sections";
import {
  jsonBadRequest,
  jsonError,
  jsonForbidden,
  jsonOk,
} from "@/lib/cms/api-response";
import { getServerSession } from "@/lib/cms/auth";
import { invalidateGlobalSettingsCache } from "@/lib/cms/cache";

/**
 * Loads the food menu for a catalog.
 *
 * Query: `?catalog=course|retreat`
 */
export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  const catalogParam = new URL(request.url).searchParams.get("catalog");
  const catalog: RoomCatalog =
    catalogParam === "retreat" ? "retreat" : "course";

  try {
    const result = await getFoodMenu(catalog);
    return jsonOk({ menu: result.data });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to load food menu",
      500,
    );
  }
}

/**
 * Upserts a food menu (title, points, media image ids).
 */
export async function PUT(request: Request) {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  try {
    const body = await request.json();
    const catalog: RoomCatalog =
      body.catalog === "retreat" ? "retreat" : "course";
    const menu = await upsertFoodMenu({
      catalog,
      title: String(body.title ?? ""),
      description: String(body.description ?? ""),
      dietaryNote: String(body.dietaryNote ?? ""),
      live: body.live !== false,
      points: Array.isArray(body.points)
        ? body.points.map((p: unknown) => String(p ?? ""))
        : [],
      mediaImageIds: Array.isArray(body.mediaImageIds)
        ? body.mediaImageIds
            .map((id: unknown) => String(id ?? ""))
            .filter(Boolean)
        : [],
    });

    // Invalidate the global settings fallback cache for the same catalog
    const settingsKey = catalog === "retreat" ? "retreatFood" : "courseFood";
    invalidateGlobalSettingsCache(settingsKey);
    revalidatePath("/");
    revalidatePath("/course", "layout");
    revalidatePath("/online-course", "layout");
    revalidatePath("/retreat", "layout");

    return jsonOk({ menu });
  } catch (error) {
    if (error instanceof Error && error.message.includes("required")) {
      return jsonBadRequest(error.message);
    }
    return jsonError(
      error instanceof Error ? error.message : "Failed to save food menu",
      500,
    );
  }
}
