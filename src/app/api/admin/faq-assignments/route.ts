import { revalidatePath } from "next/cache";
import {
  getAssignedFaqs,
  syncFaqAssignments,
} from "@/content/repositories/faqs";
import type { FaqAssignmentExtras, FaqContextType } from "@/content/types/faqs";
import { jsonError, jsonForbidden, jsonOk } from "@/lib/cms/api-response";
import { getServerSession } from "@/lib/cms/auth";

/**
 * Loads assigned FAQs for a page or global context (admin).
 */
export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  const params = new URL(request.url).searchParams;
  const contextType = params.get("contextType") === "global" ? "global" : "page";
  const contextKey = String(params.get("contextKey") ?? "").trim();
  if (!contextKey) {
    return jsonError("contextKey is required", 400, { code: "BAD_REQUEST" });
  }

  try {
    const faqs = await getAssignedFaqs(contextType, contextKey, true);
    return jsonOk({ faqs, contextType, contextKey });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to load FAQ assignments",
      500,
    );
  }
}

/**
 * Replaces FAQ assignments for a page or global context.
 */
export async function PUT(request: Request) {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  try {
    const body = await request.json();
    const contextType: FaqContextType =
      body.contextType === "global" ? "global" : "page";
    const contextKey = String(body.contextKey ?? "").trim();
    if (!contextKey) {
      return jsonError("contextKey is required", 400, { code: "BAD_REQUEST" });
    }

    const faqIds = Array.isArray(body.faqIds)
      ? body.faqIds.map((id: unknown) => String(id ?? "").trim()).filter(Boolean)
      : [];

    const extrasByFaqId =
      body.extrasByFaqId && typeof body.extrasByFaqId === "object"
        ? (body.extrasByFaqId as Record<string, FaqAssignmentExtras>)
        : undefined;

    const faqs = await syncFaqAssignments({
      contextType,
      contextKey,
      faqIds,
      extrasByFaqId,
    });

    revalidatePath("/");
    revalidatePath(`/course/${contextKey}`);
    revalidatePath(`/retreat/${contextKey}`);
    revalidatePath(`/online-course/${contextKey}`);

    return jsonOk({ faqs, contextType, contextKey });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to save FAQ assignments",
      500,
    );
  }
}
