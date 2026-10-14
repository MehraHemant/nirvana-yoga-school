import { jsonOk, jsonUnauthorized } from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { fetchTeacherPickerOptions } from "@/lib/cms/cache";

/**
 * Fetches the minimal faculty dataset required by admin teacher pickers.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const faculty = await fetchTeacherPickerOptions();

  return jsonOk(
    { faculty },
    {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    },
  );
}
