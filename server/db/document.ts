/**
 * 兼容 Mongoose Document：提供 toObject / save，供 services 层无感迁移
 */
import { getPool } from "./pg-pool.js";
import { tableName } from "./table.js";

export type DocRecord = Record<string, unknown>;

/** 将表行转为业务对象（_id 与 doc 字段合并） */
export function rowToObject(row: { _id: number; doc: DocRecord }): DocRecord {
  const doc = { ...(row.doc || {}) };
  doc._id = row._id;
  return doc;
}

export class PgDocument {
  _id?: number;
  _doc: DocRecord;
  _table: string;
  _isNew: boolean;

  constructor(table: string, data: DocRecord, isNew = false) {
    this._table = table;
    this._isNew = isNew;
    this._doc = { ...data };
    if (this._doc._id != null) {
      this._id = Number(this._doc._id);
      delete this._doc._id;
    }
  }

  toObject(): DocRecord {
    const out = { ...this._doc };
    if (this._id != null) {
      out._id = this._id;
    }
    out.toObject = () => this.toObject();
    return out;
  }

  async save(): Promise<PgDocument> {
    const pool = getPool();
    const tbl = tableName(this._table);
    if (this._isNew || this._id == null) {
      const res = await pool.query(
        `INSERT INTO ${tbl} (doc) VALUES ($1::jsonb) RETURNING _id`,
        [JSON.stringify(this._doc)]
      );
      this._id = res.rows[0]._id;
      this._isNew = false;
    } else {
      await pool.query(`UPDATE ${tbl} SET doc = $1::jsonb WHERE _id = $2`, [
        JSON.stringify(this._doc),
        this._id,
      ]);
    }
    return this;
  }
}

export function wrapRow(table: string, row: { _id: number; doc: DocRecord }): PgDocument {
  return new PgDocument(table, rowToObject(row), false);
}
