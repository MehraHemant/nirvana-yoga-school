import type { BlogPostDocument } from "@/content/types/blog-post";
import type { BookingRecord } from "@/content/types/booking";
import type { OnlineCourseDocument } from "@/content/types/course";
import type { DedicatedPageContent } from "@/content/types/dedicated-pages";
import type { LeadStats, LeadSubmissionRecord } from "@/content/types/lead";
import type { PageModulesDocument } from "@/content/types/page-modules";
import type { RetreatDocument } from "@/content/types/retreat-page";
import type { SitePageDocument } from "@/content/types/site-page";
import type { AdminSession } from "@/lib/cms/auth-session";
import type {
  HeroLayoutConfig,
  PageLayoutId,
} from "@/lib/cms/page-layout-registry";
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
  /** Smaller Cloudinary (or original) URL for grid previews */
  thumbUrl?: string;
  mime: string;
  sizeBytes: number;
  alt: string | null;
  caption: string | null;
  description: string | null;
  tags: string[];
  createdAt: string;
  usage: { inUse: boolean; references: string[] };
};

export type AdminMediaListResponse = ApiListBody<"assets", AdminMediaAsset> & {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/** GET/PUT /api/admin/media/[id] */
export type AdminMediaItemResponse = ApiEntityBody<"asset", AdminMediaAsset>;

/** GET /api/admin/pages/[slug] | courses/[slug] */
export type AdminPageDocumentResponse = {
  page: SitePageDocument | null;
  modules?: PageModulesDocument | null;
};

/** Single read/write document used by the guided page editor. */
export type AdminPageEditorDocument = {
  page: SitePageDocument;
  modules: PageModulesDocument | null;
  content: DedicatedPageContent | null;
  product: {
    kind: "online" | "retreat";
    document: OnlineCourseDocument | RetreatDocument;
  } | null;
  meta: AdminPageModulesMeta;
};

/** POST /api/admin/auth/login */
export type AdminLoginResponse = ApiEntityBody<"user", AdminSession>;

/** GET /api/admin/courses */
export type AdminCoursesListResponse = ApiListBody<"courses", AdminPageRow>;

/** GET /api/admin/blog */
export type AdminBlogListResponse = ApiListBody<"posts", AdminBlogRow>;

/** POST /api/admin/blog */
export type AdminBlogCreateResponse = {
  post: Pick<AdminBlogRow, "id" | "slug">;
};

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

/** GET /api/admin/modules/[slug] | GET /api/admin/pages/[slug] meta */
export type AdminPageModulesMeta = {
  id: string;
  type: string;
  published: boolean;
  layoutId?: PageLayoutId;
  heroLayout?: HeroLayoutConfig;
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
> & {
  /** Cloudinary public_id (`media_assets.cdn_key`) */
  cdnKey: string;
  /** Video duration from Cloudinary when uploading a video */
  durationSeconds: number | null;
  /** Optional alt text mirrored from upload metadata */
  alt?: string | null;
  /** Linked lodging `media_images.id` when dual-written for images */
  mediaImageId?: string | null;
};

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

/** POST /api/admin/auth/change-password */
export type AdminChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type AdminChangePasswordResponse = ApiMutationResponse;

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
