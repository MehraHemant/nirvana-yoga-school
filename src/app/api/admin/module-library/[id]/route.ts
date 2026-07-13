import type { UpdateModuleLibraryItemInput } from "@/content/types";
import {
  jsonBadRequest,
  jsonMutationOk,
  jsonNotFound,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import {
  deleteModuleLibraryItem,
  getModuleLibraryItem,
  updateModuleLibraryItem,
} from "@/lib/cms/module-library";
import type { ApiRouteParams } from "@/lib/types/api";

/**
 * Load a single module library item.
 */
export async function GET(
  request: Request,
  context: ApiRouteParams<{ id: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const { id } = await context.params;
  const item = await getModuleLibraryItem(id);
  if (!item) {
    return jsonNotFound();
  }

  return jsonOk({ item });
}

/**
 * Update a module library item.
 */
export async function PUT(
  request: Request,
  context: ApiRouteParams<{ id: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const { id } = await context.params;
  const body = (await request.json()) as UpdateModuleLibraryItemInput;

  try {
    const item = await updateModuleLibraryItem(id, body);
    return jsonOk({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    if (message === "Library item not found") {
      return jsonNotFound(message);
    }
    return jsonBadRequest(message);
  }
}

/**
 * Delete a module library item.
 */
export async function DELETE(
  request: Request,
  context: ApiRouteParams<{ id: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const { id } = await context.params;

  try {
    await deleteModuleLibraryItem(id);
    return jsonMutationOk();
  } catch {
    return jsonNotFound();
  }
}
