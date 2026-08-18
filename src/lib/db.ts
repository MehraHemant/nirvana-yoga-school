/**
 * Compatibility bridge: existing `from "@/lib/db"` imports resolve here.
 * Implementation lives in `./db/*` (Neon Neon-compatible client).
 */
export {
  createId,
  type DbClient,
  db,
  execute,
  getPool,
  isContentItemsSchemaReady,
  isContentTypesSchemaReady,
  isDbConnectionError,
  isDbEnabled,
  type ModelDelegate,
  parseJson,
  queryOne,
  queryRows,
  type SqlConn,
  stringifyJson,
  withTransaction,
} from "./db/index";
