// @ts-nocheck
/**
 * 用户头像（avatar）关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import { avatarFromRow, AVATAR_SELECT } from "../db/relational.js";

const TBL = tableName("avatar");

async function fetchOneByUid(uid: number | string) {
  const pool = getPool();
  const res = await pool.query(`SELECT ${AVATAR_SELECT} FROM ${TBL} WHERE uid = $1`, [uid]);
  if (!res.rows.length) {
    return null;
  }
  return avatarFromRow(res.rows[0]);
}

export type AvatarRepository = ModelInstance;

export const avatarRepository: AvatarRepository = {
  async get(uid: number | string) {
    return fetchOneByUid(uid);
  },

  async up(uid: number | string, basecode: string, type: string) {
    const pool = getPool();
    const existing = await fetchOneByUid(uid);
    if (existing) {
      await pool.query(`UPDATE ${TBL} SET type = $1, basecode = $2 WHERE uid = $3`, [
        type,
        basecode,
        uid,
      ]);
      return existing._id;
    }
    const res = await pool.query(
      `INSERT INTO ${TBL} (uid, type, basecode) VALUES ($1, $2, $3) RETURNING _id`,
      [uid, type, basecode]
    );
    return res.rows[0]._id;
  },

  async del(uid: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE uid = $1`, [uid]);
    return res.rowCount;
  },
};
