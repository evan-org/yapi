// @ts-nocheck
/**
 * PostgreSQL JSONB 表访问（原生 API，无 Mongoose 兼容层）
 */
import { getPool } from "./pg-pool.js";
import { buildWhere, type DocRecord } from "./where.js";
import { tableName } from "./table.js";

export type { DocRecord };

export type QueryOpts = {
  fields?: string[];
  exclude?: string[];
  sort?: Record<string, 1 | -1>;
  skip?: number;
  limit?: number;
};

const tableCache = new Map<string, TableStore>();

/** 空格分隔字段串 → 数组 */
export function parseFieldList(spec?: string): string[] | undefined {
  if (!spec) {
    return undefined;
  }
  return spec.trim().split(/\s+/).filter(Boolean);
}

function rowToDoc(row: { _id: number; doc: DocRecord }): DocRecord {
  return { ...(row.doc || {}), _id: row._id };
}

function pickFields(doc: DocRecord, opts?: QueryOpts): DocRecord {
  if (!opts?.fields?.length && !opts?.exclude?.length) {
    return doc;
  }
  const out: DocRecord = {};
  if (opts.fields?.length) {
    for (const f of opts.fields) {
      if (doc[f] !== undefined) {
        out[f] = doc[f];
      }
    }
    if (doc._id !== undefined) {
      out._id = doc._id;
    }
    return out;
  }
  for (const key of Object.keys(doc)) {
    if (!opts.exclude?.includes(key)) {
      out[key] = doc[key];
    }
  }
  return out;
}

export class TableStore {
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  private tbl(): string {
    return tableName(this.name);
  }

  async insert(doc: DocRecord): Promise<DocRecord> {
    const pool = getPool();
    const payload = { ...doc };
    delete payload._id;
    const res = await pool.query(
      `INSERT INTO ${this.tbl()} (doc) VALUES ($1::jsonb) RETURNING _id`,
      [JSON.stringify(payload)]
    );
    return { ...payload, _id: res.rows[0]._id };
  }

  async findById(id: number, opts?: QueryOpts): Promise<DocRecord | null> {
    return this.findOne({ _id: id }, opts);
  }

  async findOne(where: DocRecord, opts?: QueryOpts): Promise<DocRecord | null> {
    const rows = await this.findMany(where, { ...opts, limit: 1 });
    return rows[0] || null;
  }

  async findMany(where: DocRecord = {}, opts?: QueryOpts): Promise<DocRecord[]> {
    const pool = getPool();
    const { where: w, params } = buildWhere(where);
    let sql = `SELECT _id, doc FROM ${this.tbl()} WHERE ${w}`;
    const orderParts: string[] = [];
    if (opts?.sort) {
      for (const [key, dir] of Object.entries(opts.sort)) {
        const col = key === "_id" ? "_id" : `(doc->>'${key}')`;
        orderParts.push(`${col} ${dir === -1 ? "DESC" : "ASC"}`);
      }
    }
    if (orderParts.length) {
      sql += ` ORDER BY ${orderParts.join(", ")}`;
    } else {
      sql += " ORDER BY _id DESC";
    }
    if (opts?.limit > 0) {
      sql += ` LIMIT ${opts.limit}`;
    }
    if (opts?.skip > 0) {
      sql += ` OFFSET ${opts.skip}`;
    }
    const res = await pool.query(sql, params);
    return res.rows.map((row) => pickFields(rowToDoc(row), opts));
  }

  async count(where: DocRecord = {}): Promise<number> {
    const pool = getPool();
    const { where: w, params } = buildWhere(where);
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${this.tbl()} WHERE ${w}`,
      params
    );
    return res.rows[0].c;
  }

  async delete(where: DocRecord): Promise<number> {
    const pool = getPool();
    const { where: w, params } = buildWhere(where);
    const res = await pool.query(`DELETE FROM ${this.tbl()} WHERE ${w}`, params);
    return res.rowCount || 0;
  }

  /** 浅合并 patch 到 doc（顶层键） */
  async updateById(id: number, patch: DocRecord): Promise<void> {
    const pool = getPool();
    const payload = { ...patch };
    delete payload._id;
    await pool.query(
      `UPDATE ${this.tbl()} SET doc = doc || $1::jsonb WHERE _id = $2`,
      [JSON.stringify(payload), id]
    );
  }

  async updateWhere(where: DocRecord, patch: DocRecord, max = 0): Promise<number> {
    const pool = getPool();
    const { where: w, params } = buildWhere(where);
    const res = await pool.query(`SELECT _id FROM ${this.tbl()} WHERE ${w}`, params);
    const payload = { ...patch };
    delete payload._id;
    let n = 0;
    for (const row of res.rows) {
      await pool.query(
        `UPDATE ${this.tbl()} SET doc = doc || $1::jsonb WHERE _id = $2`,
        [JSON.stringify(payload), row._id]
      );
      n++;
      if (max > 0 && n >= max) {
        break;
      }
    }
    return n;
  }

  /** 读-改-写整份文档 */
  async mutateById(id: number, fn: (doc: DocRecord) => DocRecord): Promise<DocRecord | null> {
    const pool = getPool();
    const res = await pool.query(`SELECT _id, doc FROM ${this.tbl()} WHERE _id = $1`, [id]);
    if (!res.rows.length) {
      return null;
    }
    const row = res.rows[0];
    const next = fn(rowToDoc(row));
    const payload = { ...next };
    const rowId = payload._id;
    delete payload._id;
    await pool.query(`UPDATE ${this.tbl()} SET doc = $1::jsonb WHERE _id = $2`, [
      JSON.stringify(payload),
      rowId,
    ]);
    return { ...payload, _id: rowId };
  }

  async mutateWhere(
    where: DocRecord,
    fn: (doc: DocRecord) => DocRecord,
    max = 0
  ): Promise<number> {
    const pool = getPool();
    const { where: w, params } = buildWhere(where);
    const res = await pool.query(`SELECT _id, doc FROM ${this.tbl()} WHERE ${w}`, params);
    let n = 0;
    for (const row of res.rows) {
      const next = fn(rowToDoc(row));
      const payload = { ...next };
      delete payload._id;
      await pool.query(`UPDATE ${this.tbl()} SET doc = $1::jsonb WHERE _id = $2`, [
        JSON.stringify(payload),
        row._id,
      ]);
      n++;
      if (max > 0 && n >= max) {
        break;
      }
    }
    return n;
  }

  /** 统计插件：按 date 分组计数 */
  async countByDateRange(start: string, end: string): Promise<DocRecord[]> {
    const pool = getPool();
    const res = await pool.query(
      `SELECT doc->>'date' AS _id, COUNT(*)::int AS count
       FROM ${this.tbl()}
       WHERE doc->>'date' > $1 AND doc->>'date' <= $2
       GROUP BY doc->>'date'
       ORDER BY doc->>'date' ASC`,
      [String(start), String(end)]
    );
    return res.rows;
  }
}

export function getTable(name: string): TableStore {
  let t = tableCache.get(name);
  if (!t) {
    t = new TableStore(name);
    tableCache.set(name, t);
  }
  return t;
}
