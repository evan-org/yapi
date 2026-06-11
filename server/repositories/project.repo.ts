// @ts-nocheck
/**
 * 项目（project）关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import { nowSeconds } from "../shared/clock.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import {
  jsonCol,
  projectFromRow,
  PROJECT_SELECT,
  readJsonCol,
  sqlColumnName,
} from "../db/relational.js";
import type { DocRecord } from "../db/where.js";

const TBL = tableName("project");

function memberUidExistsSql(paramIndex: number) {
  return `
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(COALESCE(members, '[]'::jsonb)) AS m
      WHERE (m->>'uid') = $${paramIndex}
    )
  `;
}

function pickProjectFields(doc: DocRecord, fields?: string[]) {
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

function parseSelectFields(select?: string | string[]) {
  if (!select) {
    return undefined;
  }
  if (Array.isArray(select)) {
    return select;
  }
  return select.trim().split(/\s+/).filter(Boolean);
}

async function fetchOne(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  if (!res.rows.length) {
    return null;
  }
  return projectFromRow(res.rows[0]);
}

async function fetchMany(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  return res.rows.map((row) => projectFromRow(row));
}

const LIST_FIELDS = [
  "_id",
  "uid",
  "name",
  "basepath",
  "switch_notice",
  "desc",
  "group_id",
  "project_type",
  "color",
  "icon",
  "env",
  "add_time",
  "up_time",
];

const JSONB_COLS = ["env", "members", "tag"] as const;

export type ProjectRepository = ModelInstance;

export const projectRepository: ProjectRepository = {
  async getAuthList(uid: number | string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT group_id FROM ${TBL}
       WHERE project_type = 'public'
          OR (project_type = 'private' AND uid = $1)
          OR (project_type = 'private' AND ${memberUidExistsSql(2)})`,
      [uid, String(uid)]
    );
    return res.rows.map((r) => ({ group_id: r.group_id }));
  },

  async updateMember(data: DocRecord) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT _id, members FROM ${TBL}
       WHERE ${memberUidExistsSql(1)}`,
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

  async save(data: DocRecord) {
    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO ${TBL}
        (uid, name, basepath, switch_notice, description, group_id, project_type, icon, color,
         add_time, up_time, pre_script, after_script, project_mock_script,
         is_mock_open, strice, is_json5, prd_host, env, members, tag)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19::jsonb,$20::jsonb,$21::jsonb)
       RETURNING ${PROJECT_SELECT}`,
      [
        data.uid ?? 0,
        data.name ?? "",
        data.basepath ?? "",
        data.switch_notice ?? false,
        data.desc ?? "",
        data.group_id ?? 0,
        data.project_type ?? "private",
        data.icon ?? "",
        data.color ?? "",
        data.add_time,
        data.up_time,
        data.pre_script ?? "",
        data.after_script ?? "",
        data.project_mock_script ?? "",
        data.is_mock_open ?? false,
        data.strice ?? false,
        data.is_json5 ?? false,
        data.prd_host ?? "",
        jsonCol(data.env, []),
        jsonCol(data.members, []),
        jsonCol(data.tag, []),
      ]
    );
    return projectFromRow(res.rows[0]);
  },

  async get(id: number | string) {
    return fetchOne(`SELECT ${PROJECT_SELECT} FROM ${TBL} WHERE _id = $1`, [id]);
  },

  async getByEnv(id: number | string) {
    const row = await fetchOne(
      `SELECT _id, env FROM ${TBL} WHERE _id = $1`,
      [id]
    );
    return row ? pickProjectFields(row, ["env", "_id"]) : null;
  },

  async getProjectWithAuth(group_id: number | string, uid: number | string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL}
       WHERE group_id = $1 AND ${memberUidExistsSql(2)}`,
      [group_id, String(uid)]
    );
    return res.rows[0].c;
  },

  async getBaseInfo(id: number | string, select?: string) {
    const row = await fetchOne(`SELECT ${PROJECT_SELECT} FROM ${TBL} WHERE _id = $1`, [
      id,
    ]);
    if (!row) {
      return null;
    }
    const fields = parseSelectFields(
      select ||
        "_id uid name basepath switch_notice description group_id project_type env icon color add_time up_time pre_script after_script project_mock_script is_mock_open strice is_json5 tag"
    );
    return pickProjectFields(row, fields);
  },

  async getByDomain(domain: string) {
    const rows = await fetchMany(
      `SELECT ${PROJECT_SELECT} FROM ${TBL} WHERE prd_host = $1 LIMIT 1`,
      [domain]
    );
    return rows.length ? rows[0] : null;
  },

  async checkNameRepeat(name: string, groupid: number | string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL} WHERE name = $1 AND group_id = $2`,
      [name, groupid]
    );
    return res.rows[0].c;
  },

  async checkDomainRepeat(domain: string, basepath: string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL} WHERE prd_host = $1 AND basepath = $2`,
      [domain, basepath]
    );
    return res.rows[0].c;
  },

  async list(group_id: number | string) {
    return fetchMany(
      `SELECT ${PROJECT_SELECT} FROM ${TBL} WHERE group_id = $1 ORDER BY _id DESC`,
      [group_id]
    ).then((rows) => rows.map((r) => pickProjectFields(r, LIST_FIELDS)));
  },

  async getProjectListCount() {
    const pool = getPool();
    const res = await pool.query(`SELECT COUNT(*)::int AS c FROM ${TBL}`);
    return res.rows[0].c;
  },

  async countWithPublic(group_id: number | string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL} WHERE group_id = $1 AND project_type = 'public'`,
      [group_id]
    );
    return res.rows[0].c;
  },

  async listWithPaging(
    group_id: number | string,
    page: number | string,
    limit: number | string
  ) {
    const p = parseInt(String(page), 10);
    const l = parseInt(String(limit), 10);
    return fetchMany(
      `SELECT ${PROJECT_SELECT} FROM ${TBL} WHERE group_id = $1 ORDER BY _id DESC OFFSET $2 LIMIT $3`,
      [group_id, (p - 1) * l, l]
    );
  },

  async listCount(group_id: number | string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL} WHERE group_id = $1`,
      [group_id]
    );
    return res.rows[0].c;
  },

  async countByGroupId(group_id: number | string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL} WHERE group_id = $1`,
      [group_id]
    );
    return res.rows[0].c;
  },

  async del(id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE _id = $1`, [id]);
    return res.rowCount;
  },

  async delByGroupid(groupId: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE group_id = $1`, [groupId]);
    return res.rowCount;
  },

  async update(id: number | string, data: DocRecord) {
    const pool = getPool();
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    const scalarCols = [
      "uid",
      "name",
      "basepath",
      "switch_notice",
      "desc",
      "group_id",
      "project_type",
      "icon",
      "color",
      "add_time",
      "up_time",
      "pre_script",
      "after_script",
      "project_mock_script",
      "is_mock_open",
      "strice",
      "is_json5",
      "prd_host",
    ] as const;
    for (const col of scalarCols) {
      if (data[col] !== undefined) {
        sets.push(`${sqlColumnName(col)} = $${idx}`);
        params.push(data[col]);
        idx += 1;
      }
    }
    for (const col of JSONB_COLS) {
      if (data[col] !== undefined) {
        sets.push(`${col} = $${idx}::jsonb`);
        params.push(jsonCol(data[col]));
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

  async up(id: number | string, data: DocRecord) {
    data.up_time = nowSeconds();
    return this.update(id, data);
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

  async checkMemberRepeat(id: number | string, uid: number | string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL}
       WHERE _id = $1 AND ${memberUidExistsSql(2)}`,
      [id, String(uid)]
    );
    return res.rows[0].c;
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

  async changeMemberEmailNotice(
    id: number | string,
    uid: number | string,
    notice: unknown
  ) {
    const pool = getPool();
    const res = await pool.query(`SELECT members FROM ${TBL} WHERE _id = $1`, [id]);
    if (!res.rows.length) {
      return 0;
    }
    const members = readJsonCol(res.rows[0].members, []);
    const m = members.find((x) => x && x.uid == uid);
    if (m) {
      m.email_notice = notice;
    }
    await pool.query(`UPDATE ${TBL} SET members = $1::jsonb WHERE _id = $2`, [
      jsonCol(members, []),
      id,
    ]);
    return 1;
  },

  async search(keyword: string) {
    return fetchMany(
      `SELECT ${PROJECT_SELECT} FROM ${TBL}
       WHERE name ILIKE $1
       ORDER BY _id DESC
       LIMIT 10`,
      [`%${keyword}%`]
    );
  },
};
