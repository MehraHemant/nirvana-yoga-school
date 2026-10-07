import { jsonError, jsonForbidden, jsonOk } from "@/lib/cms/api-response";
import { getServerSession } from "@/lib/cms/auth";
import { listAllQuizAttempts } from "@/lib/quiz/attempts";

/**
 * Recent quiz attempts across all accounts (admin).
 */
export async function GET() {
  const session = await getServerSession();
  if (!session) return jsonForbidden();

  try {
    return jsonOk({ attempts: await listAllQuizAttempts() });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to load attempts",
      500,
    );
  }
}
