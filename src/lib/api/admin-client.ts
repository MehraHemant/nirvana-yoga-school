import type { BlogPostDocument } from "@/content/types/blog-post";
import type { LeadStatus } from "@/content/types/lead";
import type {
  CreateModuleLibraryItemInput,
  ModuleLibraryItemRecord,
  UpdateModuleLibraryItemInput,
} from "@/content/types/module-library";
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
  AdminModuleLibraryItemResponse,
  AdminModuleLibraryListResponse,
  AdminPageModulesGetResponse,
} from "@/lib/types/admin-api";
import type { ApiMutationResponse } from "@/lib/types/api";
import { parseApiJson } from "@/lib/types/api";

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
 * Load a module library item.
 *
 * @param id - Library item id
 */
export async function fetchAdminModuleLibraryItem(
  id: string,
): Promise<AdminModuleLibraryItemResponse> {
  return adminFetch<AdminModuleLibraryItemResponse>(
    `/api/admin/module-library/${id}`,
  );
}

/**
 * Update a module library item.
 *
 * @param id - Library item id
 * @param patch - Fields to update
 */
export async function saveAdminModuleLibraryItem(
  id: string,
  patch: UpdateModuleLibraryItemInput,
): Promise<AdminModuleLibraryItemResponse> {
  return adminFetch<AdminModuleLibraryItemResponse>(
    `/api/admin/module-library/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    },
  );
}

/**
 * List module library items with optional filters.
 *
 * @param params - moduleKey and optional variant
 */
export async function fetchAdminModuleLibrary(
  params: URLSearchParams,
): Promise<AdminModuleLibraryListResponse> {
  return adminFetch<AdminModuleLibraryListResponse>(
    `/api/admin/module-library?${params}`,
  );
}

/**
 * Create a module library item.
 *
 * @param input - Create payload
 */
export async function createAdminModuleLibraryItem(
  input: CreateModuleLibraryItemInput,
): Promise<AdminModuleLibraryItemResponse> {
  return adminFetch<AdminModuleLibraryItemResponse>(
    "/api/admin/module-library",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
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

export type { ModuleLibraryItemRecord };

/**
 * Fetch global settings (header, footer, siteConfig).
 */
/**
 * Fetch global settings (header, footer, siteConfig).
 */
export async function fetchAdminGlobalSettings(key: "header" | "footer" | "siteConfig") {
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
 */
export async function saveAdminGlobalSettings(key: "header" | "footer" | "siteConfig", value: unknown) {
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
