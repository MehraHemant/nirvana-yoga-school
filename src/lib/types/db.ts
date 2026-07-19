/**
 * ISO-8601 date string as returned by APIs and stored in JSON records.
 */
export type DbIsoDate = string;

/**
 * Primary key present on every persisted CMS row.
 */
export type DbRecordId = {
  id: string;
};

/**
 * Standard created/updated audit fields (API serialization).
 */
export type DbTimestampsIso = {
  createdAt: DbIsoDate;
  updatedAt: DbIsoDate;
};

/**
 * Optional soft-delete timestamp on API records.
 */
export type DbSoftDeleteIso = {
  deletedAt: DbIsoDate | null;
};

/**
 * Publish flag shared by pages and blog posts.
 */
export type DbPublishable = {
  published: boolean;
};

/**
 * Serialize Neon `DateTime` fields on a row to ISO strings for JSON APIs.
 *
 * @param row - Database row with Date timestamps
 * @returns Same row with ISO date strings
 */
export function serializeDbTimestamps<
  T extends { createdAt: Date; updatedAt?: Date },
>(row: T): Omit<T, "createdAt" | "updatedAt"> & DbTimestampsIso {
  const { createdAt, updatedAt, ...rest } = row;
  return {
    ...rest,
    createdAt: createdAt.toISOString(),
    updatedAt: (updatedAt ?? createdAt).toISOString(),
  };
}

/**
 * Admin pages/courses list row (minimal CMS page fields).
 */
export type AdminPageRow = DbRecordId &
  DbPublishable & {
    slug: string;
    type: string;
    title: string;
    updatedAt: Date | DbIsoDate;
  };

/**
 * Admin blog list row.
 */
export type AdminBlogRow = DbRecordId &
  DbPublishable & {
    slug: string;
    title: string;
    category: string;
    publishedAt: Date | DbIsoDate | null;
    updatedAt: Date | DbIsoDate;
  };
