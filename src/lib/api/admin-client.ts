import type { BlogPostDocument } from "@/content/types/blog-post";
import type { DedicatedPageContent } from "@/content/types/dedicated-pages";
import type { LeadStatus } from "@/content/types/lead";
import type { PageModulesDocument } from "@/content/types/page-modules";
import type {
  AdminBlogPostGetResponse,
  AdminBookingsListResponse,
  AdminLeadsListResponse,
  AdminLoginInput,
  AdminLoginResponse,
  AdminMediaItemResponse,
  AdminMediaListResponse,
  AdminMediaUploadResponse,
  AdminPageEditorDocument,
  AdminPageModulesGetResponse,
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
 * Load page modules for the module editor.
 *
 * @param slug - Page slug
 */
export async function fetchAdminPageModules(
  slug: string,
): Promise<AdminPageModulesGetResponse> {
  return adminFetch<AdminPageModulesGetResponse>(
    `/api/admin/modules/${encodeURIComponent(slug)}`,
  );
}

/**
 * Save page modules from the module editor.
 *
 * @param slug - Page slug
 * @param modules - Updated modules document
 */
export async function saveAdminPageModules(
  slug: string,
  modules: PageModulesDocument,
): Promise<ApiMutationResponse> {
  return adminFetch<ApiMutationResponse>(
    `/api/admin/modules/${encodeURIComponent(slug)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modules),
    },
  );
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
 * @param tag - Optional tag filter
 */
export async function fetchAdminMedia(
  tag?: string,
): Promise<AdminMediaListResponse> {
  const params = tag ? `?tag=${encodeURIComponent(tag)}` : "";
  return adminFetch<AdminMediaListResponse>(`/api/admin/media${params}`);
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

/**
 * Load dedicated page content_data (home / contact / enquire-now).
 *
 * @param slug - Dedicated page slug
 */
export async function fetchAdminDedicatedPage(slug: string): Promise<{
  content: DedicatedPageContent;
  meta: { slug: string; type: string };
}> {
  return adminFetch(`/api/admin/dedicated/${encodeURIComponent(slug)}`);
}

/**
 * Save dedicated page content_data from Home / Contact / Enquire editors.
 *
 * @param slug - Dedicated page slug
 * @param content - Typed CMS document
 */
export async function saveAdminDedicatedPage(
  slug: string,
  content: DedicatedPageContent,
): Promise<ApiMutationResponse> {
  return adminFetch(`/api/admin/dedicated/${encodeURIComponent(slug)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
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
