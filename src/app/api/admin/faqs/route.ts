import { revalidatePath } from "next/cache";
import { revalidatePagesUsingFaq } from "@/lib/cms/cache";
import {
  createFaq,
  getFaqCatalog,
} from "@/content/repositories/faqs";
import { normalizeFaqCategory } from "@/content/types/faq-categories";
import { jsonError, jsonForbidden, jsonOk } from "@/lib/cms/api-response";
import { getServerSession } from "@/lib/cms/auth";
import { getFaqsUsage } from "@/lib/cms/faq-usage";

/**
 * Lists FAQs in the shared catalog (admin).
 */
export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  const params = new URL(request.url).searchParams;
  const category = params.get("category");
  const adminTag = params.get("adminTag") ?? undefined;

  try {
    const faqs = await getFaqCatalog({
      category:
        category && category !== "all"
          ? normalizeFaqCategory(category)
          : "all",
      adminTag,
    });
    const usageMap = await getFaqsUsage(faqs.map((faq) => faq.id));
    return jsonOk({
      faqs: faqs.map((faq) => ({
        ...faq,
        usage: usageMap.get(faq.id) ?? { inUse: false, references: [] },
      })),
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to load FAQs",
      500,
    );
  }
}

/**
 * Creates a FAQ in the shared catalog.
 */
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  try {
    const body = await request.json();
    const question = String(body.question ?? "").trim();
    const answer = String(body.answer ?? "").trim();
    if (!question && !answer) {
      return jsonError("question or answer is required", 400, {
        code: "BAD_REQUEST",
      });
    }

    const faq = await createFaq({
      question,
      answer,
      category: normalizeFaqCategory(body.category),
      adminTag: String(body.adminTag ?? ""),
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
      error instanceof Error ? error.message : "Failed to create FAQ",
      500,
    );
  }
}
