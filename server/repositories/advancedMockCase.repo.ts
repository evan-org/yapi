// @ts-nocheck
/**
 * 高级 Mock 期望（adv_mock_case）关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import yapi from "../runtime.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import {
  advancedMockCaseFromRow,
  ADV_MOCK_CASE_SELECT,
  jsonCol,
} from "../db/relational.js";
import type { DocRecord } from "../db/where.js";

const TBL = tableName("adv_mock_case");

/** 将 findOne 条件转为 SQL（支持 params.xxx 子键） */
function buildCaseWhere(where: DocRecord) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  let idx = 1;
  const cols = ["_id", "project_id", "interface_id", "ip_enable", "ip", "name"] as const;
  for (const col of cols) {
    if (where[col] !== undefined) {
      const sqlCol = col === "_id" ? "_id" : col;
      clauses.push(`${sqlCol} = $${idx}`);
      params.push(where[col]);
      idx += 1;
    }
  }
  const paramSubset: DocRecord = {};
  for (const key of Object.keys(where)) {
    if (key.startsWith("params.")) {
      paramSubset[key.slice(7)] = where[key];
    }
  }
  if (Object.keys(paramSubset).length) {
    clauses.push(`params @> $${idx}::jsonb`);
    params.push(jsonCol(paramSubset, {}));
    idx += 1;
  }
  return {
    where: clauses.length ? clauses.join(" AND ") : "TRUE",
    params,
  };
}

async function fetchOne(where: DocRecord) {
  const pool = getPool();
  const { where: w, params } = buildCaseWhere(where);
  const res = await pool.query(`SELECT ${ADV_MOCK_CASE_SELECT} FROM ${TBL} WHERE ${w} LIMIT 1`, params);
  if (!res.rows.length) {
    return null;
  }
  return advancedMockCaseFromRow(res.rows[0]);
}

async function fetchMany(sql: string, sqlParams: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, sqlParams);
  return res.rows.map((row) => advancedMockCaseFromRow(row));
}

export type AdvancedMockCaseRepository = ModelInstance;

export const advancedMockCaseRepository: AdvancedMockCaseRepository = {
  async get(data: DocRecord) {
    return fetchOne(data);
  },

  async list(id: number | string) {
    return fetchMany(
      `SELECT ${ADV_MOCK_CASE_SELECT} FROM ${TBL} WHERE interface_id = $1 ORDER BY _id DESC`,
      [id]
    );
  },

  /** mock_after 匹配期望（替代原 model.find） */
  async listForMock(
    interface_id: number | string,
    filter: { ip_enable: boolean; ip?: string }
  ) {
    const clauses = ["interface_id = $1", "ip_enable = $2"];
    const params: unknown[] = [interface_id, filter.ip_enable];
    if (filter.ip_enable && filter.ip != null) {
      clauses.push("ip = $3");
      params.push(filter.ip);
    }
    return fetchMany(
      `SELECT _id, params, case_enable FROM ${TBL} WHERE ${clauses.join(" AND ")}`,
      params
    );
  },

  async delByInterfaceId(interface_id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE interface_id = $1`, [interface_id]);
    return res.rowCount || 0;
  },

  async delByProjectId(project_id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE project_id = $1`, [project_id]);
    return res.rowCount || 0;
  },

  async save(data: DocRecord) {
    const pool = getPool();
    const up_time = yapi.commons.time();
    const res = await pool.query(
      `INSERT INTO ${TBL}
        (interface_id, project_id, ip_enable, name, params, uid, code, delay, headers, up_time, res_body, ip, case_enable)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9::jsonb, $10, $11, $12, $13)
       RETURNING ${ADV_MOCK_CASE_SELECT}`,
      [
        data.interface_id ?? 0,
        data.project_id ?? 0,
        data.ip_enable === true,
        data.name ?? "",
        jsonCol(data.params, {}),
        data.uid ?? 0,
        data.code ?? 200,
        data.delay ?? 0,
        jsonCol(data.headers, []),
        up_time,
        data.res_body ?? "",
        data.ip ?? "",
        data.case_enable !== false,
      ]
    );
    return advancedMockCaseFromRow(res.rows[0]);
  },

  async up(data: DocRecord) {
    const id = data.id;
    const patch = { ...data };
    delete patch.id;
    patch.up_time = yapi.commons.time();
    const pool = getPool();
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    const cols = [
      "interface_id",
      "project_id",
      "ip_enable",
      "name",
      "uid",
      "code",
      "delay",
      "up_time",
      "res_body",
      "ip",
      "case_enable",
    ] as const;
    for (const col of cols) {
      if (patch[col] !== undefined) {
        if (col === "ip_enable" || col === "case_enable") {
          sets.push(`${col} = $${idx}`);
          params.push(patch[col] === true);
        } else {
          sets.push(`${col} = $${idx}`);
          params.push(patch[col]);
        }
        idx += 1;
      }
    }
    if (patch.params !== undefined) {
      sets.push(`params = $${idx}::jsonb`);
      params.push(jsonCol(patch.params, {}));
      idx += 1;
    }
    if (patch.headers !== undefined) {
      sets.push(`headers = $${idx}::jsonb`);
      params.push(jsonCol(patch.headers, []));
      idx += 1;
    }
    if (!sets.length) {
      return;
    }
    params.push(id);
    await pool.query(`UPDATE ${TBL} SET ${sets.join(", ")} WHERE _id = $${idx}`, params);
  },

  async del(id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE _id = $1`, [id]);
    return res.rowCount || 0;
  },
};
