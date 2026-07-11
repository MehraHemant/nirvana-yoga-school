import type { UpdateModuleLibraryItemInput } from "@/content/types";
import { getSessionFromRequest } from "@/lib/cms/auth";
import {
  deleteModuleLibraryItem,
  getModuleLibraryItem,
  updateModuleLibraryItem,
} from "@/lib/cms/module-library";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Load a single module library item.
 */
export async function GET(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const item = await getModuleLibraryItem(id);
  if (!item) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ item });
}

/**
 * Update a module library item.
 */
export async function PUT(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as UpdateModuleLibraryItemInput;

  try {
    const item = await updateModuleLibraryItem(id, body);
    return Response.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    const status = message === "Library item not found" ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}

/**
 * Delete a module library item.
 */
export async function DELETE(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await deleteModuleLibraryItem(id);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
