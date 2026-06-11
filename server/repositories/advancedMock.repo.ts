// @ts-nocheck
/**
 * 高级 Mock 脚本（adv_mock）关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import { nowSeconds } from "../shared/clock.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import { advancedMockFromRow, ADV_MOCK_SELECT } from "../db/relational.js";
import type { DocRecord } from "../db/where.js";

const TBL = tableName("adv_mock");

async function fetchOneByInterfaceId(interface_id: number | string) {
  const pool = getPool();
  const res = await pool.query(
    `SELECT ${ADV_MOCK_SELECT} FROM ${TBL} WHERE interface_id = $1`,
    [interface_id]
  );
  if (!res.rows.length) {
    return null;
  }
  return advancedMockFromRow(res.rows[0]);
}

export type AdvancedMockRepository = ModelInstance;

export const advancedMockRepository: AdvancedMockRepository = {
  async get(interface_id: number | string) {
    return fetchOneByInterfaceId(interface_id);
  },

  async delByInterfaceId(interface_id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE interface_id = $1`, [
      interface_id,
    ]);
    return res.rowCount || 0;
  },

  async delByProjectId(project_id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE project_id = $1`, [project_id]);
    return res.rowCount || 0;
  },

  async save(data: DocRecord) {
    const pool = getPool();
    const up_time = nowSeconds();
    const res = await pool.query(
      `INSERT INTO ${TBL}
        (interface_id, project_id, uid, up_time, mock_script, enable)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${ADV_MOCK_SELECT}`,
      [
        data.interface_id ?? 0,
        data.project_id ?? 0,
        data.uid ?? 0,
        up_time,
        data.mock_script ?? "",
        data.enable === true,
      ]
    );
    return advancedMockFromRow(res.rows[0]);
  },

  async up(data: DocRecord) {
    data.up_time = nowSeconds();
    const existing = await fetchOneByInterfaceId(data.interface_id);
    const patch = {
      uid: data.uid,
      up_time: data.up_time,
      mock_script: data.mock_script,
      enable: data.enable,
    };
    if (existing) {
      const pool = getPool();
      await pool.query(
        `UPDATE ${TBL} SET uid = $1, up_time = $2, mock_script = $3, enable = $4 WHERE _id = $5`,
        [patch.uid, patch.up_time, patch.mock_script ?? "", patch.enable === true, existing._id]
      );
      return existing;
    }
    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO ${TBL}
        (interface_id, project_id, uid, up_time, mock_script, enable)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${ADV_MOCK_SELECT}`,
      [
        data.interface_id ?? 0,
        data.project_id ?? 0,
        patch.uid ?? 0,
        patch.up_time,
        patch.mock_script ?? "",
        patch.enable === true,
      ]
    );
    return advancedMockFromRow(res.rows[0]);
  },
};
