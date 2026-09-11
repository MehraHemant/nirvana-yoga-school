import {
  jsonBadRequest,
  jsonMutationOk,
  jsonUnauthorized,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import {
  changeAdminPassword,
  getSessionFromRequest,
} from "@/lib/cms/auth";
import { isDbEnabled } from "@/lib/db";

type ChangePasswordBody = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

/**
 * Change password for the authenticated admin user.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) {
    return jsonUnavailable(
      "Database not configured. Set NEON_DB_POSTGRES_URL.",
    );
  }

  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  const body = (await request.json()) as ChangePasswordBody;
  const { currentPassword, newPassword, confirmPassword } = body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return jsonBadRequest("All password fields are required");
  }

  if (newPassword !== confirmPassword) {
    return jsonBadRequest("New password and confirmation do not match");
  }

  const result = await changeAdminPassword(
    session.userId,
    currentPassword,
    newPassword,
  );

  if (!result.ok) {
    return jsonBadRequest(result.error);
  }

  return jsonMutationOk();
}
