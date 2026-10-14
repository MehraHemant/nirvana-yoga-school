import { resendSignupCode } from "@/lib/auth/signup-otp";
import {
  jsonBadRequest,
  jsonError,
  jsonOk,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { isDbEnabled } from "@/lib/db";

/**
 * Sends a fresh signup code for a pending signup.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) {
    return jsonUnavailable(
      "Database not configured. Set NEON_DB_POSTGRES_URL.",
    );
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
  } | null;
  if (!body?.email) return jsonBadRequest("Email is required");

  const result = await resendSignupCode(body.email);
  if (!result.ok) return jsonError(result.error, result.status ?? 400);

  return jsonOk({ ok: true, resendIn: result.resendIn });
}
