import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getPool } from "./pool";

export type SqlConn = Pool | PoolConnection;

/**
 * Runs a SELECT and returns all rows.
 *
 * @param sql - Parameterized SQL
 * @param params - Bound values
 * @param conn - Optional connection (for transactions)
 */
export async function queryRows<T extends RowDataPacket>(
  sql: string,
  params: unknown[] = [],
  conn: SqlConn = getPool(),
): Promise<T[]> {
  const [rows] = await conn.query<T[]>(sql, params);
  return rows;
}

/**
 * Runs a SELECT and returns the first row or null.
 *
 * @param sql - Parameterized SQL
 * @param params - Bound values
 * @param conn - Optional connection
 */
export async function queryOne<T extends RowDataPacket>(
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
): Promise<ResultSetHeader> {
  // mysql2 overload resolution is brittle across Pool | PoolConnection
  const [result] = (await (conn as Pool).query(sql, params)) as [
    ResultSetHeader,
    unknown,
  ];
  return result;
}

/**
 * Runs work inside a MySQL transaction.
 *
 * @param fn - Callback receiving the transaction connection
 */
export async function withTransaction<T>(
  fn: (conn: PoolConnection) => Promise<T>,
): Promise<T> {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
