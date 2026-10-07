import { siteSessionSetCookie } from "@/lib/auth/site-session";
import { jsonOk } from "@/lib/cms/api-response";

/**
 * Public logout — clears the site session cookie.
 */
export async function POST() {
  const response = jsonOk({ ok: true });
  response.headers.append("Set-Cookie", siteSessionSetCookie(null));
  return response;
}
