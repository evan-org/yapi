// @ts-nocheck
/**
 * 测试用例（interface_case）关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import { nowSeconds } from "../shared/clock.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import {
  interfaceCaseFromRow,
  INTERFACE_CASE_SELECT,
  jsonCol,
} from "../db/relational.js";
import type { DocRecord } from "../db/where.js";

const TBL = tableName("interface_case");

const JSONB_COLS = ["req_headers", "req_query", "req_params", "req_body_form"] as const;

const SCALAR_COLS = [
  "uid",
  "casename",
  "col_id",
  "interface_id",
  "project_id",
  "index",
  "add_time",
  "up_time",
  "case_env",
  "req_body_type",
  "req_body_other",
  "test_script",
] as const;

function parseSelectFields(select?: string | string[]) {
  if (!select) {
    return undefined;
  }
  if (select === "all") {
    return undefined;
  }
  if (Array.isArray(select)) {
    return select;
  }
  return select.trim().split(/\s+/).filter(Boolean);
}

function pickCaseFields(doc: DocRecord, fields?: string[]) {
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

function selectCols(fields?: string[]) {
  if (!fields?.length) {
    return INTERFACE_CASE_SELECT;
  }
  const cols = new Set<string>(["_id"]);
  for (const f of fields) {
    if (f === "index") {
      cols.add('"index"');
    } else {
      cols.add(f);
    }
  }
  return Array.from(cols).join(", ");
}

async function fetchOne(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  if (!res.rows.length) {
    return null;
  }
  return interfaceCaseFromRow(res.rows[0]);
}

async function fetchMany(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  return res.rows.map((row) => interfaceCaseFromRow(row));
}

export type InterfaceCaseRepository = ModelInstance;

export const interfaceCaseRepository: InterfaceCaseRepository = {
  async save(data: DocRecord) {
    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO ${TBL}
        (uid, casename, col_id, interface_id, project_id, "index", add_time, up_time,
         case_env, req_body_type, req_body_other, test_script,
         req_headers, req_query, req_params, req_body_form)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14::jsonb,$15::jsonb,$16::jsonb)
       RETURNING ${INTERFACE_CASE_SELECT}`,
      [
        data.uid ?? 0,
        data.casename ?? "",
        data.col_id ?? 0,
        data.interface_id ?? 0,
        data.project_id ?? 0,
        data.index ?? 0,
        data.add_time,
        data.up_time,
        data.case_env ?? "",
        data.req_body_type ?? "",
        data.req_body_other ?? "",
        data.test_script ?? "",
        jsonCol(data.req_headers, []),
        jsonCol(data.req_query, []),
        jsonCol(data.req_params, []),
        jsonCol(data.req_body_form, []),
      ]
    );
    return interfaceCaseFromRow(res.rows[0]);
  },

  async getInterfaceCaseListCount() {
    const pool = getPool();
    const res = await pool.query(`SELECT COUNT(*)::int AS c FROM ${TBL}`);
    return res.rows[0].c;
  },

  async get(id: number | string) {
    return fetchOne(`SELECT ${INTERFACE_CASE_SELECT} FROM ${TBL} WHERE _id = $1`, [id]);
  },

  async list(col_id: number | string, select?: string) {
    const fields = parseSelectFields(
      select || "casename uid col_id _id index interface_id project_id"
    );
    const cols = selectCols(fields);
    return fetchMany(
      `SELECT ${cols} FROM ${TBL} WHERE col_id = $1 ORDER BY "index" ASC`,
      [col_id]
    ).then((rows) => rows.map((r) => pickCaseFields(r, fields)));
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

  async delByInterfaceId(id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE interface_id = $1`, [id]);
    return res.rowCount;
  },

  async delByCol(id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE col_id = $1`, [id]);
    return res.rowCount;
  },

  async update(id: number | string, data: DocRecord) {
    const pool = getPool();
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    for (const col of SCALAR_COLS) {
      if (data[col] !== undefined) {
        const sqlCol = col === "index" ? '"index"' : col;
        sets.push(`${sqlCol} = $${idx}`);
        params.push(data[col]);
        idx += 1;
      }
    }
    for (const col of JSONB_COLS) {
      if (data[col] !== undefined) {
        sets.push(`${col} = $${idx}::jsonb`);
        params.push(jsonCol(data[col]));
        idx += 1;
      }
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
    data.up_time = nowSeconds();
    return this.update(id, data);
  },

  async upCaseIndex(id: number | string, index: number) {
    const pool = getPool();
    await pool.query(`UPDATE ${TBL} SET "index" = $1 WHERE _id = $2`, [index, id]);
    return 1;
  },
};
