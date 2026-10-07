import { startSignup } from "@/lib/auth/signup-otp";
import {
  jsonBadRequest,
  jsonError,
  jsonOk,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { isDbEnabled } from "@/lib/db";

/**
 * Public signup step one — stores the details as pending and emails a code.
 * The account is created by `/api/auth/signup/verify`.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) {
    return jsonUnavailable(
      "Database not configured. Set NEON_DB_POSTGRES_URL.",
    );
  }

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    password?: string;
  } | null;

  if (!body?.name || !body.email || !body.password) {
    return jsonBadRequest("Name, email, and password are required");
  }

  const result = await startSignup({
    name: body.name,
    email: body.email,
    password: body.password,
  });
  if (!result.ok) return jsonError(result.error, result.status ?? 400);

  return jsonOk({
    otpRequired: true,
    email: result.email,
    resendIn: result.resendIn,
  });
}
