import type { ContentSource } from "@/content/repositories/fetch";

/** Canonical HTTP status codes used by route handlers. */
export const HTTP = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
  UNAVAILABLE: 503,
} as const;

export type HttpStatus = (typeof HTTP)[keyof typeof HTTP];

/** Machine-readable API error codes for clients and logging. */
export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "DB_DISABLED"
  | "INTERNAL_ERROR";

/** Standard error JSON body returned by all API routes. */
export type ApiErrorBody = {
  error: string;
  code?: ApiErrorCode;
  references?: string[];
};

/** Successful mutation with optional created/updated entity id. */
export type ApiMutationResponse = {
  ok: true;
  id?: string;
};

/** Generic list wrapper — key names the collection (e.g. `pages`, `leads`). */
export type ApiListBody<TKey extends string, TItem> = Record<TKey, TItem[]>;

/** Single-entity wrapper — key names the resource (e.g. `item`, `asset`). */
export type ApiEntityBody<TKey extends string, TEntity> = Record<TKey, TEntity>;

/** Public content read API body (repository result). */
export type ContentApiBody<TData> = {
  data: TData;
  source: ContentSource;
};

/** Admin stats when database may be disabled. */
export type DbEnabledStatsBody<TStats> =
  | { dbEnabled: false; stats: null }
  | { dbEnabled: true; stats: TStats };

/** Admin list when database may be disabled. */
export type DbEnabledListBody<TKey extends string, TItem> =
  | ({ dbEnabled: false } & ApiListBody<TKey, TItem>)
  | ({ dbEnabled: true } & ApiListBody<TKey, TItem>);

/** Result of parsing/validating an incoming request body. */
export type ParseResult<TData> =
  | { ok: true; data: TData }
  | { ok: false; error: string };

/** Next.js App Router dynamic route context. */
export type ApiRouteParams<TParams extends Record<string, string>> = {
  params: Promise<TParams>;
};

/** Type guard for standard API error responses. */
export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorBody).error === "string"
  );
}

/** Thrown by {@link parseApiJson} when the API returns an error body. */
export class ApiClientError extends Error {
  code?: ApiErrorCode;
  references?: string[];

  constructor(
    message: string,
    options?: { code?: ApiErrorCode; references?: string[] },
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = options?.code;
    this.references = options?.references;
  }
}

/**
 * Parse JSON from a fetch response and throw on API error bodies.
 *
 * @param response - Fetch response from an internal API route
 * @returns Parsed JSON body
 */
export async function parseApiJson<TBody>(response: Response): Promise<TBody> {
  const body = (await response.json()) as TBody | ApiErrorBody;
  if (!response.ok && isApiErrorBody(body)) {
    throw new ApiClientError(body.error, {
      code: body.code,
      references: body.references,
    });
  }
  if (!response.ok) {
    throw new ApiClientError(`Request failed (${response.status})`);
  }
  return body as TBody;
}
