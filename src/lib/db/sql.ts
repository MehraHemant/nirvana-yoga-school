import type {
  Pool,
  PoolClient,
  QueryResultRow,
} from "@neondatabase/serverless";
import { getPool } from "./pool";

export type SqlConn = Pool | PoolClient;

export type ExecuteResult = {
  affectedRows: number;
};

/**
 * Converts legacy positional markers to PostgreSQL positional markers.
 *
 * @param statement - SQL using `?` positional markers
 * @returns PostgreSQL SQL using `$1`, `$2`, etc.
 */
function postgresSql(statement: string): string {
  let parameterIndex = 0;
  return statement.replace(/\?/g, () => `$${++parameterIndex}`);
}

/**
 * Runs a SELECT and returns all rows.
 *
 * @param sql - Parameterized SQL
 * @param params - Bound values
 * @param conn - Optional connection (for transactions)
 */
export async function queryRows<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
  conn: SqlConn = getPool(),
): Promise<T[]> {
  const result = await conn.query<T>(postgresSql(sql), params);
  return result.rows;
}

/**
 * Runs a SELECT and returns the first row or null.
 *
 * @param sql - Parameterized SQL
 * @param params - Bound values
 * @param conn - Optional connection
 */
export async function queryOne<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
  conn: SqlConn = getPool(),
): Promise<T | null> {
  const rows = await queryRows<T>(sql, params, conn);
  return rows[0] ?? null;
}

/**
 * Runs INSERT/UPDATE/DELETE and returns the result header.
 *
 * @param sql - Parameterized SQL
 * @param params - Bound values
 * @param conn - Optional connection
 */
export async function execute(
  sql: string,
  params: unknown[] = [],
  conn: SqlConn = getPool(),
): Promise<ExecuteResult> {
  const result = await conn.query(postgresSql(sql), params);
  return { affectedRows: result.rowCount ?? 0 };
}

/**
 * Runs work inside a Neon Postgres transaction.
 *
 * @param fn - Callback receiving the transaction connection
 */
export async function withTransaction<T>(
  fn: (conn: PoolClient) => Promise<T>,
): Promise<T> {
  const conn = await getPool().connect();
  try {
    await conn.query("BEGIN");
    const result = await fn(conn);
    await conn.query("COMMIT");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    throw error;
  } finally {
    conn.release();
  }
}
