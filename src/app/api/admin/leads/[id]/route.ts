import type { LeadStatus } from "@/content/types/lead";
import { getSessionFromRequest } from "@/lib/cms/auth";
import { restoreLead, softDeleteLead, updateLeadStatus } from "@/lib/cms/leads";
import { isDbEnabled } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

type LeadPatchBody = {
  status?: LeadStatus;
  restore?: boolean;
};

/**
 * Update a lead submission status (read, replied, archived).
 */
export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDbEnabled()) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as LeadPatchBody;

  if (body.restore === true) {
    try {
      await restoreLead(id);
      return Response.json({ ok: true, restored: true });
    } catch {
      return Response.json(
        { error: "Lead not found in deleted" },
        { status: 404 },
      );
    }
  }

  const status = body.status;
  if (
    status !== "new" &&
    status !== "read" &&
    status !== "replied" &&
    status !== "archived"
  ) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    await updateLeadStatus(id, status);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Lead not found" }, { status: 404 });
  }
}

/**
 * Soft-delete a lead — moves it to the Deleted section for recovery.
 */
export async function DELETE(request: Request, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDbEnabled()) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await context.params;

  try {
    await softDeleteLead(id);
    return Response.json({ ok: true, deleted: true });
  } catch {
    return Response.json({ error: "Lead not found" }, { status: 404 });
  }
}
