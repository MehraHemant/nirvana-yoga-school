import { revalidatePath } from "next/cache";
import { deleteRoom, updateRoom } from "@/content/repositories/rooms";
import { jsonError, jsonForbidden, jsonOk } from "@/lib/cms/api-response";
import { getServerSession } from "@/lib/cms/auth";
import type { ApiRouteParams } from "@/lib/types/api";

/**
 * Updates a shared room by id.
 */
export async function PUT(
  request: Request,
  context: ApiRouteParams<{ id: string }>,
) {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  const { id } = await context.params;
  if (!id) return jsonError("Missing id", 400, { code: "BAD_REQUEST" });

  try {
    const body = await request.json();
    const room = await updateRoom(id, {
      catalog:
        body.catalog === "retreat"
          ? "retreat"
          : body.catalog === "course"
            ? "course"
            : undefined,
      slug: body.slug !== undefined ? String(body.slug) : undefined,
      name: body.name !== undefined ? String(body.name) : undefined,
      description:
        body.description !== undefined ? String(body.description) : undefined,
      features: Array.isArray(body.features)
        ? body.features
            .map((item: unknown) => String(item ?? "").trim())
            .filter(Boolean)
        : undefined,
      images: Array.isArray(body.images) ? body.images : undefined,
      videos: Array.isArray(body.videos) ? body.videos : undefined,
      sort: typeof body.sort === "number" ? body.sort : undefined,
      live: typeof body.live === "boolean" ? body.live : undefined,
    });
    revalidatePath("/");
    revalidatePath("/admin/sections/shared");
    return jsonOk({ room });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to update room",
      500,
    );
  }
}

/**
 * Deletes a shared room by id.
 */
export async function DELETE(
  _request: Request,
  context: ApiRouteParams<{ id: string }>,
) {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  const { id } = await context.params;
  if (!id) return jsonError("Missing id", 400, { code: "BAD_REQUEST" });

  try {
    await deleteRoom(id);
    revalidatePath("/");
    revalidatePath("/admin/sections/shared");
    return jsonOk({ success: true });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to delete room",
      500,
    );
  }
}
