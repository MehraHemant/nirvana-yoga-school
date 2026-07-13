import { jsonOk, jsonUnauthorized } from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { listLeadSubmissions } from "@/lib/cms/leads";
import { isDbEnabled } from "@/lib/db";

/**
 * List contact queries and programme enquiries for the admin CMS.
 */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  if (!isDbEnabled()) {
    return jsonOk({ leads: [], dbEnabled: false });
  }

  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get("type");
  const statusParam = searchParams.get("status");
  const readStateParam = searchParams.get("readState");
  const deleted = searchParams.get("deleted") === "true";

  const type =
    typeParam === "enquiry" || typeParam === "contact" ? typeParam : undefined;
  const status =
    statusParam === "new" ||
    statusParam === "read" ||
    statusParam === "replied" ||
    statusParam === "archived"
      ? statusParam
      : undefined;
  const readState =
    readStateParam === "unread" || readStateParam === "read"
      ? readStateParam
      : undefined;

  const leads = await listLeadSubmissions({ type, status, readState, deleted });
  return jsonOk({ leads, dbEnabled: true });
}
