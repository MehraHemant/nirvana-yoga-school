import { jsonUnauthorized, jsonUnavailable } from "@/lib/cms/api-response";
import {
  isContentItemsSchemaReady,
  isContentTypesSchemaReady,
  isDbEnabled,
} from "@/lib/db";

/**
 * Auth for the public content delivery API (`/api/content/v1/*`).
 *
 * Delivery is internal-only. If `CONTENT_API_TOKEN` is set, requests must send
 * it as a Bearer token or `x-api-key`. When unset (local/dev), access is open.
 *
 * @param request - Incoming request
 * @returns True when the request may read delivery content
 */
export function hasDeliveryAccess(request: Request): boolean {
  const token = process.env.CONTENT_API_TOKEN?.trim();
  if (!token) return true;

  const auth = request.headers.get("authorization") ?? "";
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  const apiKey = request.headers.get("x-api-key")?.trim() ?? "";

  return bearer === token || apiKey === token;
}

/**
 * Shared guard for delivery routes: verifies auth + that the DB/content schema
 * is available. Returns an error `Response` when blocked, or `null` to proceed.
 *
 * @param request - Incoming request
 */
export function deliveryPreflight(request: Request): Response | null {
  if (!hasDeliveryAccess(request)) return jsonUnauthorized();
  if (
    !(
      isDbEnabled() &&
      isContentTypesSchemaReady() &&
      isContentItemsSchemaReady()
    )
  ) {
    return jsonUnavailable("Content delivery is not available.");
  }
  return null;
}
