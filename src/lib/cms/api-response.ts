import type { ApiErrorBody, ApiErrorCode } from "@/lib/types/api";
import { HTTP } from "@/lib/types/api";

const CACHE_HEADER = "public, s-maxage=3600, stale-while-revalidate=86400";

/**
 * JSON response with public CDN-friendly cache headers.
 *
 * @param data - Serializable response body
 * @param init - Optional status/init
 */
export function jsonCached<TBody extends Record<string, unknown>>(
  data: TBody,
  init?: ResponseInit,
): Response {
  return Response.json(data, {
    ...init,
    headers: {
      "Cache-Control": CACHE_HEADER,
      ...(init?.headers ?? {}),
    },
  });
}

/**
 * Standard JSON error response.
 *
 * @param error - Human-readable message
 * @param status - HTTP status code
 * @param extra - Optional error code and references
 */
export function jsonError(
  error: string,
  status: number,
  extra?: Omit<ApiErrorBody, "error">,
): Response {
  const body: ApiErrorBody = { error, ...extra };
  return Response.json(body, { status });
}

/**
 * 401 Unauthorized response.
 *
 * @param message - Optional override message
 */
export function jsonUnauthorized(message = "Unauthorized"): Response {
  return jsonError(message, HTTP.UNAUTHORIZED, { code: "UNAUTHORIZED" });
}

/**
 * 403 Forbidden response.
 *
 * @param message - Optional override message
 */
export function jsonForbidden(message = "Forbidden"): Response {
  return jsonError(message, HTTP.FORBIDDEN, { code: "FORBIDDEN" });
}

/**
 * 404 Not Found response.
 *
 * @param message - Optional override message
 */
export function jsonNotFound(message = "Not found"): Response {
  return jsonError(message, HTTP.NOT_FOUND, { code: "NOT_FOUND" });
}

/**
 * 400 Bad Request response.
 *
 * @param message - Validation or client error message
 * @param code - Optional machine-readable code
 */
export function jsonBadRequest(
  message: string,
  code: ApiErrorCode = "BAD_REQUEST",
): Response {
  return jsonError(message, HTTP.BAD_REQUEST, { code });
}

/**
 * 409 Conflict response (e.g. delete blocked by references).
 *
 * @param message - Conflict explanation
 * @param references - Optional human-readable reference list
 */
export function jsonConflict(message: string, references?: string[]): Response {
  return jsonError(message, HTTP.CONFLICT, {
    code: "CONFLICT",
    references,
  });
}

/**
 * 503 Service Unavailable (database or dependency offline).
 *
 * @param message - Unavailability reason
 */
export function jsonUnavailable(message: string): Response {
  return jsonError(message, HTTP.UNAVAILABLE, { code: "DB_DISABLED" });
}

/**
 * 500 Internal Server Error response.
 *
 * @param message - Safe error message for clients
 */
export function jsonInternal(message = "Internal server error"): Response {
  return jsonError(message, HTTP.INTERNAL, { code: "INTERNAL_ERROR" });
}

/**
 * Typed JSON success response.
 *
 * @param body - Response payload
 * @param init - Optional status/init
 */
export function jsonOk<TBody extends Record<string, unknown>>(
  body: TBody,
  init?: ResponseInit,
): Response {
  return Response.json(body, init);
}

/**
 * 201 Created mutation response with optional entity id.
 *
 * @param id - Created resource id
 */
export function jsonCreated(id?: string): Response {
  return Response.json(
    id
      ? ({ ok: true as const, id } satisfies { ok: true; id: string })
      : { ok: true as const },
    { status: HTTP.CREATED },
  );
}

/**
 * Successful mutation response (`{ ok: true, id? }`).
 *
 * @param id - Optional updated/created entity id
 */
export function jsonMutationOk(id?: string): Response {
  return Response.json(
    id
      ? ({ ok: true as const, id } satisfies { ok: true; id: string })
      : { ok: true as const },
  );
}

export { HTTP };
