// @ts-nocheck
/**
 * 用户（user）关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import { userFromRow, USER_SELECT } from "../db/relational.js";
import type { DocRecord } from "../db/where.js";

const TBL = tableName("user");

const LIST_FIELDS = [
  "_id",
  "username",
  "email",
  "role",
  "type",
  "add_time",
  "up_time",
  "study",
];

function pickUserFields(row: DocRecord, fields?: string[]) {
  const doc = userFromRow(row);
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
  return userFromRow(res.rows[0]);
}

async function fetchMany(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  return res.rows.map((row) => userFromRow(row));
}

export type UserRepository = ModelInstance;

export const userRepository: UserRepository = {
  async save(data: DocRecord) {
    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO ${TBL}
        (username, password, email, passsalt, study, role, type, add_time, up_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${USER_SELECT}`,
      [
        data.username ?? "",
        data.password ?? "",
        data.email ?? "",
        data.passsalt ?? "",
        data.study ?? false,
        data.role ?? "",
        data.type ?? "",
        data.add_time,
        data.up_time,
      ]
    );
    return userFromRow(res.rows[0]);
  },

  async checkRepeat(email: string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL} WHERE email = $1`,
      [email]
    );
    return res.rows[0].c;
  },

  async list() {
    return fetchMany(
      `SELECT ${USER_SELECT} FROM ${TBL} ORDER BY _id ASC`
    ).then((rows) => rows.map((r) => pickUserFields(r, LIST_FIELDS)));
  },

  async findByUids(uids: (number | string)[] = []) {
    if (!uids.length) {
      return [];
    }
    const placeholders = uids.map((_, i) => `$${i + 1}`).join(", ");
    return fetchMany(
      `SELECT ${USER_SELECT} FROM ${TBL} WHERE _id IN (${placeholders})`,
      uids
    ).then((rows) => rows.map((r) => pickUserFields(r, LIST_FIELDS)));
  },

  async listWithPaging(page: number | string, limit: number | string) {
    const p = parseInt(String(page), 10);
    const l = parseInt(String(limit), 10);
    const pool = getPool();
    const res = await pool.query(
      `SELECT ${USER_SELECT} FROM ${TBL} ORDER BY _id DESC OFFSET $1 LIMIT $2`,
      [(p - 1) * l, l]
    );
    return res.rows.map((row) => pickUserFields(userFromRow(row), LIST_FIELDS));
  },

  async listCount() {
    const pool = getPool();
    const res = await pool.query(`SELECT COUNT(*)::int AS c FROM ${TBL}`);
    return res.rows[0].c;
  },

  async findByEmail(email: string) {
    return fetchOne(`SELECT ${USER_SELECT} FROM ${TBL} WHERE email = $1`, [email]);
  },

  async findById(id: number | string) {
    return fetchOne(`SELECT ${USER_SELECT} FROM ${TBL} WHERE _id = $1`, [id]);
  },

  async del(id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE _id = $1`, [id]);
    return res.rowCount;
  },

  async update(id: number | string, data: DocRecord) {
    const pool = getPool();
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    const cols = [
      "username",
      "password",
      "email",
      "passsalt",
      "study",
      "role",
      "type",
      "add_time",
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
      return 0;
    }
    params.push(id);
    await pool.query(
      `UPDATE ${TBL} SET ${sets.join(", ")} WHERE _id = $${idx}`,
      params
    );
    return 1;
  },

  async search(keyword: string) {
    const pattern = `%${keyword}%`;
    return fetchMany(
      `SELECT ${USER_SELECT} FROM ${TBL}
       WHERE email ILIKE $1 OR username ILIKE $1
       ORDER BY _id DESC
       LIMIT 10`,
      [pattern]
    ).then((rows) =>
      rows.map((r) => {
        const doc = userFromRow(r);
        delete doc.passsalt;
        delete doc.password;
        return doc;
      })
    );
  },
};
