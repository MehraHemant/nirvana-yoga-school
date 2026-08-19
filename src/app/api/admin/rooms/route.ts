import { revalidatePath } from "next/cache";
import { createRoom, getRooms } from "@/content/repositories/rooms";
import type { RoomCatalog } from "@/content/types/shared-sections";
import { jsonError, jsonForbidden, jsonOk } from "@/lib/cms/api-response";
import { getServerSession } from "@/lib/cms/auth";

/**
 * Lists shared rooms for a catalog (admin).
 */
export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  const catalogParam = new URL(request.url).searchParams.get("catalog");
  const catalog: RoomCatalog =
    catalogParam === "retreat" ? "retreat" : "course";

  try {
    const result = await getRooms(catalog);
    return jsonOk({ rooms: result.data });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to load rooms",
      500,
    );
  }
}

/**
 * Creates a shared room in the course or retreat catalog.
 */
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  try {
    const body = await request.json();
    const catalog: RoomCatalog =
      body.catalog === "retreat" ? "retreat" : "course";
    const slug = String(body.slug ?? "").trim();
    const name = String(body.name ?? "").trim();
    if (!slug || !name) {
      return jsonError("slug and name are required", 400, {
        code: "BAD_REQUEST",
      });
    }

    const room = await createRoom({
      catalog,
      slug,
      name,
      title: String(body.title ?? ""),
      eyebrow: String(body.eyebrow ?? ""),
      description: String(body.description ?? ""),
      features: Array.isArray(body.features)
        ? body.features
            .map((item: unknown) => String(item ?? "").trim())
            .filter(Boolean)
        : [],
      images: Array.isArray(body.images) ? body.images : [],
      videos: Array.isArray(body.videos) ? body.videos : [],
      sort: typeof body.sort === "number" ? body.sort : 0,
      live: body.live !== false,
    });

    revalidatePath("/");
    revalidatePath("/admin/sections/shared");
    return jsonOk({ room });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to create room",
      500,
    );
  }
}
