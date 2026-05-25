/**
 * PostgreSQL JSONB 集合（兼容 Mongoose Model 常用 API）
 */
import { getPool } from "./pg-pool.js";
import { filterToSql } from "./filter.js";
import { applyUpdate } from "./update.js";
import { PgDocument, wrapRow, type DocRecord } from "./document.js";
import { PgQuery } from "./query.js";
import { tableName } from "./table.js";

const collectionRegistry = new Map<string, PgCollection>();

export class PgCollection {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  find(filter: DocRecord = {}) {
    return new PgQuery(this.name, filter);
  }

  findOne(filter: DocRecord = {}) {
    return new PgQuery(this.name, filter).limit(1).exec().then((rows) => {
      const list = rows as unknown[];
      if (!list || !list.length) {
        return null;
      }
      return list[0];
    });
  }

  async countDocuments(filter: DocRecord = {}): Promise<number> {
    const pool = getPool();
    const tbl = tableName(this.name);
    const { where, params } = filterToSql(filter);
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${tbl} WHERE ${where}`,
      params
    );
    return res.rows[0].c;
  }

  async remove(filter: DocRecord = {}) {
    const pool = getPool();
    const tbl = tableName(this.name);
    const { where, params } = filterToSql(filter);
    const res = await pool.query(`DELETE FROM ${tbl} WHERE ${where}`, params);
    return { deletedCount: res.rowCount, n: res.rowCount };
  }

  async update(filter: DocRecord, updateDoc: DocRecord, _options?: DocRecord) {
    return this._updateMany(filter, updateDoc);
  }

  async updateOne(filter: DocRecord, updateDoc: DocRecord, _options?: DocRecord) {
    return this._updateMany(filter, updateDoc, 1);
  }

  async _updateMany(filter: DocRecord, updateDoc: DocRecord, max = 0) {
    const pool = getPool();
    const tbl = tableName(this.name);
    const { where, params } = filterToSql(filter);
    const res = await pool.query(
      `SELECT _id, doc FROM ${tbl} WHERE ${where}`,
      params
    );
    let modified = 0;
    for (const row of res.rows) {
      const merged = applyUpdate(row.doc as DocRecord, updateDoc, filter);
      await pool.query(`UPDATE ${tbl} SET doc = $1::jsonb WHERE _id = $2`, [
        JSON.stringify(merged),
        row._id,
      ]);
      modified++;
      if (max > 0 && modified >= max) {
        break;
      }
    }
    return { n: modified, nModified: modified, ok: 1 };
  }

  aggregate(pipeline: DocRecord[]) {
    const self = this;
    const runner = {
      async exec() {
        return self._runAggregate(pipeline);
      },
      cursor() {
        const data: unknown[] = [];
        return {
          exec: async () => data,
          eachAsync: async (fn: (doc: unknown) => void) => {
            const rows = await self._runAggregate(pipeline);
            for (const row of rows) {
              await fn(row);
              data.push(row);
            }
          },
        };
      },
    };
    return runner;
  }

  /** 统计插件：按 date 分组计数 */
  async _runAggregate(pipeline: DocRecord[]): Promise<DocRecord[]> {
    const pool = getPool();
    const tbl = tableName(this.name);
    let match: DocRecord = {};
    for (const stage of pipeline) {
      if (stage.$match) {
        match = { ...match, ...(stage.$match as DocRecord) };
      }
    }
    const dateFilter = match.date as DocRecord | string | undefined;
    if (dateFilter && typeof dateFilter === "object" && dateFilter.$gt != null) {
      const res = await pool.query(
        `SELECT doc->>'date' AS _id, COUNT(*)::int AS count
         FROM ${tbl}
         WHERE doc->>'date' > $1 AND doc->>'date' <= $2
         GROUP BY doc->>'date'
         ORDER BY doc->>'date' ASC`,
        [String(dateFilter.$gt), String(dateFilter.$lte)]
      );
      return res.rows;
    }
    return [];
  }
}

export function registerCollection(name: string): PgCollection {
  let col = collectionRegistry.get(name);
  if (!col) {
    col = new PgCollection(name);
    collectionRegistry.set(name, col);
  }
  return col;
}

/** 兼容 yapi.db(modelName, schema)：合并 Model 构造器与集合方法 */
export function createPgModel(collection: string, _schema?: unknown): PgCollection & {
  new (data: DocRecord): PgDocument;
} {
  const col = registerCollection(collection);
  class Model extends PgDocument {
    constructor(data: DocRecord) {
      super(collection, data || {}, true);
    }
  }
  return Object.assign(Model, col) as PgCollection & {
    new (data: DocRecord): PgDocument;
  };
}
