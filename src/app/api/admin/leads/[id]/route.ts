import type { LeadStatus } from "@/content/types/lead";
import {
  jsonBadRequest,
  jsonMutationOk,
  jsonNotFound,
  jsonOk,
  jsonUnauthorized,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { restoreLead, softDeleteLead, updateLeadStatus } from "@/lib/cms/leads";
import { isDbEnabled } from "@/lib/db";
import type { ApiRouteParams } from "@/lib/types/api";

type LeadPatchBody = {
  status?: LeadStatus;
  restore?: boolean;
};

/**
 * Update a lead submission status (read, replied, archived).
 */
export async function PATCH(
  request: Request,
  context: ApiRouteParams<{ id: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  if (!isDbEnabled()) {
    return jsonUnavailable("Database unavailable");
  }

  const { id } = await context.params;
  const body = (await request.json()) as LeadPatchBody;

  if (body.restore === true) {
    try {
      await restoreLead(id);
      return jsonOk({ ok: true, restored: true });
    } catch {
      return jsonNotFound("Lead not found in deleted");
    }
  }

  const status = body.status;
  if (
    status !== "new" &&
    status !== "read" &&
    status !== "replied" &&
    status !== "archived"
  ) {
    return jsonBadRequest("Invalid status");
  }

  try {
    await updateLeadStatus(id, status);
    return jsonMutationOk();
  } catch {
    return jsonNotFound("Lead not found");
  }
}

/**
 * Soft-delete a lead — moves it to the Deleted section for recovery.
 */
export async function DELETE(
  request: Request,
  context: ApiRouteParams<{ id: string }>,
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonUnauthorized();
  }

  if (!isDbEnabled()) {
    return jsonUnavailable("Database unavailable");
  }

  const { id } = await context.params;

  try {
    await softDeleteLead(id);
    return jsonOk({ ok: true, deleted: true });
  } catch {
    return jsonNotFound("Lead not found");
  }
}
