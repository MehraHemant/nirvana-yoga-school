import { neonConfig, Pool } from "@neondatabase/serverless";
import WebSocket from "ws";

const globalForPool = globalThis as unknown as {
  neonPool?: Pool;
};

// Node.js 20 needs an explicit WebSocket implementation for Neon `Pool`
// transactions. Modern edge runtimes use their built-in implementation instead.
if (typeof WebSocket !== "undefined") {
  neonConfig.webSocketConstructor = WebSocket;
}

/**
 * Whether Neon Postgres is enabled via `NEON_DB_POSTGRES_URL`.
 *
 * @returns True when `NEON_DB_POSTGRES_URL` is set
 */
export function isDbEnabled(): boolean {
  return Boolean(process.env.NEON_DB_POSTGRES_URL?.trim());
}

/**
 * Shared Neon Postgres pool (singleton in development to survive HMR).
 *
 * @returns Connection pool
 */
export function getPool(): Pool {
  const connectionString = process.env.NEON_DB_POSTGRES_URL?.trim();
  if (!connectionString) {
    throw new Error("NEON_DB_POSTGRES_URL is not set");
  }
  if (!globalForPool.neonPool) {
    globalForPool.neonPool = new Pool({
      connectionString,
      max: 10,
    });
  }
  return globalForPool.neonPool;
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
    code === "ECONNRESET" ||
    code === "3D000" ||
    code === "42P01" ||
    code === "42703" ||
    msg.includes("connection") ||
    msg.includes("econnrefused") ||
    msg.includes("database") ||
    msg.includes("relation") ||
    msg.includes("does not exist")
  );
}

/**
 * Whether content-type tables are expected to exist (DB configured).
 * Kept sync for call-site compatibility with the old Neon helper.
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
