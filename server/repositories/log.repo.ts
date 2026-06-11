// @ts-nocheck
/**
 * 操作日志（log）关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import { nowSeconds } from "../shared/clock.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import { jsonCol, logFromRow, LOG_SELECT } from "../db/relational.js";
import type { DocRecord } from "../db/where.js";

const TBL = tableName("log");

/** typeid + type + 可选 data 子字段过滤 */
function buildLogWhere(
  typeid: number | string,
  type: string,
  selectValue?: string | number
) {
  const clauses = ["typeid = $1", "type = $2"];
  const params: unknown[] = [typeid, type];
  if (selectValue === "wiki") {
    params.push(selectValue);
    clauses.push(`data->>'type' = $${params.length}`);
  } else if (selectValue != null && selectValue !== "" && !isNaN(Number(selectValue))) {
    params.push(String(+selectValue));
    clauses.push(`data->>'interface_id' = $${params.length}`);
  }
  return { where: clauses.join(" AND "), params };
}

function pickLogFields(doc: DocRecord, fields?: string[]) {
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

async function fetchMany(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  return res.rows.map((row) => logFromRow(row));
}

export type LogRepository = ModelInstance;

export const logRepository: LogRepository = {
  async save(data: DocRecord) {
    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO ${TBL}
        (content, type, uid, username, typeid, add_time, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
       RETURNING ${LOG_SELECT}`,
      [
        data.content ?? "",
        data.type ?? "",
        data.uid ?? 0,
        data.username ?? "",
        data.typeid ?? 0,
        nowSeconds(),
        jsonCol(data.data, {}),
      ]
    );
    return logFromRow(res.rows[0]);
  },

  async del(id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE _id = $1`, [id]);
    return res.rowCount;
  },

  async list(typeid: number | string, type: string) {
    const { where, params } = buildLogWhere(typeid, type);
    return fetchMany(
      `SELECT ${LOG_SELECT} FROM ${TBL} WHERE ${where} ORDER BY add_time DESC`,
      params
    );
  },

  async listWithPaging(
    typeid: number | string,
    type: string,
    page: number | string,
    limit: number | string,
    selectValue?: string | number
  ) {
    const p = parseInt(String(page), 10);
    const l = parseInt(String(limit), 10);
    const { where, params } = buildLogWhere(typeid, type, selectValue);
    return fetchMany(
      `SELECT ${LOG_SELECT} FROM ${TBL} WHERE ${where}
       ORDER BY add_time DESC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, (p - 1) * l, l]
    );
  },

  async listWithPagingByGroup(
    typeid: number | string,
    pidList: (number | string)[] = [],
    page: number | string,
    limit: number | string
  ) {
    const p = parseInt(String(page), 10);
    const l = parseInt(String(limit), 10);
    const pool = getPool();
    const ids = pidList.map((id) => Number(id));
    const res = await pool.query(
      `SELECT ${LOG_SELECT} FROM ${TBL}
       WHERE (type = 'group' AND typeid = $1)
          OR (type = 'project' AND typeid = ANY($2::bigint[]))
       ORDER BY add_time DESC OFFSET $3 LIMIT $4`,
      [typeid, ids, (p - 1) * l, l]
    );
    return res.rows.map((row) => logFromRow(row));
  },

  async listCountByGroup(typeid: number | string, pidList: (number | string)[] = []) {
    const pool = getPool();
    const ids = pidList.map((id) => Number(id));
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL}
       WHERE (type = 'group' AND typeid = $1)
          OR (type = 'project' AND typeid = ANY($2::bigint[]))`,
      [typeid, ids]
    );
    return res.rows[0].c;
  },

  async listCount(
    typeid: number | string,
    type: string,
    selectValue?: string | number
  ) {
    const { where, params } = buildLogWhere(typeid, type, selectValue);
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL} WHERE ${where}`,
      params
    );
    return res.rows[0].c;
  },

  async listWithCatid(
    typeid: number | string,
    type: string,
    interfaceId?: string | number
  ) {
    const { where, params } = buildLogWhere(typeid, type);
    let sql = `SELECT ${LOG_SELECT} FROM ${TBL} WHERE ${where}`;
    const allParams = [...params];
    if (interfaceId != null && interfaceId !== "" && !isNaN(Number(interfaceId))) {
      allParams.push(String(+interfaceId));
      sql += ` AND data->>'interface_id' = $${allParams.length}`;
    }
    sql += ` ORDER BY add_time DESC LIMIT 1`;
    const rows = await fetchMany(sql, allParams);
    return rows.map((r) =>
      pickLogFields(r, ["uid", "content", "type", "username", "typeid", "add_time"])
    );
  },
};
