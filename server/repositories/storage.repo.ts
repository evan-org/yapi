// @ts-nocheck
/**
 * 键值存储（storage）关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import { storageFromRow, STORAGE_SELECT } from "../db/relational.js";

const TBL = tableName("storage");

function stringifyData(data: Record<string, unknown>) {
  return JSON.stringify(data, null, 2);
}

async function fetchOneByKey(key: string) {
  const pool = getPool();
  const res = await pool.query(`SELECT ${STORAGE_SELECT} FROM ${TBL} WHERE key = $1`, [key]);
  if (!res.rows.length) {
    return null;
  }
  return storageFromRow(res.rows[0]);
}

export type StorageRepository = ModelInstance;

export const storageRepository: StorageRepository = {
  async save(key: string, data: Record<string, unknown> = {}, isInsert = false) {
    const pool = getPool();
    const dataStr = stringifyData(data);
    if (isInsert) {
      const res = await pool.query(
        `INSERT INTO ${TBL} (key, data) VALUES ($1, $2) RETURNING ${STORAGE_SELECT}`,
        [key, dataStr]
      );
      return storageFromRow(res.rows[0]);
    }
    const updated = await pool.query(`UPDATE ${TBL} SET data = $1 WHERE key = $2`, [
      dataStr,
      key,
    ]);
    if ((updated.rowCount || 0) > 0) {
      return updated.rowCount;
    }
    // 首次写入时可能尚无行，UPDATE 无匹配则补插入
    const res = await pool.query(
      `INSERT INTO ${TBL} (key, data) VALUES ($1, $2) RETURNING ${STORAGE_SELECT}`,
      [key, dataStr]
    );
    return storageFromRow(res.rows[0]);
  },

  async del(key: string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE key = $1`, [key]);
    return res.rowCount || 0;
  },

  async get(key: string) {
    const row = await fetchOneByKey(key);
    // 保持历史行为：读取时异步触发一次空对象保存
    void this.save(key, {});
    if (!row) {
      return null;
    }
    try {
      return JSON.parse(row.data as string);
    } catch (e) {
      return {};
    }
  },
};
