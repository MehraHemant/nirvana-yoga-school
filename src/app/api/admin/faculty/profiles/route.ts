import type { SitePagePerson } from "@/content/types";
import {
  jsonBadRequest,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { fetchTeacherPickerProfiles } from "@/lib/cms/cache";

/**
 * Fetches complete profiles for the compact picker options selected by an editor.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const ids = [
    ...new Set(new URL(request.url).searchParams.getAll("id")),
  ].filter(Boolean);
  if (ids.length === 0) {
    return jsonBadRequest("At least one faculty id is required.");
  }

  const people = (await fetchTeacherPickerProfiles(ids)) as SitePagePerson[];
  return jsonOk({ people });
}
