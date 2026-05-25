/**
 * 链式查询（兼容 find().select().sort().skip().limit().exec()）
 */
import { getPool } from "./pg-pool.js";
import { filterToSql } from "./filter.js";
import { wrapRow, type DocRecord } from "./document.js";
import { tableName } from "./table.js";

export class PgQuery {
  _table: string;
  _filter: DocRecord;
  _select?: string;
  _sort?: Record<string, 1 | -1>;
  _skip = 0;
  _limit = 0;
  _lean = false;

  constructor(table: string, filter: DocRecord = {}) {
    this._table = table;
    this._filter = filter;
  }

  select(fields: string | Record<string, number>) {
    if (typeof fields === "string") {
      this._select = fields.replace(/\s+/g, " ").trim();
    } else {
      this._select = Object.keys(fields)
        .filter((k) => (fields as Record<string, number>)[k])
        .join(" ");
    }
    return this;
  }

  sort(spec: Record<string, 1 | -1>) {
    this._sort = spec;
    return this;
  }

  skip(n: number) {
    this._skip = Number(n) || 0;
    return this;
  }

  limit(n: number) {
    this._limit = Number(n) || 0;
    return this;
  }

  lean() {
    this._lean = true;
    return this;
  }

  _pickFields(obj: DocRecord): DocRecord {
    if (!this._select) {
      return obj;
    }
    const fields = this._select.split(" ");
    const out: DocRecord = {};
    for (const f of fields) {
      if (f && obj[f] !== undefined) {
        out[f] = obj[f];
      }
    }
    if (fields.includes("_id") || fields.some((f) => f.startsWith("_id"))) {
      out._id = obj._id;
    }
    return out;
  }

  async exec(): Promise<unknown> {
    const pool = getPool();
    const tbl = tableName(this._table);
    const { where, params } = filterToSql(this._filter);
    let sql = `SELECT _id, doc FROM ${tbl} WHERE ${where}`;
    const orderParts: string[] = [];
    if (this._sort) {
      for (const [key, dir] of Object.entries(this._sort)) {
        const col = key === "_id" ? "_id" : `(doc->>'${key}')`;
        orderParts.push(`${col} ${dir === -1 ? "DESC" : "ASC"}`);
      }
    }
    if (orderParts.length) {
      sql += ` ORDER BY ${orderParts.join(", ")}`;
    } else {
      sql += " ORDER BY _id DESC";
    }
    if (this._limit > 0) {
      sql += ` LIMIT ${this._limit}`;
    }
    if (this._skip > 0) {
      sql += ` OFFSET ${this._skip}`;
    }
    const res = await pool.query(sql, params);
    const rows = res.rows.map((row: { _id: number; doc: DocRecord }) => {
      const doc = wrapRow(this._table, row);
      const obj = doc.toObject();
      return this._lean ? this._pickFields(obj) : doc;
    });
    return rows;
  }
}
