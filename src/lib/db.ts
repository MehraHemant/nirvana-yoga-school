/**
 * Compatibility bridge: existing `from "@/lib/db"` imports resolve here.
 * Implementation lives in `./db/*` (mysql2 Prisma-compatible client).
 */
export {
  createId,
  execute,
  getPool,
  isContentItemsSchemaReady,
  isContentTypesSchemaReady,
  isDbConnectionError,
  isDbEnabled,
  parseJson,
  prisma,
  queryOne,
  queryRows,
  stringifyJson,
  withTransaction,
  type DbClient,
  type ModelDelegate,
  type SqlConn,
} from "./db/index";
