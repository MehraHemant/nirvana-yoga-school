import { revalidatePath } from "next/cache";
import { revalidatePagesUsingFaq } from "@/lib/cms/cache";
import {
  deleteFaq,
  getFaqById,
  updateFaq,
} from "@/content/repositories/faqs";
import { normalizeFaqCategory } from "@/content/types/faq-categories";
import { jsonError, jsonForbidden, jsonOk } from "@/lib/cms/api-response";
import { getServerSession } from "@/lib/cms/auth";
import { getFaqUsage } from "@/lib/cms/faq-usage";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Loads one FAQ from the catalog (admin).
 */
export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  const { id } = await context.params;
  try {
    const faq = await getFaqById(id);
    if (!faq) {
      return jsonError("FAQ not found", 404, { code: "NOT_FOUND" });
    }
    const usage = await getFaqUsage(id);
    return jsonOk({ faq: { ...faq, usage } });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to load FAQ",
      500,
    );
  }
}

/**
 * Updates a FAQ in the shared catalog.
 */
export async function PUT(request: Request, context: RouteContext) {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  const { id } = await context.params;
  try {
    const body = await request.json();
    const faq = await updateFaq(id, {
      question: body.question !== undefined ? String(body.question) : undefined,
      answer: body.answer !== undefined ? String(body.answer) : undefined,
      category:
        body.category !== undefined
          ? normalizeFaqCategory(body.category)
          : undefined,
      adminTag:
        body.adminTag !== undefined ? String(body.adminTag) : undefined,
    });

    await revalidatePagesUsingFaq(faq.id);
    revalidatePath("/admin/sections/shared");
    return jsonOk({ faq });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "A FAQ with this question already exists."
    ) {
      return jsonError(error.message, 409, { code: "CONFLICT" });
    }
    return jsonError(
      error instanceof Error ? error.message : "Failed to update FAQ",
      500,
    );
  }
}

/**
 * Deletes a FAQ from the shared catalog.
 */
export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  const { id } = await context.params;
  try {
    await deleteFaq(id);
    await revalidatePagesUsingFaq(id);
    revalidatePath("/admin/sections/shared");
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to delete FAQ",
      500,
    );
  }
}
