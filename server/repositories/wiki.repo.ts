// @ts-nocheck
/**
 * 项目 Wiki（wiki）关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import { wikiFromRow, WIKI_SELECT } from "../db/relational.js";
import type { DocRecord } from "../db/where.js";

const TBL = tableName("wiki");

async function fetchOne(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  if (!res.rows.length) {
    return null;
  }
  return wikiFromRow(res.rows[0]);
}

export type WikiRepository = ModelInstance;

export const wikiRepository: WikiRepository = {
  async save(data: DocRecord) {
    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO ${TBL}
        (project_id, desc, markdown, username, uid, add_time, up_time, edit_uid)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${WIKI_SELECT}`,
      [
        data.project_id ?? 0,
        data.desc ?? "",
        data.markdown ?? "",
        data.username ?? "",
        data.uid ?? 0,
        data.add_time ?? 0,
        data.up_time ?? 0,
        data.edit_uid ?? 0,
      ]
    );
    return wikiFromRow(res.rows[0]);
  },

  async get(project_id: number | string) {
    return fetchOne(`SELECT ${WIKI_SELECT} FROM ${TBL} WHERE project_id = $1`, [
      project_id,
    ]);
  },

  async up(id: number | string, data: DocRecord) {
    const pool = getPool();
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    const cols = [
      "project_id",
      "desc",
      "markdown",
      "username",
      "uid",
      "add_time",
      "up_time",
      "edit_uid",
    ] as const;
    for (const col of cols) {
      if (data[col] !== undefined) {
        sets.push(`${col} = $${idx}`);
        params.push(data[col]);
        idx += 1;
      }
    }
    if (!sets.length) {
      return;
    }
    params.push(id);
    await pool.query(`UPDATE ${TBL} SET ${sets.join(", ")} WHERE _id = $${idx}`, params);
  },

  async upEditUid(id: number | string, uid: number | string) {
    const pool = getPool();
    await pool.query(`UPDATE ${TBL} SET edit_uid = $1 WHERE _id = $2`, [uid, id]);
  },

  async delByProjectId(project_id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE project_id = $1`, [project_id]);
    return res.rowCount || 0;
  },
};
