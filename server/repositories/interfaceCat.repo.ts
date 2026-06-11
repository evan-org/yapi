// @ts-nocheck
/**
 * 接口分类（interface_cat）关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import { nowSeconds } from "../shared/clock.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import {
  interfaceCatFromRow,
  INTERFACE_CAT_SELECT,
  sqlColumnName,
} from "../db/relational.js";
import type { DocRecord } from "../db/where.js";

const TBL = tableName("interface_cat");

async function fetchOne(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  if (!res.rows.length) {
    return null;
  }
  return interfaceCatFromRow(res.rows[0]);
}

async function fetchMany(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  return res.rows.map((row) => interfaceCatFromRow(row));
}

export type InterfaceCatRepository = ModelInstance;

export const interfaceCatRepository: InterfaceCatRepository = {
  async save(data: DocRecord) {
    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO ${TBL}
        (name, project_id, uid, description, "index", add_time, up_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${INTERFACE_CAT_SELECT}`,
      [
        data.name ?? "",
        data.project_id ?? 0,
        data.uid ?? 0,
        data.desc ?? "",
        data.index ?? 0,
        data.add_time,
        data.up_time,
      ]
    );
    return interfaceCatFromRow(res.rows[0]);
  },

  async get(id: number | string) {
    return fetchOne(`SELECT ${INTERFACE_CAT_SELECT} FROM ${TBL} WHERE _id = $1`, [id]);
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
      `SELECT ${INTERFACE_CAT_SELECT} FROM ${TBL} WHERE project_id = $1 ORDER BY "index" ASC`,
      [project_id]
    );
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
    const cols = ["name", "project_id", "uid", "desc", "index", "add_time", "up_time"] as const;
    for (const col of cols) {
      if (data[col] !== undefined) {
        sets.push(`${sqlColumnName(col)} = $${idx}`);
        params.push(data[col]);
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

  async upCatIndex(id: number | string, index: number) {
    const pool = getPool();
    await pool.query(`UPDATE ${TBL} SET "index" = $1 WHERE _id = $2`, [index, id]);
    return 1;
  },
};
