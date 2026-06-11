// @ts-nocheck
/**
 * 接口（interface）关系型仓储
 */
import type { ModelInstance } from "./base.repo.js";
import { nowSeconds } from "../shared/clock.js";
import { getPool } from "../db/pg-pool.js";
import { tableName } from "../db/table.js";
import {
  interfaceFromRow,
  INTERFACE_SELECT,
  jsonCol,
  sqlColumnName,
} from "../db/relational.js";
import type { DocRecord } from "../db/where.js";

const TBL = tableName("interface");

const JSONB_COLS = [
  "query_path",
  "req_query",
  "req_headers",
  "req_params",
  "req_body_form",
  "tag",
] as const;

const SCALAR_COLS = [
  "uid",
  "title",
  "path",
  "method",
  "project_id",
  "catid",
  "edit_uid",
  "status",
  "add_time",
  "up_time",
  "type",
  "index",
  "api_opened",
  "desc",
  "req_body_type",
  "res_body_type",
  "req_body_is_json_schema",
  "res_body_is_json_schema",
  "custom_field_value",
  "markdown",
  "res_body",
  "req_body_other",
] as const;

const OPTION_COLS = new Set([
  "project_id",
  "catid",
  "type",
  "api_opened",
  "path",
  "method",
  "uid",
  "edit_uid",
  "status",
  "tag",
  "custom_field_value",
]);

function parseSelectFields(select?: string | string[]) {
  if (!select) {
    return undefined;
  }
  if (Array.isArray(select)) {
    return select;
  }
  return select.trim().split(/\s+/).filter(Boolean);
}

function pickInterfaceFields(doc: DocRecord, fields?: string[]) {
  if (!fields?.length) {
    return doc;
  }
  const out: DocRecord = {};
  for (const f of fields) {
    if (f === "cat_id") {
      if (doc.catid !== undefined) {
        out.cat_id = doc.catid;
      }
      continue;
    }
    if (doc[f] !== undefined) {
      out[f] = doc[f];
    }
  }
  if (doc._id !== undefined) {
    out._id = doc._id;
  }
  return out;
}

/** 列表/计数 option → WHERE（关系型列） */
function buildOptionWhere(option: DocRecord | null | undefined) {
  if (!option || !Object.keys(option).length) {
    return { where: "TRUE", params: [] as unknown[] };
  }
  const clauses: string[] = [];
  const params: unknown[] = [];
  for (const key of Object.keys(option)) {
    const value = option[key];
    if (!OPTION_COLS.has(key)) {
      continue;
    }
    if (key === "tag") {
      if (value && typeof value === "object" && Array.isArray((value as DocRecord).$in)) {
        params.push((value as DocRecord).$in);
        clauses.push(`tag ?| $${params.length}`);
      } else if (value != null) {
        params.push([value]);
        clauses.push(`tag ?| $${params.length}`);
      }
      continue;
    }
    if (key === "status") {
      if (value && typeof value === "object" && Array.isArray((value as DocRecord).$in)) {
        const items = (value as DocRecord).$in as unknown[];
        const ph = items.map((item) => {
          params.push(item);
          return `$${params.length}`;
        });
        clauses.push(`status IN (${ph.join(", ")})`);
      } else {
        params.push(value);
        clauses.push(`status = $${params.length}`);
      }
      continue;
    }
    if (key === "api_opened") {
      params.push(value);
      clauses.push(`api_opened = $${params.length}`);
      continue;
    }
    params.push(value);
    clauses.push(`${key} = $${params.length}`);
  }
  return {
    where: clauses.length ? clauses.join(" AND ") : "TRUE",
    params,
  };
}

async function fetchOne(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  if (!res.rows.length) {
    return null;
  }
  return interfaceFromRow(res.rows[0]);
}

async function fetchMany(sql: string, params: unknown[]) {
  const pool = getPool();
  const res = await pool.query(sql, params);
  return res.rows.map((row) => interfaceFromRow(row));
}

function selectCols(fields?: string[]) {
  if (!fields?.length) {
    return INTERFACE_SELECT;
  }
  const cols = new Set<string>(["_id"]);
  for (const f of fields) {
    if (f === "cat_id") {
      cols.add("catid");
      continue;
    }
    if (f === "index" || f === "desc") {
      cols.add(sqlColumnName(f));
      continue;
    }
    cols.add(f);
  }
  return Array.from(cols).join(", ");
}

export type InterfaceRepository = ModelInstance;

export const interfaceRepository: InterfaceRepository = {
  async save(data: DocRecord) {
    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO ${TBL}
        (uid, title, path, method, project_id, catid, edit_uid, status, add_time, up_time,
         type, "index", api_opened, description, req_body_type, res_body_type,
         req_body_is_json_schema, res_body_is_json_schema, custom_field_value, markdown,
         res_body, req_body_other, query_path, req_query, req_headers, req_params, req_body_form, tag)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,
         $23::jsonb,$24::jsonb,$25::jsonb,$26::jsonb,$27::jsonb,$28::jsonb)
       RETURNING ${INTERFACE_SELECT}`,
      [
        data.uid ?? 0,
        data.title ?? "",
        data.path ?? "",
        data.method ?? "GET",
        data.project_id ?? 0,
        data.catid ?? 0,
        data.edit_uid ?? 0,
        data.status ?? "",
        data.add_time,
        data.up_time,
        data.type ?? "static",
        data.index ?? 0,
        data.api_opened ?? false,
        data.desc ?? "",
        data.req_body_type ?? "",
        data.res_body_type ?? "",
        data.req_body_is_json_schema ?? false,
        data.res_body_is_json_schema ?? false,
        data.custom_field_value ?? "",
        data.markdown ?? "",
        data.res_body ?? "",
        data.req_body_other ?? "",
        jsonCol(data.query_path, {}),
        jsonCol(data.req_query, []),
        jsonCol(data.req_headers, []),
        jsonCol(data.req_params, []),
        jsonCol(data.req_body_form, []),
        jsonCol(data.tag, []),
      ]
    );
    return interfaceFromRow(res.rows[0]);
  },

  async get(id: number | string) {
    return fetchOne(`SELECT ${INTERFACE_SELECT} FROM ${TBL} WHERE _id = $1`, [id]);
  },

  async getBaseinfo(id: number | string) {
    const row = await fetchOne(`SELECT ${INTERFACE_SELECT} FROM ${TBL} WHERE _id = $1`, [id]);
    return row
      ? pickInterfaceFields(row, [
          "path",
          "method",
          "uid",
          "title",
          "project_id",
          "cat_id",
          "status",
        ])
      : null;
  },

  async getVar(project_id: number | string, method: string) {
    return fetchMany(
      `SELECT _id, path FROM ${TBL} WHERE project_id = $1 AND type = 'var' AND method = $2`,
      [project_id, method]
    );
  },

  async getByQueryPath(project_id: number | string, path: string, method: string) {
    return fetchMany(
      `SELECT ${INTERFACE_SELECT} FROM ${TBL}
       WHERE project_id = $1 AND method = $2 AND query_path->>'path' = $3`,
      [project_id, method, path]
    );
  },

  async getByPath(
    project_id: number | string,
    path: string,
    method: string,
    select?: string
  ) {
    const fields = parseSelectFields(
      select ||
        "_id title uid path method project_id catid edit_uid status add_time up_time type query_path req_query req_headers req_params req_body_type req_body_form req_body_other res_body_type custom_field_value res_body res_body_is_json_schema req_body_is_json_schema"
    );
    const cols = selectCols(fields);
    return fetchMany(
      `SELECT ${cols} FROM ${TBL} WHERE project_id = $1 AND path = $2 AND method = $3`,
      [project_id, path, method]
    ).then((rows) => rows.map((r) => pickInterfaceFields(r, fields)));
  },

  async checkRepeat(
    id: number | string,
    path: string,
    method: string,
    excludeId?: number | string
  ) {
    const pool = getPool();
    if (excludeId !== undefined && excludeId !== null && excludeId !== "") {
      const res = await pool.query(
        `SELECT COUNT(*)::int AS c FROM ${TBL}
         WHERE project_id = $1 AND path = $2 AND method = $3 AND _id <> $4`,
        [id, path, method, excludeId]
      );
      return res.rows[0].c;
    }
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL}
       WHERE project_id = $1 AND path = $2 AND method = $3`,
      [id, path, method]
    );
    return res.rows[0].c;
  },

  async countByProjectId(id: number | string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL} WHERE project_id = $1`,
      [id]
    );
    return res.rows[0].c;
  },

  async list(project_id: number | string, select?: string) {
    const fields = parseSelectFields(
      select || "_id title uid path method project_id catid edit_uid status add_time up_time"
    );
    const cols = selectCols(fields);
    return fetchMany(
      `SELECT ${cols} FROM ${TBL} WHERE project_id = $1 ORDER BY title ASC`,
      [project_id]
    ).then((rows) => rows.map((r) => pickInterfaceFields(r, fields)));
  },

  async listWithPage(project_id: number | string, page: number | string, limit: number | string) {
    const p = parseInt(String(page), 10);
    const l = parseInt(String(limit), 10);
    const fields = parseSelectFields(
      "_id title uid path method project_id catid api_opened edit_uid status add_time up_time tag"
    );
    const cols = selectCols(fields);
    return fetchMany(
      `SELECT ${cols} FROM ${TBL} WHERE project_id = $1 ORDER BY title ASC OFFSET $2 LIMIT $3`,
      [project_id, (p - 1) * l, l]
    ).then((rows) => rows.map((r) => pickInterfaceFields(r, fields)));
  },

  async listByPid(project_id: number | string) {
    return fetchMany(
      `SELECT ${INTERFACE_SELECT} FROM ${TBL} WHERE project_id = $1 ORDER BY title ASC`,
      [project_id]
    );
  },

  async getInterfaceListCount() {
    const pool = getPool();
    const res = await pool.query(`SELECT COUNT(*)::int AS c FROM ${TBL}`);
    return res.rows[0].c;
  },

  async listByCatid(catid: number | string, select?: string) {
    const fields = parseSelectFields(
      select ||
        "_id title uid path method project_id catid edit_uid status add_time up_time index tag"
    );
    const cols = selectCols(fields);
    return fetchMany(
      `SELECT ${cols} FROM ${TBL} WHERE catid = $1 ORDER BY "index" ASC`,
      [catid]
    ).then((rows) => rows.map((r) => pickInterfaceFields(r, fields)));
  },

  async listByCatidWithPage(
    catid: number | string,
    page: number | string,
    limit: number | string
  ) {
    const p = parseInt(String(page), 10);
    const l = parseInt(String(limit), 10);
    const fields = parseSelectFields(
      "_id title uid path method project_id catid edit_uid api_opened status add_time up_time index tag"
    );
    const cols = selectCols(fields);
    return fetchMany(
      `SELECT ${cols} FROM ${TBL} WHERE catid = $1 ORDER BY "index" ASC OFFSET $2 LIMIT $3`,
      [catid, (p - 1) * l, l]
    ).then((rows) => rows.map((r) => pickInterfaceFields(r, fields)));
  },

  async listByOptionWithPage(
    option: DocRecord,
    page: number | string,
    limit: number | string
  ) {
    const p = parseInt(String(page), 10);
    const l = parseInt(String(limit), 10);
    const { where, params } = buildOptionWhere(option);
    const fields = parseSelectFields(
      "_id title uid path method project_id catid edit_uid api_opened status add_time up_time index tag"
    );
    const cols = selectCols(fields);
    return fetchMany(
      `SELECT ${cols} FROM ${TBL} WHERE ${where} ORDER BY "index" ASC OFFSET $${
        params.length + 1
      } LIMIT $${params.length + 2}`,
      [...params, (p - 1) * l, l]
    ).then((rows) => rows.map((r) => pickInterfaceFields(r, fields)));
  },

  async listByInterStatus(catid: number | string, status: string) {
    if (status === "open") {
      return fetchMany(
        `SELECT ${INTERFACE_SELECT} FROM ${TBL}
         WHERE catid = $1 AND api_opened = TRUE ORDER BY title ASC`,
        [catid]
      );
    }
    return fetchMany(
      `SELECT ${INTERFACE_SELECT} FROM ${TBL} WHERE catid = $1 ORDER BY title ASC`,
      [catid]
    );
  },

  async del(id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE _id = $1`, [id]);
    return res.rowCount;
  },

  async delByCatid(id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE catid = $1`, [id]);
    return res.rowCount;
  },

  async delByProjectId(id: number | string) {
    const pool = getPool();
    const res = await pool.query(`DELETE FROM ${TBL} WHERE project_id = $1`, [id]);
    return res.rowCount;
  },

  async update(id: number | string, data: DocRecord) {
    const pool = getPool();
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    for (const col of SCALAR_COLS) {
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

  async upEditUid(id: number | string, uid: number | string) {
    return this.update(id, { edit_uid: uid });
  },

  async getcustomFieldValue(id: number | string, value: unknown) {
    const fields = parseSelectFields(
      "title uid path method edit_uid status desc add_time up_time type query_path req_query req_headers req_params req_body_type req_body_form req_body_other res_body_type custom_field_value"
    );
    const cols = selectCols(fields);
    return fetchMany(
      `SELECT ${cols} FROM ${TBL} WHERE project_id = $1 AND custom_field_value = $2`,
      [id, value]
    ).then((rows) => rows.map((r) => pickInterfaceFields(r, fields)));
  },

  async listCount(option: DocRecord | null | undefined) {
    const { where, params } = buildOptionWhere(option);
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${TBL} WHERE ${where}`,
      params
    );
    return res.rows[0].c;
  },

  async upIndex(id: number | string, index: number) {
    const pool = getPool();
    await pool.query(`UPDATE ${TBL} SET "index" = $1 WHERE _id = $2`, [index, id]);
    return 1;
  },

  async search(keyword: string) {
    const pattern = `%${keyword}%`;
    return fetchMany(
      `SELECT ${INTERFACE_SELECT} FROM ${TBL}
       WHERE title ILIKE $1 OR path ILIKE $1
       ORDER BY _id DESC
       LIMIT 10`,
      [pattern]
    );
  },
};
