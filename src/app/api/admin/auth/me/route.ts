import { jsonOk } from "@/lib/cms/api-response";
import { getServerSession } from "@/lib/cms/auth";
import { HTTP } from "@/lib/types/api";

/**
 * Return the current admin session user.
 */
export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return jsonOk({ user: null }, { status: HTTP.UNAUTHORIZED });
  }
  return jsonOk({ user: session });
}
