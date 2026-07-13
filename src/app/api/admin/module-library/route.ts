import type { CreateModuleLibraryItemInput } from "@/content/types";
import {
  jsonBadRequest,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import {
  createModuleLibraryItem,
  getModuleLibraryPreview,
  isModuleLibraryKey,
  listModuleLibraryItems,
} from "@/lib/cms/module-library";

/**
 * List module library items filtered by moduleKey and optional variant.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const url = new URL(request.url);
  const moduleKey = url.searchParams.get("moduleKey");
  const variant = url.searchParams.get("variant") ?? undefined;

  if (!moduleKey || !isModuleLibraryKey(moduleKey)) {
    return jsonBadRequest("moduleKey query parameter is required");
  }

  const items = await listModuleLibraryItems({ moduleKey, variant });
  return jsonOk({
    items: items.map((item) => ({
      ...item,
      preview: getModuleLibraryPreview(item),
    })),
  });
}

/**
 * Create a new module library item.
 */
export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const body = (await request.json()) as CreateModuleLibraryItemInput;

  if (!body.moduleKey || !isModuleLibraryKey(body.moduleKey)) {
    return jsonBadRequest("Invalid moduleKey");
  }
  if (!body.name?.trim()) {
    return jsonBadRequest("Name is required");
  }
  if (!body.payload) {
    return jsonBadRequest("Payload is required");
  }

  try {
    const item = await createModuleLibraryItem(body);
    return jsonOk({ item });
  } catch (error) {
    return jsonBadRequest(
      error instanceof Error ? error.message : "Invalid payload",
    );
  }
}
