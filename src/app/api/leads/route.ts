import {
  jsonBadRequest,
  jsonCreated,
  jsonInternal,
  jsonUnavailable,
} from "@/lib/cms/api-response";
import { createLeadSubmission, parseLeadInput } from "@/lib/cms/leads";
import { isDbEnabled } from "@/lib/db";

/**
 * Public endpoint to store contact and enquiry form submissions.
 * Persists the lead, then emails admin + visitor when SMTP is configured.
 */
export async function POST(request: Request) {
  if (!isDbEnabled()) {
    return jsonUnavailable("Lead storage unavailable");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonBadRequest("Invalid JSON");
  }

  const parsed = parseLeadInput(body);
  if (!parsed.ok) {
    return jsonBadRequest(parsed.error);
  }

  try {
    const id = await createLeadSubmission(parsed.data);
    return jsonCreated(id);
  } catch {
    return jsonInternal("Failed to save submission");
  }
}
