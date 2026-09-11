import type { BlogPostDocument } from "@/content/types/blog-post";
import type { LeadStatus } from "@/content/types/lead";
import type {
  AdminBlogCreateResponse,
  AdminBlogPostGetResponse,
  AdminBookingsListResponse,
  AdminChangePasswordInput,
  AdminChangePasswordResponse,
  AdminLeadsListResponse,
  AdminLoginInput,
  AdminLoginResponse,
  AdminMeResponse,
  AdminMediaItemResponse,
  AdminMediaListResponse,
  AdminMediaUploadResponse,
  AdminPageEditorDocument,
} from "@/lib/types/admin-api";
import type { ApiMutationResponse } from "@/lib/types/api";
import { parseApiJson } from "@/lib/types/api";

/** Keys editable via `/api/admin/settings/[key]`. */
export type AdminGlobalSettingsKey =
  | "header"
  | "footer"
  | "siteConfig"
  | "residentialLife"
  | "whyNirvana"
  | "siteMap"
  | "instagram"
  | "travel"
  | "reviews"
  | "homeFaqs"
  | "venueFaqs"
  | "retreatAccommodation"
  | "courseFood"
  | "retreatFood"
  | "yttHub";

/**
 * Typed JSON fetch for admin API routes.
 *
 * @param input - Request URL or Request object
 * @param init - Optional fetch init
 */
async function adminFetch<TBody>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<TBody> {
  const response = await fetch(input, init);
  return parseApiJson<TBody>(response);
}

/**
 * Load every document needed by one guided page editor.
 *
 * @param slug - Page slug
 */
export async function fetchAdminPageEditor(
  slug: string,
): Promise<AdminPageEditorDocument> {
  return adminFetch<AdminPageEditorDocument>(
    `/api/admin/pages/${encodeURIComponent(slug)}`,
  );
}

/**
 * Save the document pieces owned by one guided page editor.
 *
 * @param slug - Page slug
 * @param document - Changed page document pieces
 */
export async function saveAdminPageEditor(
  slug: string,
  document: Pick<AdminPageEditorDocument, "modules" | "content" | "product">,
): Promise<ApiMutationResponse> {
  return adminFetch<ApiMutationResponse>(
    `/api/admin/pages/${encodeURIComponent(slug)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(document),
    },
  );
}

/**
 * Sign in to the admin portal.
 *
 * @param credentials - Email and password
 */
export async function loginAdmin(
  credentials: AdminLoginInput,
): Promise<AdminLoginResponse> {
  return adminFetch<AdminLoginResponse>("/api/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}

/**
 * End the admin session.
 */
export async function logoutAdmin(): Promise<ApiMutationResponse> {
  return adminFetch<ApiMutationResponse>("/api/admin/auth/logout", {
    method: "POST",
  });
}

/**
 * Load the current admin session user.
 */
export async function fetchAdminMe(): Promise<AdminMeResponse> {
  return adminFetch<AdminMeResponse>("/api/admin/auth/me");
}

/**
 * Change the signed-in admin user's password.
 *
 * @param input - Current, new, and confirm passwords
 */
export async function changeAdminPassword(
  input: AdminChangePasswordInput,
): Promise<AdminChangePasswordResponse> {
  return adminFetch<AdminChangePasswordResponse>(
    "/api/admin/auth/change-password",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}

/**
 * Create a blog post with full editor document fields.
 *
 * @param post - Blog document (title required)
 */
export async function createAdminBlogPost(
  post: BlogPostDocument,
): Promise<AdminBlogCreateResponse> {
  return adminFetch<AdminBlogCreateResponse>("/api/admin/blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });
}

/**
 * Load a blog post for editing.
 *
 * @param slug - Blog post slug
 */
export async function fetchAdminBlogPost(
  slug: string,
): Promise<AdminBlogPostGetResponse> {
  return adminFetch<AdminBlogPostGetResponse>(
    `/api/admin/blog/${encodeURIComponent(slug)}`,
  );
}

/**
 * Save a blog post from the editor.
 *
 * @param slug - Blog post slug
 * @param post - Blog document
 */
export async function saveAdminBlogPost(
  slug: string,
  post: BlogPostDocument,
): Promise<ApiMutationResponse> {
  return adminFetch<ApiMutationResponse>(
    `/api/admin/blog/${encodeURIComponent(slug)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    },
  );
}

/**
 * Permanently delete a blog post.
 *
 * @param slug - Blog post slug
 */
export async function deleteAdminBlogPost(
  slug: string,
): Promise<ApiMutationResponse> {
  return adminFetch<ApiMutationResponse>(
    `/api/admin/blog/${encodeURIComponent(slug)}`,
    { method: "DELETE" },
  );
}

/**
 * List lead submissions for the admin inbox.
 *
 * @param params - Filter query params
 */
export async function fetchAdminLeads(
  params: URLSearchParams,
): Promise<AdminLeadsListResponse> {
  return adminFetch<AdminLeadsListResponse>(`/api/admin/leads?${params}`);
}

/**
 * Update lead status or restore from deleted.
 *
 * @param id - Lead id
 * @param body - Status or restore flag
 */
export async function patchAdminLead(
  id: string,
  body: { status?: LeadStatus; restore?: boolean },
): Promise<ApiMutationResponse & { restored?: boolean }> {
  return adminFetch<ApiMutationResponse & { restored?: boolean }>(
    `/api/admin/leads/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

/**
 * Soft-delete a lead submission.
 *
 * @param id - Lead id
 */
export async function deleteAdminLead(
  id: string,
): Promise<ApiMutationResponse> {
  return adminFetch<ApiMutationResponse>(`/api/admin/leads/${id}`, {
    method: "DELETE",
  });
}

/**
 * List bookings for the admin portal.
 *
 * @param deleted - When true, list soft-deleted bookings
 */
export async function fetchAdminBookings(
  deleted = false,
): Promise<AdminBookingsListResponse> {
  const params = deleted ? "?deleted=true" : "";
  return adminFetch<AdminBookingsListResponse>(`/api/admin/bookings${params}`);
}

/**
 * Soft-delete or restore a booking.
 *
 * @param id - Booking id
 * @param restore - When true, restore from deleted
 */
export async function patchAdminBooking(
  id: string,
  restore = false,
): Promise<ApiMutationResponse> {
  return adminFetch<ApiMutationResponse>(`/api/admin/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ restore }),
  });
}

/**
 * Soft-delete a booking.
 *
 * @param id - Booking id
 */
export async function deleteAdminBooking(
  id: string,
): Promise<ApiMutationResponse> {
  return adminFetch<ApiMutationResponse>(`/api/admin/bookings/${id}`, {
    method: "DELETE",
  });
}

/**
 * List media assets for the admin library.
 *
 * @param tagOrOptions - Tag string (legacy) or pagination options
 */
export async function fetchAdminMedia(
  tagOrOptions?:
    | string
    | {
        tag?: string;
        page?: number;
        limit?: number;
        includeUsage?: boolean;
        kind?: "image" | "video";
      },
): Promise<AdminMediaListResponse> {
  const options =
    typeof tagOrOptions === "string"
      ? { tag: tagOrOptions }
      : (tagOrOptions ?? {});
  const params = new URLSearchParams();
  if (options.tag) params.set("tag", options.tag);
  if (options.page != null) params.set("page", String(options.page));
  if (options.limit != null) params.set("limit", String(options.limit));
  if (options.includeUsage) params.set("includeUsage", "1");
  if (options.kind) params.set("kind", options.kind);
  const query = params.toString();
  return adminFetch<AdminMediaListResponse>(
    `/api/admin/media${query ? `?${query}` : ""}`,
  );
}

/**
 * Load one media asset with fresh usage info (edit panel / delete guard).
 *
 * @param id - Media asset id
 */
export async function fetchAdminMediaAsset(
  id: string,
): Promise<AdminMediaItemResponse> {
  return adminFetch<AdminMediaItemResponse>(`/api/admin/media/${id}`);
}

/** Lodging `media_images` row for room/food pickers. */
export type AdminLodgingMediaImage = {
  id: string;
  url: string;
  thumbUrl?: string;
  tag: string;
  title: string;
  alt: string;
  sort: number;
};

export type AdminLodgingMediaListResponse = {
  images: AdminLodgingMediaImage[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  synced?: number;
};

/**
 * List lodging media_images for room/food gallery pickers.
 *
 * @param tagOrOptions - Tag string (legacy) or pagination options
 */
export async function fetchLodgingMediaImages(
  tagOrOptions?:
    | string
    | {
        tag?: string;
        page?: number;
        limit?: number;
      },
): Promise<AdminLodgingMediaListResponse> {
  const options =
    typeof tagOrOptions === "string"
      ? { tag: tagOrOptions }
      : (tagOrOptions ?? {});
  const params = new URLSearchParams({ kind: "images" });
  if (options.tag) params.set("tag", options.tag);
  if (options.page != null) params.set("page", String(options.page));
  if (options.limit != null) params.set("limit", String(options.limit));
  return adminFetch<AdminLodgingMediaListResponse>(
    `/api/admin/lodging?${params.toString()}`,
  );
}

/**
 * Update media metadata.
 *
 * @param id - Media asset id
 * @param body - Metadata patch
 */
export async function updateAdminMedia(
  id: string,
  body: {
    caption?: string | null;
    description?: string | null;
    alt?: string | null;
    tags?: string[];
  },
): Promise<AdminMediaItemResponse> {
  return adminFetch<AdminMediaItemResponse>(`/api/admin/media/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Delete a media asset when unused.
 *
 * @param id - Media asset id
 */
export async function deleteAdminMedia(
  id: string,
): Promise<ApiMutationResponse> {
  return adminFetch<ApiMutationResponse>(`/api/admin/media/${id}`, {
    method: "DELETE",
  });
}

/**
 * Upload a new media asset.
 *
 * @param form - Multipart form with file and metadata
 */
export async function uploadAdminMedia(
  form: FormData,
): Promise<AdminMediaUploadResponse> {
  return adminFetch<AdminMediaUploadResponse>("/api/admin/media/upload", {
    method: "POST",
    body: form,
  });
}

/** Response from POST /api/admin/chat/index. */
export type AdminChatIndexSyncResponse = {
  success: boolean;
  upserted: number;
  deleted: number;
  skipped: number;
  total: number;
  durationMs: number;
  mode: "incremental" | "full";
  collection: string;
};

/** Chat knowledge PDF row for admin UI. */
export type AdminChatKnowledgePdf = {
  id: string;
  title: string;
  filename: string;
  storageUrl: string;
  cdnKey: string | null;
  mime: string;
  sizeBytes: number;
  contentHash: string | null;
  status: "pending" | "indexed" | "error";
  chunkCount: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Response from GET /api/admin/chat/pdfs. */
export type AdminChatPdfsListResponse = {
  pdfs: AdminChatKnowledgePdf[];
};

/** Response from POST /api/admin/chat/pdfs. */
export type AdminChatPdfsUploadResponse = {
  pdfs: AdminChatKnowledgePdf[];
  errors: string[];
};

/** Response from DELETE /api/admin/chat/pdfs/[id]. */
export type AdminChatPdfDeleteResponse = {
  success: boolean;
  deletedId: string;
  wiped: boolean;
  reindex: Omit<AdminChatIndexSyncResponse, "success"> | null;
  warning?: string;
};

/**
 * Sync live CMS/KB/PDF chunks into the Qdrant chat RAG index.
 *
 * @param mode - Incremental (skip unchanged) or full re-embed
 */
export async function syncAdminChatIndex(
  mode: "incremental" | "full" = "incremental",
): Promise<AdminChatIndexSyncResponse> {
  return adminFetch<AdminChatIndexSyncResponse>("/api/admin/chat/index", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  });
}

/**
 * List chat knowledge PDFs.
 */
export async function fetchAdminChatPdfs(): Promise<AdminChatPdfsListResponse> {
  return adminFetch<AdminChatPdfsListResponse>("/api/admin/chat/pdfs");
}

/**
 * Upload one or more PDFs for chat RAG.
 *
 * @param form - Multipart form with `file`/`files` and optional `title`
 */
export async function uploadAdminChatPdfs(
  form: FormData,
): Promise<AdminChatPdfsUploadResponse> {
  return adminFetch<AdminChatPdfsUploadResponse>("/api/admin/chat/pdfs", {
    method: "POST",
    body: form,
  });
}

/**
 * Delete a chat knowledge PDF (wipes Qdrant, then re-indexes remaining).
 *
 * @param id - PDF document id
 */
export async function deleteAdminChatPdf(
  id: string,
): Promise<AdminChatPdfDeleteResponse> {
  return adminFetch<AdminChatPdfDeleteResponse>(
    `/api/admin/chat/pdfs/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

/**
 * Fetch global settings (chrome + shared section keys).
 *
 * @param key - Settings key
 */
export async function fetchAdminGlobalSettings(key: AdminGlobalSettingsKey) {
  const response = await fetch(`/api/admin/settings/${key}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to fetch ${key}`);
  }
  return response.json();
}

/**
 * Save global settings.
 *
 * @param key - Settings key
 * @param value - Settings JSON value
 */
export async function saveAdminGlobalSettings(
  key: AdminGlobalSettingsKey,
  value: unknown,
) {
  const response = await fetch(`/api/admin/settings/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to save ${key}`);
  }
  return response.json();
}
