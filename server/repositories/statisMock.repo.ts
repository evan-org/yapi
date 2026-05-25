// @ts-nocheck
/**
 * Mock 统计（statis_mock）关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import yapi from "../runtime.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import { statisMockFromRow, STATIS_MOCK_SELECT } from "../db/relational.js";
import type { DocRecord } from "../db/where.js";

const TBL = tableName("statis_mock");

export type StatisMockRepository = ModelInstance;

export const statisMockRepository: StatisMockRepository = {
  async countByGroupId(id: number | string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL} WHERE group_id = $1`,
      [id]
    );
    return res.rows[0].c;
  },

  async save(data: DocRecord) {
    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO ${TBL}
        (interface_id, project_id, group_id, time, ip, date, up_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${STATIS_MOCK_SELECT}`,
      [
        data.interface_id ?? 0,
        data.project_id ?? 0,
        data.group_id ?? 0,
        data.time ?? 0,
        data.ip ?? "",
        data.date ?? "",
        data.up_time ?? 0,
      ]
    );
    return statisMockFromRow(res.rows[0]);
  },

  async getTotalCount() {
    const pool = getPool();
    const res = await pool.query(`SELECT COUNT(*)::int AS c FROM ${TBL}`);
    return res.rows[0].c;
  },

  async getDayCount(timeInterval: [string, string]) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT date AS _id, COUNT(*)::int AS count
       FROM ${TBL}
       WHERE date > $1 AND date <= $2
       GROUP BY date
       ORDER BY date ASC`,
      [String(timeInterval[0]), String(timeInterval[1])]
    );
    return res.rows;
  },

  async list() {
    const pool = getPool();
    const res = await pool.query(`SELECT date FROM ${TBL} ORDER BY _id DESC`);
    return res.rows.map((row) => ({ date: row.date }));
  },

  async up(id: number | string, data: DocRecord) {
    data.up_time = yapi.commons.time();
    const pool = getPool();
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    const cols = [
      "interface_id",
      "project_id",
      "group_id",
      "time",
      "ip",
      "date",
      "up_time",
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

  async del(id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE _id = $1`, [id]);
    return res.rowCount || 0;
  },
};
