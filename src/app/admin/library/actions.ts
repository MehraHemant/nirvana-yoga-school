"use server";

import { revalidatePath } from "next/cache";
import { getServerSession, requireAdmin } from "@/lib/cms/auth";
import {
  clonePayload,
  createModuleLibraryItem,
  deleteModuleLibraryItem,
  getModuleLibraryItem,
} from "@/lib/cms/module-library";

/**
 * Duplicate a module library item on the server.
 *
 * @param formData - Must include `id`
 */
export async function duplicateLibraryItemAction(formData: FormData) {
  const session = requireAdmin(await getServerSession());
  void session;

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing library item id");

  const item = await getModuleLibraryItem(id);
  if (!item) throw new Error("Library item not found");

  await createModuleLibraryItem({
    moduleKey: item.moduleKey,
    variant: item.variant,
    name: `${item.name} (copy)`,
    payload: clonePayload(item.payload),
  });

  revalidatePath("/admin/library");
}

/**
 * Delete a module library item on the server.
 *
 * @param formData - Must include `id`
 */
export async function deleteLibraryItemAction(formData: FormData) {
  const session = requireAdmin(await getServerSession());
  void session;

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing library item id");

  await deleteModuleLibraryItem(id);
  revalidatePath("/admin/library");
}
