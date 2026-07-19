import { AsyncLocalStorage } from "node:async_hooks";
import type { QueryResultRow } from "@neondatabase/serverless";
import { createId } from "./ids";
import { parseJson, stringifyJson } from "./json";
import { columnOf, MODELS, type ModelMeta, type ModelName } from "./models";
import { getPool } from "./pool";
import {
  execute,
  queryOne,
  queryRows,
  type SqlConn,
  withTransaction,
} from "./sql";

const txStorage = new AsyncLocalStorage<SqlConn>();

/**
 * Active SQL connection (transaction connection when inside `$transaction`).
 */
function getConn(): SqlConn {
  return txStorage.getStore() ?? getPool();
}

type WhereInput = Record<string, unknown>;
type OrderByInput =
  | Record<string, "asc" | "desc">
  | Record<string, "asc" | "desc">[];
type SelectInput = Record<string, boolean>;
type IncludeInput = Record<string, unknown>;

type FindArgs = {
  where?: WhereInput;
  orderBy?: OrderByInput;
  take?: number;
  skip?: number;
  select?: SelectInput;
  include?: IncludeInput;
};

type CreateArgs = {
  data: Record<string, unknown>;
  select?: SelectInput;
  include?: IncludeInput;
};

type UpdateArgs = {
  where: WhereInput;
  data: Record<string, unknown>;
  select?: SelectInput;
  include?: IncludeInput;
};

type UpsertArgs = {
  where: WhereInput;
  create: Record<string, unknown>;
  update: Record<string, unknown>;
  select?: SelectInput;
  include?: IncludeInput;
};

type CreateManyArgs = {
  data: Record<string, unknown> | Record<string, unknown>[];
  skipDuplicates?: boolean;
};

type UpdateManyArgs = {
  where?: WhereInput;
  data: Record<string, unknown>;
};

type AggregateArgs = {
  where?: WhereInput;
  _max?: Record<string, boolean>;
  _min?: Record<string, boolean>;
  _avg?: Record<string, boolean>;
  _sum?: Record<string, boolean>;
  _count?: boolean | Record<string, boolean>;
};

/**
 * Defers execution until the promise is awaited (NeonPromise-compatible).
 * Lets `$transaction([...])` bind the connection before work runs.
 *
 * @param fn - Work to run on first await
 */
function defer<T>(fn: () => Promise<T>): Promise<T> {
  let started: Promise<T> | null = null;
  const run = () => {
    if (!started) started = fn();
    return started;
  };
  return {
    // biome-ignore lint/suspicious/noThenProperty: Implements NeonPromise-compatible lazy execution.
    then(onFulfilled, onRejected) {
      return run().then(onFulfilled, onRejected);
    },
    catch(onRejected) {
      return run().catch(onRejected);
    },
    finally(onFinally) {
      return run().finally(onFinally);
    },
    [Symbol.toStringTag]: "Promise",
  } as Promise<T>;
}

/**
 * Builds a WHERE clause from a Neon-like filter object.
 *
 * @param model - Model metadata
 * @param where - Filter object
 * @param params - Params array to push bind values into
 * @returns SQL fragment without leading WHERE (or empty)
 */
function buildWhere(
  model: ModelMeta,
  where: WhereInput | undefined,
  params: unknown[],
): string {
  if (!where || Object.keys(where).length === 0) return "";
  const parts = buildWhereParts(model, where, params);
  if (parts.length === 0) return "";
  return `WHERE ${parts.join(" AND ")}`;
}

function buildWhereParts(
  model: ModelMeta,
  where: WhereInput,
  params: unknown[],
): string[] {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(where)) {
    if (key === "AND") {
      const clauses = (Array.isArray(value) ? value : [value]) as WhereInput[];
      const nested = clauses
        .map((clause) => {
          const inner = buildWhereParts(model, clause, params);
          return inner.length > 0 ? `(${inner.join(" AND ")})` : null;
        })
        .filter(Boolean);
      if (nested.length > 0) parts.push(`(${nested.join(" AND ")})`);
      continue;
    }

    if (key === "OR") {
      const clauses = (Array.isArray(value) ? value : [value]) as WhereInput[];
      const nested = clauses
        .map((clause) => {
          const inner = buildWhereParts(model, clause, params);
          return inner.length > 0 ? `(${inner.join(" AND ")})` : null;
        })
        .filter(Boolean);
      if (nested.length > 0) parts.push(`(${nested.join(" OR ")})`);
      continue;
    }

    if (key === "NOT") {
      const clause = value as WhereInput;
      const inner = buildWhereParts(model, clause, params);
      if (inner.length > 0) parts.push(`NOT (${inner.join(" AND ")})`);
      continue;
    }

    parts.push(buildFieldPredicate(model, key, value, params));
  }

  return parts;
}

function buildFieldPredicate(
  model: ModelMeta,
  field: string,
  value: unknown,
  params: unknown[],
): string {
  const col = columnOf(model, field);

  if (value === null) {
    return `${col} IS NULL`;
  }

  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  ) {
    const ops = value as Record<string, unknown>;

    if ("in" in ops) {
      const list = Array.isArray(ops.in) ? ops.in : [];
      if (list.length === 0) {
        return "1=0";
      }
      const placeholders = list.map(() => "?").join(", ");
      params.push(...list.map((item) => prepareWriteValue(model, field, item)));
      return `${col} IN (${placeholders})`;
    }

    if ("notIn" in ops) {
      const list = Array.isArray(ops.notIn) ? ops.notIn : [];
      if (list.length === 0) {
        return "1=1";
      }
      const placeholders = list.map(() => "?").join(", ");
      params.push(...list.map((item) => prepareWriteValue(model, field, item)));
      return `${col} NOT IN (${placeholders})`;
    }

    if ("not" in ops) {
      if (ops.not === null) {
        return `${col} IS NOT NULL`;
      }
      if (
        ops.not !== null &&
        typeof ops.not === "object" &&
        !Array.isArray(ops.not) &&
        !(ops.not instanceof Date)
      ) {
        const inner = buildFieldPredicate(model, field, ops.not, params);
        return `NOT (${inner})`;
      }
      params.push(prepareWriteValue(model, field, ops.not));
      return `${col} <> ?`;
    }

    const comparisons: Array<[string, string]> = [
      ["equals", "="],
      ["lt", "<"],
      ["lte", "<="],
      ["gt", ">"],
      ["gte", ">="],
    ];
    for (const [op, sqlOp] of comparisons) {
      if (op in ops) {
        if (ops[op] === null && op === "equals") {
          return `${col} IS NULL`;
        }
        params.push(prepareWriteValue(model, field, ops[op]));
        return `${col} ${sqlOp} ?`;
      }
    }

    if ("contains" in ops) {
      params.push(`%${String(ops.contains)}%`);
      return `${col} LIKE ?`;
    }
    if ("startsWith" in ops) {
      params.push(`${String(ops.startsWith)}%`);
      return `${col} LIKE ?`;
    }
    if ("endsWith" in ops) {
      params.push(`%${String(ops.endsWith)}`);
      return `${col} LIKE ?`;
    }
  }

  params.push(prepareWriteValue(model, field, value));
  return `${col} = ?`;
}

/**
 * Builds ORDER BY from object or array form.
 *
 * @param model - Model metadata
 * @param orderBy - Neon-like orderBy
 */
function buildOrderBy(
  model: ModelMeta,
  orderBy: OrderByInput | undefined,
): string {
  if (!orderBy) return "";
  const items = Array.isArray(orderBy) ? orderBy : [orderBy];
  const parts: string[] = [];
  for (const item of items) {
    for (const [field, dir] of Object.entries(item)) {
      const direction = dir === "desc" ? "DESC" : "ASC";
      parts.push(`${columnOf(model, field)} ${direction}`);
    }
  }
  return parts.length > 0 ? `ORDER BY ${parts.join(", ")}` : "";
}

function prepareWriteValue(
  model: ModelMeta,
  field: string,
  value: unknown,
): unknown {
  if (value === undefined) return null;
  if (model.jsonFields.has(field)) {
    return stringifyJson(value);
  }
  if (model.booleanFields.has(field)) {
    return Boolean(value);
  }
  return value;
}

/**
 * Maps a raw Postgres row to camelCase JS object with JSON/boolean coercion.
 *
 * @param model - Model metadata
 * @param row - Driver row
 * @param select - Optional field subset
 */
function mapRow(
  model: ModelMeta,
  row: Record<string, unknown>,
  select?: SelectInput,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [field, column] of Object.entries(model.fields)) {
    if (select && !select[field]) continue;
    if (!(column in row) && !(field in row)) {
      // selected field missing from row
      if (select?.[field]) out[field] = null;
      continue;
    }
    let value = column in row ? row[column] : row[field];
    if (model.jsonFields.has(field)) {
      value = parseJson(value, value === null ? null : {});
    } else if (model.booleanFields.has(field)) {
      value = value == null ? value : Boolean(value);
    }
    out[field] = value;
  }
  return out;
}

function selectedColumns(model: ModelMeta, select?: SelectInput): string {
  const fields = select
    ? Object.keys(select).filter((k) => select[k])
    : Object.keys(model.fields);
  if (fields.length === 0) {
    return Object.values(model.fields)
      .map((c) => `"${c}"`)
      .join(", ");
  }
  return fields.map((f) => columnOf(model, f)).join(", ");
}

function applyCreateDefaults(
  model: ModelMeta,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...model.defaultCreate, ...data };
  if (merged.id == null || merged.id === "") {
    merged.id = createId();
  }
  if ("createdAt" in model.fields && merged.createdAt === undefined) {
    merged.createdAt = new Date();
  }
  if (model.updatedAt && merged[model.updatedAt] === undefined) {
    merged[model.updatedAt] = new Date();
  }
  return merged;
}

/**
 * Loads supported include relations onto a list of parent rows.
 *
 * @param modelName - Parent model key
 * @param rows - Parent rows (camelCase)
 * @param include - Include tree
 */
async function loadIncludes(
  modelName: ModelName,
  rows: Record<string, unknown>[],
  include: IncludeInput | undefined,
): Promise<void> {
  if (!include || rows.length === 0) return;

  if (modelName === "page") {
    await loadPageIncludes(rows, include);
    return;
  }
  if (modelName === "contentItem" && include.contentType) {
    await loadBelongsTo(
      rows,
      "contentTypeId",
      "contentType",
      "contentType",
      include.contentType,
    );
    return;
  }
  if (modelName === "navigationGroup" && include.items) {
    await loadHasMany(
      rows,
      "id",
      "groupId",
      "items",
      "navigationItem",
      include.items,
      { sortOrder: "asc" },
    );
    return;
  }
  if (modelName === "pageSection") {
    if (include.subsections) {
      await loadHasMany(
        rows,
        "id",
        "sectionId",
        "subsections",
        "sectionSubsection",
        include.subsections,
        { sortOrder: "asc" },
      );
    }
    if (include.items) {
      await loadHasMany(
        rows,
        "id",
        "sectionId",
        "items",
        "sectionItem",
        include.items,
        { sortOrder: "asc" },
      );
    }
    return;
  }
  if (modelName === "sectionSubsection" && include.items) {
    await loadHasMany(
      rows,
      "id",
      "subsectionId",
      "items",
      "subsectionItem",
      include.items,
      { sortOrder: "asc" },
    );
  }
}

async function loadPageIncludes(
  pages: Record<string, unknown>[],
  include: IncludeInput,
): Promise<void> {
  if (include.courseDoc) {
    await loadHasOne(
      pages,
      "id",
      "pageId",
      "courseDoc",
      "courseDocument",
      include.courseDoc,
    );
  }

  const childSpecs: Array<{
    key: string;
    model: ModelName;
    fk: string;
    defaultOrder: OrderByInput;
  }> = [
    {
      key: "sections",
      model: "pageSection",
      fk: "pageId",
      defaultOrder: { sortOrder: "asc" },
    },
    {
      key: "packages",
      model: "pagePackage",
      fk: "pageId",
      defaultOrder: { sortOrder: "asc" },
    },
    {
      key: "gallery",
      model: "pageGalleryImage",
      fk: "pageId",
      defaultOrder: { sortOrder: "asc" },
    },
    {
      key: "cards",
      model: "pageCard",
      fk: "pageId",
      defaultOrder: { sortOrder: "asc" },
    },
    {
      key: "people",
      model: "pagePerson",
      fk: "pageId",
      defaultOrder: { sortOrder: "asc" },
    },
    {
      key: "highlights",
      model: "pageHighlight",
      fk: "pageId",
      defaultOrder: { sortOrder: "asc" },
    },
  ];

  for (const spec of childSpecs) {
    if (!include[spec.key]) continue;
    await loadHasMany(
      pages,
      "id",
      spec.fk,
      spec.key,
      spec.model,
      include[spec.key],
      spec.defaultOrder,
    );
  }
}

function includeArgs(includeVal: unknown): {
  where?: WhereInput;
  orderBy?: OrderByInput;
  select?: SelectInput;
  include?: IncludeInput;
  take?: number;
  skip?: number;
} {
  if (includeVal === true) return {};
  if (includeVal && typeof includeVal === "object") {
    return includeVal as {
      where?: WhereInput;
      orderBy?: OrderByInput;
      select?: SelectInput;
      include?: IncludeInput;
      take?: number;
      skip?: number;
    };
  }
  return {};
}

async function loadHasMany(
  parents: Record<string, unknown>[],
  parentKey: string,
  foreignKey: string,
  as: string,
  childModelName: ModelName,
  includeVal: unknown,
  defaultOrderBy: OrderByInput,
): Promise<void> {
  const args = includeArgs(includeVal);
  const ids = parents.map((p) => p[parentKey]).filter((id) => id != null);
  for (const parent of parents) parent[as] = [];
  if (ids.length === 0) return;

  const childModel = MODELS[childModelName];
  const where: WhereInput = {
    [foreignKey]: { in: ids },
    ...(args.where ?? {}),
  };
  const params: unknown[] = [];
  const whereSql = buildWhere(childModel, where, params);
  const orderSql = buildOrderBy(childModel, args.orderBy ?? defaultOrderBy);
  const cols = selectedColumns(childModel, args.select);
  let sql = `SELECT ${cols} FROM "${childModel.table}" ${whereSql} ${orderSql}`;
  if (args.skip != null) {
    sql += ` LIMIT ${Number(args.take ?? 4294967295)} OFFSET ${Number(args.skip)}`;
  } else if (args.take != null) {
    sql += ` LIMIT ${Number(args.take)}`;
  }

  const raw = await queryRows<QueryResultRow>(sql, params, getConn());
  const children = raw.map((row) => mapRow(childModel, row, args.select));

  if (args.include) {
    await loadIncludes(childModelName, children, args.include);
  }

  const byParent = new Map<unknown, Record<string, unknown>[]>();
  for (const child of children) {
    const fk = child[foreignKey];
    const list = byParent.get(fk) ?? [];
    list.push(child);
    byParent.set(fk, list);
  }
  for (const parent of parents) {
    parent[as] = byParent.get(parent[parentKey]) ?? [];
  }
}

async function loadHasOne(
  parents: Record<string, unknown>[],
  parentKey: string,
  foreignKey: string,
  as: string,
  childModelName: ModelName,
  includeVal: unknown,
): Promise<void> {
  const args = includeArgs(includeVal);
  const ids = parents.map((p) => p[parentKey]).filter((id) => id != null);
  for (const parent of parents) parent[as] = null;
  if (ids.length === 0) return;

  const childModel = MODELS[childModelName];
  const where: WhereInput = {
    [foreignKey]: { in: ids },
    ...(args.where ?? {}),
  };
  const params: unknown[] = [];
  const whereSql = buildWhere(childModel, where, params);
  const cols = selectedColumns(childModel, args.select);
  const sql = `SELECT ${cols} FROM "${childModel.table}" ${whereSql}`;
  const raw = await queryRows<QueryResultRow>(sql, params, getConn());
  const children = raw.map((row) => mapRow(childModel, row, args.select));
  if (args.include) {
    await loadIncludes(childModelName, children, args.include);
  }
  const byParent = new Map<unknown, Record<string, unknown>>();
  for (const child of children) {
    byParent.set(child[foreignKey], child);
  }
  for (const parent of parents) {
    parent[as] = byParent.get(parent[parentKey]) ?? null;
  }
}

async function loadBelongsTo(
  children: Record<string, unknown>[],
  foreignKey: string,
  as: string,
  parentModelName: ModelName,
  includeVal: unknown,
): Promise<void> {
  const args = includeArgs(includeVal);
  const ids = [
    ...new Set(children.map((c) => c[foreignKey]).filter((id) => id != null)),
  ];
  for (const child of children) child[as] = null;
  if (ids.length === 0) return;

  const parentModel = MODELS[parentModelName];
  const where: WhereInput = { id: { in: ids }, ...(args.where ?? {}) };
  const params: unknown[] = [];
  const whereSql = buildWhere(parentModel, where, params);
  const cols = selectedColumns(parentModel, args.select);
  const sql = `SELECT ${cols} FROM "${parentModel.table}" ${whereSql}`;
  const raw = await queryRows<QueryResultRow>(sql, params, getConn());
  const parents = raw.map((row) => mapRow(parentModel, row, args.select));
  const byId = new Map(parents.map((p) => [p.id, p]));
  for (const child of children) {
    child[as] = byId.get(child[foreignKey]) ?? null;
  }
}

async function findManyInternal(
  modelName: ModelName,
  args: FindArgs = {},
): Promise<Record<string, unknown>[]> {
  const model = MODELS[modelName];
  const params: unknown[] = [];
  const whereSql = buildWhere(model, args.where, params);
  const orderSql = buildOrderBy(model, args.orderBy);
  const cols = selectedColumns(model, args.select);
  let sql = `SELECT ${cols} FROM "${model.table}" ${whereSql} ${orderSql}`;
  if (args.skip != null) {
    sql += ` LIMIT ${Number(args.take ?? 4294967295)} OFFSET ${Number(args.skip)}`;
  } else if (args.take != null) {
    sql += ` LIMIT ${Number(args.take)}`;
  }
  const raw = await queryRows<QueryResultRow>(sql, params, getConn());
  const rows = raw.map((row) => mapRow(model, row, args.select));
  if (!args.select) {
    await loadIncludes(modelName, rows, args.include);
  }
  return rows;
}

async function findFirstInternal(
  modelName: ModelName,
  args: FindArgs = {},
): Promise<Record<string, unknown> | null> {
  const rows = await findManyInternal(modelName, { ...args, take: 1 });
  return rows[0] ?? null;
}

async function createInternal(
  modelName: ModelName,
  args: CreateArgs,
): Promise<Record<string, unknown>> {
  const model = MODELS[modelName];
  const data = applyCreateDefaults(model, args.data);
  const fields = Object.keys(data).filter((f) => f in model.fields);
  const cols = fields.map((f) => columnOf(model, f));
  const placeholders = fields.map(() => "?").join(", ");
  const params = fields.map((f) => prepareWriteValue(model, f, data[f]));
  await execute(
    `INSERT INTO "${model.table}" (${cols.join(", ")}) VALUES (${placeholders})`,
    params,
    getConn(),
  );
  const id = data[model.primaryKey];
  return (
    (await findFirstInternal(modelName, {
      where: { [model.primaryKey]: id },
      select: args.select,
      include: args.include,
    })) ?? { [model.primaryKey]: id }
  );
}

async function updateInternal(
  modelName: ModelName,
  args: UpdateArgs,
): Promise<Record<string, unknown>> {
  const model = MODELS[modelName];
  const data = { ...args.data };
  if (model.updatedAt && data[model.updatedAt] === undefined) {
    data[model.updatedAt] = new Date();
  }
  const fields = Object.keys(data).filter((f) => f in model.fields);
  if (fields.length === 0) {
    const existing = await findFirstInternal(modelName, {
      where: args.where,
      select: args.select,
      include: args.include,
    });
    if (!existing)
      throw new Error(`Record not found for update on ${model.table}`);
    return existing;
  }
  const sets = fields.map((f) => `${columnOf(model, f)} = ?`);
  const params: unknown[] = fields.map((f) =>
    prepareWriteValue(model, f, data[f]),
  );
  const whereSql = buildWhere(model, args.where, params);
  const result = await execute(
    `UPDATE "${model.table}" SET ${sets.join(", ")} ${whereSql}`,
    params,
    getConn(),
  );
  if (result.affectedRows === 0) {
    // still try to return matching row (no-op update)
  }
  const updated = await findFirstInternal(modelName, {
    where: args.where,
    select: args.select,
    include: args.include,
  });
  if (!updated)
    throw new Error(`Record not found for update on ${model.table}`);
  return updated;
}

async function upsertInternal(
  modelName: ModelName,
  args: UpsertArgs,
): Promise<Record<string, unknown>> {
  const existing = await findFirstInternal(modelName, {
    where: args.where,
    select: { [MODELS[modelName].primaryKey]: true },
  });
  if (existing) {
    return updateInternal(modelName, {
      where: args.where,
      data: args.update,
      select: args.select,
      include: args.include,
    });
  }
  return createInternal(modelName, {
    data: args.create,
    select: args.select,
    include: args.include,
  });
}

async function deleteInternal(
  modelName: ModelName,
  args: { where: WhereInput },
): Promise<Record<string, unknown>> {
  const existing = await findFirstInternal(modelName, { where: args.where });
  if (!existing)
    throw new Error(
      `Record not found for delete on ${MODELS[modelName].table}`,
    );
  const model = MODELS[modelName];
  const params: unknown[] = [];
  const whereSql = buildWhere(model, args.where, params);
  await execute(`DELETE FROM "${model.table}" ${whereSql}`, params, getConn());
  return existing;
}

async function deleteManyInternal(
  modelName: ModelName,
  args: { where?: WhereInput } = {},
): Promise<{ count: number }> {
  const model = MODELS[modelName];
  const params: unknown[] = [];
  const whereSql = buildWhere(model, args.where, params);
  const result = await execute(
    `DELETE FROM "${model.table}" ${whereSql || "WHERE 1=1"}`,
    params,
    getConn(),
  );
  return { count: result.affectedRows };
}

async function createManyInternal(
  modelName: ModelName,
  args: CreateManyArgs,
): Promise<{ count: number }> {
  const model = MODELS[modelName];
  const rows = (Array.isArray(args.data) ? args.data : [args.data]).map((row) =>
    applyCreateDefaults(model, row),
  );
  if (rows.length === 0) return { count: 0 };

  const fieldSet = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (key in model.fields) fieldSet.add(key);
    }
  }
  const fields = [...fieldSet];
  const cols = fields.map((f) => columnOf(model, f));
  const valueGroups: string[] = [];
  const params: unknown[] = [];
  for (const row of rows) {
    valueGroups.push(`(${fields.map(() => "?").join(", ")})`);
    for (const f of fields) {
      params.push(
        f in row
          ? prepareWriteValue(model, f, row[f])
          : prepareWriteValue(model, f, model.defaultCreate[f] ?? null),
      );
    }
  }
  const onConflict = args.skipDuplicates ? " ON CONFLICT DO NOTHING" : "";
  const result = await execute(
    `INSERT INTO "${model.table}" (${cols.join(", ")}) VALUES ${valueGroups.join(", ")}${onConflict}`,
    params,
    getConn(),
  );
  return { count: result.affectedRows };
}

async function updateManyInternal(
  modelName: ModelName,
  args: UpdateManyArgs,
): Promise<{ count: number }> {
  const model = MODELS[modelName];
  const data = { ...args.data };
  if (model.updatedAt && data[model.updatedAt] === undefined) {
    data[model.updatedAt] = new Date();
  }
  const fields = Object.keys(data).filter((f) => f in model.fields);
  if (fields.length === 0) return { count: 0 };
  const sets = fields.map((f) => `${columnOf(model, f)} = ?`);
  const params: unknown[] = fields.map((f) =>
    prepareWriteValue(model, f, data[f]),
  );
  const whereSql = buildWhere(model, args.where, params);
  const result = await execute(
    `UPDATE "${model.table}" SET ${sets.join(", ")} ${whereSql || "WHERE 1=1"}`,
    params,
    getConn(),
  );
  return { count: result.affectedRows };
}

async function countInternal(
  modelName: ModelName,
  args: { where?: WhereInput } = {},
): Promise<number> {
  const model = MODELS[modelName];
  const params: unknown[] = [];
  const whereSql = buildWhere(model, args.where, params);
  const row = await queryOne<QueryResultRow & { count: number }>(
    `SELECT COUNT(*) AS count FROM "${model.table}" ${whereSql}`,
    params,
    getConn(),
  );
  return Number(row?.count ?? 0);
}

async function aggregateInternal(
  modelName: ModelName,
  args: AggregateArgs = {},
): Promise<Record<string, unknown>> {
  const model = MODELS[modelName];
  const params: unknown[] = [];
  const whereSql = buildWhere(model, args.where, params);
  const selectParts: string[] = [];

  const addAgg = (
    prefix: "_max" | "_min" | "_avg" | "_sum",
    sqlFn: string,
    fields: Record<string, boolean> | undefined,
  ) => {
    if (!fields) return;
    for (const [field, enabled] of Object.entries(fields)) {
      if (!enabled) continue;
      selectParts.push(
        `${sqlFn}(${columnOf(model, field)}) AS "${prefix}_${field}"`,
      );
    }
  };

  addAgg("_max", "MAX", args._max);
  addAgg("_min", "MIN", args._min);
  addAgg("_avg", "AVG", args._avg);
  addAgg("_sum", "SUM", args._sum);

  if (args._count === true) {
    selectParts.push('COUNT(*) AS "_count"');
  } else if (args._count && typeof args._count === "object") {
    for (const [field, enabled] of Object.entries(args._count)) {
      if (!enabled) continue;
      if (field === "_all") {
        selectParts.push('COUNT(*) AS "_count__all"');
      } else {
        selectParts.push(
          `COUNT(${columnOf(model, field)}) AS "_count_${field}"`,
        );
      }
    }
  }

  if (selectParts.length === 0) {
    selectParts.push('COUNT(*) AS "_count"');
  }

  const row = ((await queryOne<QueryResultRow>(
    `SELECT ${selectParts.join(", ")} FROM "${model.table}" ${whereSql}`,
    params,
    getConn(),
  )) ?? {}) as Record<string, unknown>;

  const result: Record<string, unknown> = {};

  const collect = (prefix: "_max" | "_min" | "_avg" | "_sum") => {
    const fields = args[prefix];
    if (!fields) return;
    const bucket: Record<string, unknown> = {};
    for (const field of Object.keys(fields)) {
      if (!fields[field]) continue;
      bucket[field] = row[`${prefix}_${field}`] ?? null;
    }
    result[prefix] = bucket;
  };

  collect("_max");
  collect("_min");
  collect("_avg");
  collect("_sum");

  if (args._count === true) {
    result._count = Number(row._count ?? 0);
  } else if (args._count && typeof args._count === "object") {
    const bucket: Record<string, unknown> = {};
    for (const field of Object.keys(args._count)) {
      if (!args._count[field]) continue;
      if (field === "_all") {
        bucket._all = Number(row._count__all ?? 0);
      } else {
        bucket[field] = Number(row[`_count_${field}`] ?? 0);
      }
    }
    result._count = bucket;
  }

  return result;
}

/**
 * Creates a Neon-like model delegate for one table.
 * Return types are intentionally loose (`any`) so existing call sites
 * keep typechecking while migrating off `@neondatabase/serverless`.
 *
 * @param modelName - Model key
 */
function createDelegate(modelName: ModelName) {
  return {
    findUnique(args: FindArgs = {}): Promise<any> {
      return defer(() => findFirstInternal(modelName, args));
    },
    findFirst(args: FindArgs = {}): Promise<any> {
      return defer(() => findFirstInternal(modelName, args));
    },
    findMany(args: FindArgs = {}): Promise<any[]> {
      return defer(() => findManyInternal(modelName, args));
    },
    create(args: CreateArgs): Promise<any> {
      return defer(() => createInternal(modelName, args));
    },
    update(args: UpdateArgs): Promise<any> {
      return defer(() => updateInternal(modelName, args));
    },
    upsert(args: UpsertArgs): Promise<any> {
      return defer(() => upsertInternal(modelName, args));
    },
    delete(args: { where: WhereInput }): Promise<any> {
      return defer(() => deleteInternal(modelName, args));
    },
    deleteMany(args: { where?: WhereInput } = {}): Promise<{ count: number }> {
      return defer(() => deleteManyInternal(modelName, args));
    },
    createMany(args: CreateManyArgs): Promise<{ count: number }> {
      return defer(() => createManyInternal(modelName, args));
    },
    updateMany(args: UpdateManyArgs): Promise<{ count: number }> {
      return defer(() => updateManyInternal(modelName, args));
    },
    count(args: { where?: WhereInput } = {}): Promise<number> {
      return defer(() => countInternal(modelName, args));
    },
    aggregate(args: AggregateArgs = {}): Promise<any> {
      return defer(() => aggregateInternal(modelName, args));
    },
  };
}

export type ModelDelegate = ReturnType<typeof createDelegate>;

export type DbClient = {
  [K in ModelName]: ModelDelegate;
} & {
  /**
   * Runs work in a transaction (callback) or sequentially awaits deferred ops (array).
   */
  $transaction: {
    <T>(fn: (tx: DbClient) => Promise<T>): Promise<T>;
    <T>(ops: Promise<T>[]): Promise<T[]>;
  };
  /** Runs a parameterized raw SQL query and returns rows. */
  $queryRawUnsafe: <T = Record<string, unknown>[]>(
    sql: string,
    ...params: unknown[]
  ) => Promise<T>;
  /** Runs a parameterized raw SQL statement (INSERT/UPDATE/DELETE). */
  $executeRawUnsafe: (sql: string, ...params: unknown[]) => Promise<number>;
  /** Releases the shared Neon Postgres pool. */
  $disconnect: () => Promise<void>;
};

/**
 * Builds the Neon-compatible Neon client (model delegates + transaction helpers).
 */
function createDbClient(): DbClient {
  const client = {} as DbClient;

  for (const name of Object.keys(MODELS) as ModelName[]) {
    client[name] = createDelegate(name);
  }

  client.$transaction = ((
    arg: ((tx: DbClient) => Promise<unknown>) | Promise<unknown>[],
  ) => {
    if (Array.isArray(arg)) {
      return withTransaction(async (conn) => {
        return txStorage.run(conn, async () => {
          const results: unknown[] = [];
          for (const op of arg) {
            results.push(await op);
          }
          return results;
        });
      });
    }
    return withTransaction(async (conn) => {
      return txStorage.run(conn, () => arg(client));
    });
  }) as DbClient["$transaction"];

  client.$queryRawUnsafe = <T = Record<string, unknown>[]>(
    sql: string,
    ...params: unknown[]
  ) =>
    defer(async () => {
      const rows = await queryRows<QueryResultRow>(sql, params, getConn());
      return rows as unknown as T;
    });

  client.$executeRawUnsafe = (sql: string, ...params: unknown[]) =>
    defer(async () => {
      const result = await execute(sql, params, getConn());
      return result.affectedRows;
    });

  client.$disconnect = async () => {
    const globalForPool = globalThis as unknown as {
      neonPool?: { end: () => Promise<void> };
    };
    if (globalForPool.neonPool) {
      await globalForPool.neonPool.end();
      globalForPool.neonPool = undefined;
    }
  };

  return client;
}

const globalForDb = globalThis as unknown as { neonDb?: DbClient };

/**
 * Shared Neon Neon-compatible client (singleton in dev to survive HMR).
 * Drop-in replacement for `@neondatabase/serverless` model delegates used by the CMS.
 */
export const db: DbClient = globalForDb.neonDb ?? createDbClient();

if (process.env.NODE_ENV !== "production") {
  globalForDb.neonDb = db;
}
