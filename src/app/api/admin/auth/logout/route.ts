import { jsonMutationOk } from "@/lib/cms/api-response";
import { adminSessionCookieName } from "@/lib/cms/auth";

/**
 * Admin logout — clears session cookie.
 */
export async function POST() {
  const response = jsonMutationOk();
  response.headers.append(
    "Set-Cookie",
    `${adminSessionCookieName()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
  return response;
}
