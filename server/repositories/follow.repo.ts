// @ts-nocheck
/**
 * 项目关注（follow）关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import { followFromRow, FOLLOW_SELECT } from "../db/relational.js";
import type { DocRecord } from "../db/where.js";

const TBL = tableName("follow");

async function fetchMany(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  return res.rows.map((row) => followFromRow(row));
}

export type FollowRepository = ModelInstance;

export const followRepository: FollowRepository = {
  async save(data: DocRecord) {
    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO ${TBL}
        (uid, projectid, projectname, icon, color)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${FOLLOW_SELECT}`,
      [
        data.uid ?? 0,
        data.projectid ?? 0,
        data.projectname ?? "",
        data.icon ?? "",
        data.color ?? "",
      ]
    );
    return followFromRow(res.rows[0]);
  },

  async del(projectid: number | string, uid: number | string) {
    const pool = getPool();
    const res = await pool.query(
      `DELETE FROM ${TBL} WHERE projectid = $1 AND uid = $2`,
      [projectid, uid]
    );
    return res.rowCount;
  },

  async delByProjectId(projectid: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE projectid = $1`, [projectid]);
    return res.rowCount;
  },

  async list(uid: number | string) {
    return fetchMany(`SELECT ${FOLLOW_SELECT} FROM ${TBL} WHERE uid = $1`, [uid]);
  },

  async listByProjectId(projectid: number | string) {
    return fetchMany(`SELECT ${FOLLOW_SELECT} FROM ${TBL} WHERE projectid = $1`, [
      projectid,
    ]);
  },

  async checkProjectRepeat(uid: number | string, projectid: number | string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL} WHERE uid = $1 AND projectid = $2`,
      [uid, projectid]
    );
    return res.rows[0].c;
  },

  async updateById(id: number | string, typeid: number | string, data: DocRecord) {
    const pool = getPool();
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    const cols = ["projectname", "icon", "color"] as const;
    for (const col of cols) {
      if (data[col] !== undefined) {
        sets.push(`${col} = $${idx}`);
        params.push(data[col]);
        idx += 1;
      }
    }
    if (!sets.length) {
      return 0;
    }
    params.push(id, typeid);
    await pool.query(
      `UPDATE ${TBL} SET ${sets.join(", ")} WHERE uid = $${idx} AND projectid = $${idx + 1}`,
      params
    );
    return 1;
  },
};
