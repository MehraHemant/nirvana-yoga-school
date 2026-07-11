import type { CreateModuleLibraryItemInput } from "@/content/types";
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
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const moduleKey = url.searchParams.get("moduleKey");
  const variant = url.searchParams.get("variant") ?? undefined;

  if (!moduleKey || !isModuleLibraryKey(moduleKey)) {
    return Response.json(
      { error: "moduleKey query parameter is required" },
      { status: 400 },
    );
  }

  const items = await listModuleLibraryItems({ moduleKey, variant });
  return Response.json({
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
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateModuleLibraryItemInput;

  if (!body.moduleKey || !isModuleLibraryKey(body.moduleKey)) {
    return Response.json({ error: "Invalid moduleKey" }, { status: 400 });
  }
  if (!body.name?.trim()) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }
  if (!body.payload) {
    return Response.json({ error: "Payload is required" }, { status: 400 });
  }

  try {
    const item = await createModuleLibraryItem(body);
    return Response.json({ item });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid payload" },
      { status: 400 },
    );
  }
}
