// @ts-nocheck
/**
 * 分组（group）关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import { nowSeconds } from "../shared/clock.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import {
  groupFromRow,
  GROUP_SELECT,
  jsonCol,
  readJsonCol,
} from "../db/relational.js";
import type { DocRecord } from "../db/where.js";

const TBL = tableName("group");

function pickGroupFields(row: DocRecord, fields?: string[]) {
  const doc = groupFromRow(row);
  if (!fields?.length) {
    return doc;
  }
  const out: DocRecord = {};
  for (const f of fields) {
    if (doc[f] !== undefined) {
      out[f] = doc[f];
    }
  }
  if (doc._id !== undefined) {
    out._id = doc._id;
  }
  return out;
}

async function fetchOne(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  if (!res.rows.length) {
    return null;
  }
  return groupFromRow(res.rows[0]);
}

async function fetchMany(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  return res.rows.map((row) => groupFromRow(row));
}

export type GroupRepository = ModelInstance;

export const groupRepository: GroupRepository = {
  async save(data: DocRecord) {
    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO ${TBL}
        (uid, group_name, group_desc, add_time, up_time, type, members, custom_field1)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb)
       RETURNING ${GROUP_SELECT}`,
      [
        data.uid,
        data.group_name,
        data.group_desc ?? "",
        data.add_time,
        data.up_time,
        data.type ?? "public",
        jsonCol(data.members, []),
        jsonCol(data.custom_field1, {}),
      ]
    );
    return groupFromRow(res.rows[0]);
  },

  async get(id: number | string) {
    return fetchOne(`SELECT ${GROUP_SELECT} FROM ${TBL} WHERE _id = $1`, [id]);
  },

  async getGroupById(id: number | string) {
    const row = await fetchOne(`SELECT ${GROUP_SELECT} FROM ${TBL} WHERE _id = $1`, [id]);
    return row ? pickGroupFields(row, ["uid", "group_name", "group_desc", "add_time", "up_time", "type", "custom_field1", "_id"]) : null;
  },

  async getByPrivateUid(uid: number | string) {
    const row = await fetchOne(
      `SELECT ${GROUP_SELECT} FROM ${TBL} WHERE uid = $1 AND type = 'private'`,
      [uid]
    );
    return row
      ? pickGroupFields(row, ["group_name", "_id", "group_desc", "add_time", "up_time", "type", "custom_field1"])
      : null;
  },

  async checkRepeat(name: string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL} WHERE group_name = $1`,
      [name]
    );
    return res.rows[0].c;
  },

  async getGroupListCount() {
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL} WHERE type = 'public'`
    );
    return res.rows[0].c;
  },

  async updateMember(data: DocRecord) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT _id, members FROM ${TBL}
       WHERE EXISTS (
         SELECT 1 FROM jsonb_array_elements(COALESCE(members, '[]'::jsonb)) AS m
         WHERE (m->>'uid') = $1
       )`,
      [String(data.uid)]
    );
    for (const row of res.rows) {
      const members = readJsonCol(row.members, []);
      for (const m of members) {
        if (m && m.uid == data.uid) {
          m.username = data.username;
          m.email = data.email;
        }
      }
      await pool.query(`UPDATE ${TBL} SET members = $1::jsonb WHERE _id = $2`, [
        jsonCol(members, []),
        row._id,
      ]);
    }
    return res.rowCount;
  },

  async addMember(id: number | string, data: unknown) {
    const items = Array.isArray(data) ? data : [data];
    const pool = getPool();
    const res = await pool.query(`SELECT members FROM ${TBL} WHERE _id = $1`, [id]);
    if (!res.rows.length) {
      return 0;
    }
    const members = readJsonCol(res.rows[0].members, []);
    members.push(...items);
    await pool.query(`UPDATE ${TBL} SET members = $1::jsonb WHERE _id = $2`, [
      jsonCol(members, []),
      id,
    ]);
    return 1;
  },

  async delMember(id: number | string, uid: number | string) {
    const pool = getPool();
    const res = await pool.query(`SELECT members FROM ${TBL} WHERE _id = $1`, [id]);
    if (!res.rows.length) {
      return 0;
    }
    const members = readJsonCol(res.rows[0].members, []).filter(
      (m) => m && m.uid != uid
    );
    await pool.query(`UPDATE ${TBL} SET members = $1::jsonb WHERE _id = $2`, [
      jsonCol(members, []),
      id,
    ]);
    return 1;
  },

  async changeMemberRole(id: number | string, uid: number | string, role: string) {
    const pool = getPool();
    const res = await pool.query(`SELECT members FROM ${TBL} WHERE _id = $1`, [id]);
    if (!res.rows.length) {
      return 0;
    }
    const members = readJsonCol(res.rows[0].members, []);
    const m = members.find((x) => x && x.uid == uid);
    if (m) {
      m.role = role;
    }
    await pool.query(`UPDATE ${TBL} SET members = $1::jsonb WHERE _id = $2`, [
      jsonCol(members, []),
      id,
    ]);
    return 1;
  },

  async checkMemberRepeat(id: number | string, uid: number | string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL}
       WHERE _id = $1 AND EXISTS (
         SELECT 1 FROM jsonb_array_elements(COALESCE(members, '[]'::jsonb)) AS m
         WHERE (m->>'uid') = $2
       )`,
      [id, String(uid)]
    );
    return res.rows[0].c;
  },

  async list() {
    return fetchMany(
      `SELECT ${GROUP_SELECT} FROM ${TBL} WHERE type = 'public' ORDER BY _id DESC`
    ).then((rows) =>
      rows.map((r) =>
        pickGroupFields(r, [
          "group_name",
          "_id",
          "group_desc",
          "add_time",
          "up_time",
          "type",
          "uid",
          "custom_field1",
        ])
      )
    );
  },

  async getAuthList(uid: number | string) {
    return fetchMany(
      `SELECT ${GROUP_SELECT} FROM ${TBL}
       WHERE type = 'public' AND (
         uid = $1 OR EXISTS (
           SELECT 1 FROM jsonb_array_elements(COALESCE(members, '[]'::jsonb)) AS m
           WHERE (m->>'uid') = $2
         )
       )
       ORDER BY _id DESC`,
      [uid, String(uid)]
    ).then((rows) =>
      rows.map((r) =>
        pickGroupFields(r, [
          "_id",
          "group_name",
          "group_desc",
          "add_time",
          "up_time",
          "type",
          "uid",
          "custom_field1",
        ])
      )
    );
  },

  async findByGroups(ids: (number | string)[] = []) {
    if (!ids.length) {
      return [];
    }
    const pool = getPool();
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
    return fetchMany(
      `SELECT ${GROUP_SELECT} FROM ${TBL}
       WHERE _id IN (${placeholders}) AND type = 'public'`,
      ids
    );
  },

  async del(id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE _id = $1`, [id]);
    return res.rowCount;
  },

  async up(id: number | string, data: DocRecord) {
    const pool = getPool();
    await pool.query(
      `UPDATE ${TBL} SET
        custom_field1 = COALESCE($1::jsonb, custom_field1),
        group_name = COALESCE($2, group_name),
        group_desc = COALESCE($3, group_desc),
        up_time = $4
       WHERE _id = $5`,
      [
        data.custom_field1 != null ? jsonCol(data.custom_field1) : null,
        data.group_name ?? null,
        data.group_desc ?? null,
        nowSeconds(),
        id,
      ]
    );
    return 1;
  },

  async getcustomFieldName(name: string) {
    return fetchMany(
      `SELECT _id FROM ${TBL}
       WHERE custom_field1->>'name' = $1
         AND (custom_field1->>'enable')::boolean IS TRUE`,
      [name]
    ).then((rows) => rows.map((r) => ({ _id: r._id })));
  },

  async search(keyword: string) {
    return fetchMany(
      `SELECT ${GROUP_SELECT} FROM ${TBL}
       WHERE group_name ILIKE $1
       ORDER BY _id DESC
       LIMIT 10`,
      [`%${keyword}%`]
    );
  },
};
