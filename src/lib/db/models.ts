/**
 * Table metadata for the mysql2 Prisma-compatible client.
 * JS uses camelCase; MySQL columns use snake_case via Prisma `@map`.
 */

export type ModelName =
  | "page"
  | "contentItem"
  | "contentType"
  | "contentReference"
  | "globalSettings"
  | "leadSubmission"
  | "blogPost"
  | "booking"
  | "mediaAsset"
  | "navigationGroup"
  | "navigationItem"
  | "adminUser"
  | "courseDocument"
  | "pageSection"
  | "pagePackage"
  | "pageGalleryImage"
  | "pageCard"
  | "pagePerson"
  | "pageHighlight"
  | "sectionSubsection"
  | "sectionItem"
  | "subsectionItem";

export type ModelMeta = {
  /** MySQL table name */
  table: string;
  /** Primary key field (camelCase) */
  primaryKey: string;
  /** camelCase field → DB column */
  fields: Record<string, string>;
  /** Fields stored as MySQL JSON */
  jsonFields: Set<string>;
  /** Fields that must be coerced from 0/1 to boolean */
  booleanFields: Set<string>;
  /** Defaults applied on create when the field is omitted */
  defaultCreate: Record<string, unknown>;
  /** camelCase field updated to NOW() on update/upsert, if any */
  updatedAt?: string;
};

function meta(
  table: string,
  fields: Record<string, string>,
  options: {
    primaryKey?: string;
    jsonFields?: string[];
    booleanFields?: string[];
    defaultCreate?: Record<string, unknown>;
    updatedAt?: string;
  } = {},
): ModelMeta {
  return {
    table,
    primaryKey: options.primaryKey ?? "id",
    fields,
    jsonFields: new Set(options.jsonFields ?? []),
    booleanFields: new Set(options.booleanFields ?? []),
    defaultCreate: options.defaultCreate ?? {},
    updatedAt: options.updatedAt,
  };
}

/** All models used by the CMS / booking stack. */
export const MODELS: Record<ModelName, ModelMeta> = {
  page: meta(
    "pages",
    {
      id: "id",
      slug: "slug",
      type: "type",
      eyebrow: "eyebrow",
      title: "title",
      description: "description",
      image: "image",
      fee: "fee",
      duration: "duration",
      ctaLabel: "cta_label",
      ctaHref: "cta_href",
      published: "published",
      contentTypeId: "content_type_id",
      contentData: "content_data",
      createdAt: "created_at",
      updatedAt: "updated_at",
      pageModules: "page_modules",
    },
    {
      jsonFields: ["contentData", "pageModules"],
      booleanFields: ["published"],
      defaultCreate: {
        eyebrow: "",
        description: "",
        image: "",
        fee: "",
        duration: "",
        published: true,
        contentData: {},
      },
      updatedAt: "updatedAt",
    },
  ),

  contentType: meta(
    "content_types",
    {
      id: "id",
      key: "key",
      name: "name",
      description: "description",
      icon: "icon",
      sortOrder: "sort_order",
      isSystem: "is_system",
      pageTypes: "page_types",
      fields: "fields",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    {
      jsonFields: ["pageTypes", "fields"],
      booleanFields: ["isSystem"],
      defaultCreate: {
        description: "",
        icon: "page",
        sortOrder: 0,
        isSystem: false,
        pageTypes: ["site"],
        fields: [],
      },
      updatedAt: "updatedAt",
    },
  ),

  contentItem: meta(
    "content_items",
    {
      id: "id",
      contentTypeId: "content_type_id",
      slug: "slug",
      name: "name",
      published: "published",
      publishedAt: "published_at",
      sortOrder: "sort_order",
      data: "data",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    {
      jsonFields: ["data"],
      booleanFields: ["published"],
      defaultCreate: {
        published: false,
        sortOrder: 0,
        data: {},
      },
      updatedAt: "updatedAt",
    },
  ),

  contentReference: meta(
    "content_references",
    {
      id: "id",
      fromId: "from_id",
      toId: "to_id",
      fieldKey: "field_key",
      sortOrder: "sort_order",
    },
    {
      defaultCreate: { sortOrder: 0 },
    },
  ),

  globalSettings: meta(
    "global_settings",
    {
      id: "id",
      key: "key",
      value: "value",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    {
      jsonFields: ["value"],
      updatedAt: "updatedAt",
    },
  ),

  leadSubmission: meta(
    "lead_submissions",
    {
      id: "id",
      type: "type",
      status: "status",
      name: "name",
      email: "email",
      phone: "phone",
      subject: "subject",
      program: "program",
      accommodation: "accommodation",
      startDate: "start_date",
      message: "message",
      source: "source",
      createdAt: "created_at",
      readAt: "read_at",
      deletedAt: "deleted_at",
    },
    {
      defaultCreate: { status: "new" },
    },
  ),

  blogPost: meta(
    "blog_posts",
    {
      id: "id",
      slug: "slug",
      title: "title",
      category: "category",
      excerpt: "excerpt",
      image: "image",
      publishedAt: "published_at",
      content: "content",
      bodyHtml: "body_html",
      published: "published",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    {
      jsonFields: ["content"],
      booleanFields: ["published"],
      defaultCreate: {
        category: "",
        image: "",
        content: [],
        published: true,
      },
      updatedAt: "updatedAt",
    },
  ),

  booking: meta(
    "bookings",
    {
      id: "id",
      type: "type",
      status: "status",
      programSlug: "program_slug",
      programTitle: "program_title",
      roomType: "room_type",
      batchDate: "batch_date",
      duration: "duration",
      name: "name",
      gender: "gender",
      email: "email",
      phone: "phone",
      country: "country",
      referenceCode: "reference_code",
      hearAbout: "hear_about",
      paymentMode: "payment_mode",
      basePriceCents: "base_price_cents",
      fullAmountCents: "full_amount_cents",
      payNowCents: "pay_now_cents",
      paypalFeeCents: "paypal_fee_cents",
      totalPayNowCents: "total_pay_now_cents",
      remainingCents: "remaining_cents",
      promoCode: "promo_code",
      discountCents: "discount_cents",
      paypalOrderId: "paypal_order_id",
      paypalCaptureId: "paypal_capture_id",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      confirmedAt: "confirmed_at",
    },
    {
      defaultCreate: {
        status: "pending_payment",
        discountCents: 0,
      },
      updatedAt: "updatedAt",
    },
  ),

  mediaAsset: meta(
    "media_assets",
    {
      id: "id",
      url: "url",
      cdnKey: "cdn_key",
      mime: "mime",
      sizeBytes: "size_bytes",
      width: "width",
      height: "height",
      alt: "alt",
      caption: "caption",
      description: "description",
      tags: "tags",
      createdAt: "created_at",
    },
    {
      jsonFields: ["tags"],
      defaultCreate: { tags: [] },
    },
  ),

  navigationGroup: meta("navigation_groups", {
    id: "id",
    key: "key",
    label: "label",
  }),

  navigationItem: meta(
    "navigation_items",
    {
      id: "id",
      groupId: "group_id",
      sortOrder: "sort_order",
      itemType: "item_type",
      pageType: "page_type",
      pageSlug: "page_slug",
      href: "href",
      label: "label",
    },
    {
      defaultCreate: { sortOrder: 0 },
    },
  ),

  adminUser: meta(
    "admin_users",
    {
      id: "id",
      email: "email",
      passwordHash: "password_hash",
      role: "role",
      createdAt: "created_at",
    },
    {
      defaultCreate: { role: "editor" },
    },
  ),

  courseDocument: meta(
    "course_documents",
    {
      id: "id",
      pageId: "page_id",
      document: "document",
    },
    {
      jsonFields: ["document"],
    },
  ),

  pageSection: meta(
    "page_sections",
    {
      id: "id",
      pageId: "page_id",
      sortOrder: "sort_order",
      title: "title",
      eyebrow: "eyebrow",
      body: "body",
      layout: "layout",
      image: "image",
      images: "images",
      blocks: "blocks",
    },
    {
      jsonFields: ["images", "blocks"],
      defaultCreate: {
        layout: "default",
        images: [],
      },
    },
  ),

  pagePackage: meta(
    "page_packages",
    {
      id: "id",
      pageId: "page_id",
      sortOrder: "sort_order",
      title: "title",
      price: "price",
      image: "image",
    },
    {
      defaultCreate: { sortOrder: 0 },
    },
  ),

  pageGalleryImage: meta(
    "page_gallery_images",
    {
      id: "id",
      pageId: "page_id",
      sortOrder: "sort_order",
      url: "url",
      category: "category",
      mediaAssetId: "media_asset_id",
    },
    {
      defaultCreate: {
        sortOrder: 0,
        category: "general",
      },
    },
  ),

  pageCard: meta(
    "page_cards",
    {
      id: "id",
      pageId: "page_id",
      sortOrder: "sort_order",
      title: "title",
      description: "description",
      href: "href",
    },
    {
      defaultCreate: { sortOrder: 0 },
    },
  ),

  pagePerson: meta(
    "page_people",
    {
      id: "id",
      pageId: "page_id",
      sortOrder: "sort_order",
      name: "name",
      image: "image",
      summary: "summary",
      bio: "bio",
      education: "education",
      experience: "experience",
      expertise: "expertise",
    },
    {
      jsonFields: ["education", "experience", "expertise"],
      defaultCreate: {
        sortOrder: 0,
        education: [],
        experience: [],
        expertise: [],
      },
    },
  ),

  pageHighlight: meta(
    "page_highlights",
    {
      id: "id",
      pageId: "page_id",
      sortOrder: "sort_order",
      title: "title",
      description: "description",
      image: "image",
    },
    {
      defaultCreate: { sortOrder: 0 },
    },
  ),

  sectionSubsection: meta(
    "section_subsections",
    {
      id: "id",
      sectionId: "section_id",
      sortOrder: "sort_order",
      title: "title",
      body: "body",
      image: "image",
    },
    {
      defaultCreate: { sortOrder: 0 },
    },
  ),

  sectionItem: meta(
    "section_items",
    {
      id: "id",
      sectionId: "section_id",
      sortOrder: "sort_order",
      value: "value",
    },
    {
      defaultCreate: { sortOrder: 0 },
    },
  ),

  subsectionItem: meta(
    "subsection_items",
    {
      id: "id",
      subsectionId: "subsection_id",
      sortOrder: "sort_order",
      value: "value",
    },
    {
      defaultCreate: { sortOrder: 0 },
    },
  ),
};

/**
 * Resolves a camelCase field to its DB column for a model.
 *
 * @param model - Model metadata
 * @param field - camelCase field name
 * @returns Quoted column name
 */
export function columnOf(model: ModelMeta, field: string): string {
  const col = model.fields[field];
  if (!col) {
    throw new Error(`Unknown field "${field}" on table ${model.table}`);
  }
  return `\`${col}\``;
}
