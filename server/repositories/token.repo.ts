// @ts-nocheck
/**
 * 项目 Token 关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import { tokenFromRow, TOKEN_SELECT } from "../db/relational.js";
import type { DocRecord } from "../db/where.js";

const TBL = tableName("token");

async function fetchOne(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  if (!res.rows.length) {
    return null;
  }
  return tokenFromRow(res.rows[0]);
}

export type TokenRepository = ModelInstance;

export const tokenRepository: TokenRepository = {
  async save(data: DocRecord) {
    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO ${TBL} (project_id, token) VALUES ($1, $2) RETURNING ${TOKEN_SELECT}`,
      [data.project_id, data.token ?? ""]
    );
    return tokenFromRow(res.rows[0]);
  },

  async get(project_id: number | string) {
    return fetchOne(`SELECT ${TOKEN_SELECT} FROM ${TBL} WHERE project_id = $1`, [
      project_id,
    ]);
  },

  async findId(token: string) {
    const row = await fetchOne(
      `SELECT project_id FROM ${TBL} WHERE token = $1`,
      [token]
    );
    return row ? { project_id: row.project_id } : null;
  },

  async up(project_id: number | string, token: string) {
    const pool = getPool();
    await pool.query(`UPDATE ${TBL} SET token = $1 WHERE project_id = $2`, [
      token,
      project_id,
    ]);
    return { project_id, token };
  },

  async delByProjectId(project_id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE project_id = $1`, [
      project_id,
    ]);
    return res.rowCount;
  },
};
