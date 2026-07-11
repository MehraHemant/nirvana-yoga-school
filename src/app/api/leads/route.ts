import { createLeadSubmission, parseLeadInput } from "@/lib/cms/leads";
import { isDbEnabled } from "@/lib/db";

/**
 * Public endpoint to store contact and enquiry form submissions.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) {
    return Response.json(
      { error: "Lead storage unavailable" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseLeadInput(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const id = await createLeadSubmission(parsed.data);
    return Response.json({ ok: true, id }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Failed to save submission" },
      { status: 500 },
    );
  }
}
