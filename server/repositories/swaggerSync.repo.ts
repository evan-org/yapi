// @ts-nocheck
/**
 * Swagger 自动同步（interface_auto_sync）关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import { nowSeconds } from "../shared/clock.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import {
  interfaceAutoSyncFromRow,
  INTERFACE_AUTO_SYNC_SELECT,
} from "../db/relational.js";
import type { DocRecord } from "../db/where.js";

const TBL = tableName("interface_auto_sync");

async function fetchOneByProjectId(project_id: number | string) {
  const pool = getPool();
  const res = await pool.query(
    `SELECT ${INTERFACE_AUTO_SYNC_SELECT} FROM ${TBL} WHERE project_id = $1`,
    [project_id]
  );
  if (!res.rows.length) {
    return null;
  }
  return interfaceAutoSyncFromRow(res.rows[0]);
}

export type SwaggerSyncRepository = ModelInstance;

export const swaggerSyncRepository: SwaggerSyncRepository = {
  async getByProjectId(id: number | string) {
    return fetchOneByProjectId(id);
  },

  async delByProjectId(project_id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE project_id = $1`, [project_id]);
    return res.rowCount || 0;
  },

  async save(data: DocRecord) {
    const pool = getPool();
    const now = nowSeconds();
    const res = await pool.query(
      `INSERT INTO ${TBL}
        (uid, project_id, add_time, up_time, is_sync_open, sync_cron, sync_json_url, sync_mode, old_swagger_content, last_sync_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${INTERFACE_AUTO_SYNC_SELECT}`,
      [
        data.uid ?? 0,
        data.project_id ?? 0,
        data.add_time ?? now,
        now,
        data.is_sync_open === true,
        data.sync_cron ?? "",
        data.sync_json_url ?? "",
        data.sync_mode ?? "",
        data.old_swagger_content ?? "",
        data.last_sync_time ?? 0,
      ]
    );
    return interfaceAutoSyncFromRow(res.rows[0]);
  },

  async listAll() {
    const pool = getPool();
    const res = await pool.query(
      `SELECT ${INTERFACE_AUTO_SYNC_SELECT} FROM ${TBL} ORDER BY _id DESC`
    );
    return res.rows.map((row) => interfaceAutoSyncFromRow(row));
  },

  async up(data: DocRecord) {
    const id = data.id;
    return this.upById(id, data);
  },

  async upById(id: number | string, data: DocRecord) {
    const patch = { ...data };
    delete patch.id;
    patch.up_time = nowSeconds();
    const pool = getPool();
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    const cols = [
      "uid",
      "project_id",
      "add_time",
      "up_time",
      "sync_cron",
      "sync_json_url",
      "sync_mode",
      "old_swagger_content",
      "last_sync_time",
    ] as const;
    for (const col of cols) {
      if (patch[col] !== undefined) {
        sets.push(`${col} = $${idx}`);
        params.push(patch[col]);
        idx += 1;
      }
    }
    if (patch.is_sync_open !== undefined) {
      sets.push(`is_sync_open = $${idx}`);
      params.push(patch.is_sync_open === true);
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
