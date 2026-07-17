import mysql from "mysql2/promise";

const globalForPool = globalThis as unknown as {
  mysqlPool?: mysql.Pool;
};

/**
 * Whether MySQL CMS is enabled via `DATABASE_URL`.
 *
 * @returns True when `DATABASE_URL` is set
 */
export function isDbEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/**
 * Parses `DATABASE_URL` into mysql2 pool options.
 *
 * @param databaseUrl - mysql://user:pass@host:port/db
 */
function poolOptionsFromUrl(databaseUrl: string): mysql.PoolOptions {
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, "").split("?")[0],
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false,
    dateStrings: false,
  };
}

/**
 * Shared mysql2 pool (singleton in dev to survive HMR).
 *
 * @returns Connection pool
 */
export function getPool(): mysql.Pool {
  if (!isDbEnabled()) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!globalForPool.mysqlPool) {
    globalForPool.mysqlPool = mysql.createPool(
      poolOptionsFromUrl(process.env.DATABASE_URL!.trim()),
    );
  }
  return globalForPool.mysqlPool;
}

/**
 * True when a caught error is a connection / missing-table failure.
 *
 * @param error - Caught repository error
 */
export function isDbConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  const code = (error as Error & { code?: string }).code ?? "";
  return (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    code === "PROTOCOL_CONNECTION_LOST" ||
    code === "ER_NO_SUCH_TABLE" ||
    code === "ER_BAD_FIELD_ERROR" ||
    msg.includes("can't connect") ||
    msg.includes("econnrefused") ||
    msg.includes("unknown database") ||
    msg.includes("doesn't exist")
  );
}

/**
 * Whether content-type tables are expected to exist (DB configured).
 * Kept sync for call-site compatibility with the old Prisma helper.
 */
export function isContentTypesSchemaReady(): boolean {
  return isDbEnabled();
}

/**
 * Whether content-item tables are expected to exist (DB configured).
 */
export function isContentItemsSchemaReady(): boolean {
  return isDbEnabled();
}
