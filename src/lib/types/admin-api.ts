import type { BlogPostDocument } from "@/content/types/blog-post";
import type { BookingRecord } from "@/content/types/booking";
import type { LeadStats, LeadSubmissionRecord } from "@/content/types/lead";
import type {
  ModuleLibraryItemRecord,
  ModuleLibraryKey,
} from "@/content/types/module-library";
import type { PageModulesDocument } from "@/content/types/page-modules";
import type { SitePageDocument } from "@/content/types/site-page";
import type { AdminSession } from "@/lib/cms/auth-session";
import type {
  ApiEntityBody,
  ApiListBody,
  ApiMutationResponse,
  ContentApiBody,
  DbEnabledListBody,
  DbEnabledStatsBody,
} from "@/lib/types/api";
import type { AdminBlogRow, AdminPageRow } from "@/lib/types/db";

/** GET /api/admin/media */
export type AdminMediaAsset = {
  id: string;
  url: string;
  mime: string;
  sizeBytes: number;
  alt: string | null;
  caption: string | null;
  description: string | null;
  tags: string[];
  createdAt: string;
  usage: { inUse: boolean; references: string[] };
};

export type AdminMediaListResponse = ApiListBody<"assets", AdminMediaAsset>;

/** GET/PUT /api/admin/media/[id] */
export type AdminMediaItemResponse = ApiEntityBody<"asset", AdminMediaAsset>;

/** GET /api/admin/pages/[slug] | courses/[slug] */
export type AdminPageDocumentResponse = {
  page: SitePageDocument | null;
  modules?: PageModulesDocument | null;
};

/** POST /api/admin/auth/login */
export type AdminLoginResponse = ApiEntityBody<"user", AdminSession>;

/** GET /api/admin/courses */
export type AdminCoursesListResponse = ApiListBody<"courses", AdminPageRow>;

/** GET /api/admin/blog */
export type AdminBlogListResponse = ApiListBody<"posts", AdminBlogRow>;

/** GET /api/admin/leads */
export type AdminLeadsListResponse = DbEnabledListBody<
  "leads",
  LeadSubmissionRecord
>;

/** GET /api/admin/leads/stats */
export type AdminLeadStatsResponse = DbEnabledStatsBody<LeadStats>;

/** GET /api/admin/bookings */
export type AdminBookingsListResponse = DbEnabledListBody<
  "bookings",
  BookingRecord
>;

/** GET /api/admin/module-library */
export type AdminModuleLibraryListResponse = ApiListBody<
  "items",
  ModuleLibraryItemRecord & { preview: string }
>;

/** GET /api/admin/module-library/[id] */
export type AdminModuleLibraryItemResponse = ApiEntityBody<
  "item",
  ModuleLibraryItemRecord
>;

/** GET /api/admin/modules/[slug] */
export type AdminPageModulesMeta = {
  id: string;
  type: string;
  published: boolean;
};

export type AdminPageModulesGetResponse = {
  modules: PageModulesDocument;
  meta: AdminPageModulesMeta;
};

/** GET /api/admin/blog/[slug] */
export type AdminBlogPostMeta = {
  id: string;
  published: boolean;
};

export type AdminBlogPostGetResponse = ApiEntityBody<
  "post",
  BlogPostDocument
> & {
  meta: AdminBlogPostMeta;
};

/** POST /api/admin/media/upload */
export type AdminMediaUploadResponse = Pick<
  AdminMediaAsset,
  "id" | "url" | "sizeBytes" | "mime" | "caption" | "description" | "tags"
>;

/** POST /api/admin/auth/login */
export type AdminLoginInput = {
  email: string;
  password: string;
};

/** GET /api/admin/pages */
export type AdminPagesListResponse = ApiListBody<"pages", AdminPageRow>;

/** GET /api/admin/auth/me */
export type AdminMeResponse = ApiEntityBody<"user", AdminSession>;

/** POST /api/admin/auth/logout */
export type AdminLogoutResponse = ApiMutationResponse;

/** PUT /api/admin/pages|courses|modules/[slug] */
export type AdminSavePageResponse = ApiMutationResponse & { id: string };

/** POST /api/leads | bookings success */
export type PublicLeadCreateResponse = ApiMutationResponse;
export type PublicBookingCreateResponse = ApiEntityBody<
  "booking",
  BookingRecord
>;

/** GET /api/content/pages/[slug] */
export type PublicSitePageResponse = ContentApiBody<SitePageDocument>;

/** Module library filter query */
export type ModuleLibraryQuery = {
  moduleKey: ModuleLibraryKey;
  variant?: string;
};
