// @ts-nocheck
/**
 * 测试集合（interface_col）关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import yapi from "../runtime.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import {
  interfaceColFromRow,
  INTERFACE_COL_SELECT,
  jsonCol,
  sqlColumnName,
} from "../db/relational.js";
import type { DocRecord } from "../db/where.js";

const TBL = tableName("interface_col");

const LIST_FIELDS = [
  "name",
  "uid",
  "project_id",
  "desc",
  "add_time",
  "up_time",
  "index",
  "checkHttpCodeIs200",
  "checkResponseSchema",
  "checkResponseField",
  "checkScript",
];

function pickColFields(doc: DocRecord, fields?: string[]) {
  if (!fields?.length) {
    return doc;
  }
  const out: DocRecord = {};
  for (const f of fields) {
    if (doc[f] !== undefined) {
      out[f] = doc[f];
    }
  }
  if (doc._id !== undefined) {
    out._id = doc._id;
  }
  return out;
}

async function fetchOne(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  if (!res.rows.length) {
    return null;
  }
  return interfaceColFromRow(res.rows[0]);
}

async function fetchMany(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  return res.rows.map((row) => interfaceColFromRow(row));
}

export type InterfaceColRepository = ModelInstance;

export const interfaceColRepository: InterfaceColRepository = {
  async save(data: DocRecord) {
    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO ${TBL}
        (name, project_id, uid, description, "index", add_time, up_time,
         checkHttpCodeIs200, checkResponseSchema, checkResponseField, checkScript)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb)
       RETURNING ${INTERFACE_COL_SELECT}`,
      [
        data.name ?? "",
        data.project_id ?? 0,
        data.uid ?? 0,
        data.desc ?? "",
        data.index ?? 0,
        data.add_time,
        data.up_time,
        data.checkHttpCodeIs200 ?? false,
        data.checkResponseSchema ?? false,
        jsonCol(data.checkResponseField, {}),
        jsonCol(data.checkScript, {}),
      ]
    );
    return interfaceColFromRow(res.rows[0]);
  },

  async get(id: number | string) {
    return fetchOne(`SELECT ${INTERFACE_COL_SELECT} FROM ${TBL} WHERE _id = $1`, [id]);
  },

  async checkRepeat(name: string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL} WHERE name = $1`,
      [name]
    );
    return res.rows[0].c;
  },

  async list(project_id: number | string) {
    return fetchMany(
      `SELECT ${INTERFACE_COL_SELECT} FROM ${TBL} WHERE project_id = $1 ORDER BY "index" ASC`,
      [project_id]
    ).then((rows) => rows.map((r) => pickColFields(r, LIST_FIELDS)));
  },

  async del(id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE _id = $1`, [id]);
    return res.rowCount;
  },

  async delByProjectId(id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE project_id = $1`, [id]);
    return res.rowCount;
  },

  async update(id: number | string, data: DocRecord) {
    const pool = getPool();
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    const scalarCols = [
      "name",
      "project_id",
      "uid",
      "desc",
      "index",
      "add_time",
      "up_time",
      "checkHttpCodeIs200",
      "checkResponseSchema",
    ] as const;
    for (const col of scalarCols) {
      if (data[col] !== undefined) {
        sets.push(`${sqlColumnName(col)} = $${idx}`);
        params.push(data[col]);
        idx += 1;
      }
    }
    if (data.checkResponseField !== undefined) {
      sets.push(`checkResponseField = $${idx}::jsonb`);
      params.push(jsonCol(data.checkResponseField));
      idx += 1;
    }
    if (data.checkScript !== undefined) {
      sets.push(`checkScript = $${idx}::jsonb`);
      params.push(jsonCol(data.checkScript));
      idx += 1;
    }
    if (!sets.length) {
      return 0;
    }
    params.push(id);
    await pool.query(
      `UPDATE ${TBL} SET ${sets.join(", ")} WHERE _id = $${idx}`,
      params
    );
    return 1;
  },

  async up(id: number | string, data: DocRecord) {
    data.up_time = yapi.commons.time();
    return this.update(id, data);
  },

  async upColIndex(id: number | string, index: number) {
    const pool = getPool();
    await pool.query(`UPDATE ${TBL} SET "index" = $1 WHERE _id = $2`, [index, id]);
    return 1;
  },
};
