// @ts-nocheck
/**
 * 关系型表行 ↔ 业务对象转换
 */
import type { DocRecord } from "./where.js";

export function jsonCol(value: unknown, fallback: unknown = null) {
  if (value == null) {
    return JSON.stringify(fallback);
  }
  return JSON.stringify(value);
}

export function readJsonCol(value: unknown, fallback: unknown) {
  if (value == null) {
    return fallback;
  }
  if (typeof value === "object") {
    return value;
  }
  return fallback;
}

/** group 表行 → 业务对象 */
export function groupFromRow(row: DocRecord): DocRecord {
  return {
    _id: row._id,
    uid: row.uid,
    group_name: row.group_name,
    group_desc: row.group_desc,
    add_time: row.add_time,
    up_time: row.up_time,
    type: row.type,
    members: readJsonCol(row.members, []),
    custom_field1: readJsonCol(row.custom_field1, {}),
  };
}

/** user 表行 → 业务对象 */
export function userFromRow(row: DocRecord): DocRecord {
  return {
    _id: row._id,
    username: row.username,
    password: row.password,
    email: row.email,
    passsalt: row.passsalt,
    study: row.study,
    role: row.role,
    type: row.type,
    add_time: row.add_time,
    up_time: row.up_time,
  };
}

const GROUP_COLS =
  "_id, uid, group_name, group_desc, add_time, up_time, type, members, custom_field1";

export const GROUP_SELECT = GROUP_COLS;

export const USER_SELECT =
  "_id, username, password, email, passsalt, study, role, type, add_time, up_time";

/** project 表行 → 业务对象 */
export function projectFromRow(row: DocRecord): DocRecord {
  return {
    _id: row._id,
    uid: row.uid,
    name: row.name,
    basepath: row.basepath,
    switch_notice: row.switch_notice,
    desc: row.desc,
    group_id: row.group_id,
    project_type: row.project_type,
    icon: row.icon,
    color: row.color,
    add_time: row.add_time,
    up_time: row.up_time,
    pre_script: row.pre_script,
    after_script: row.after_script,
    project_mock_script: row.project_mock_script,
    is_mock_open: row.is_mock_open,
    strice: row.strice,
    is_json5: row.is_json5,
    prd_host: row.prd_host,
    env: readJsonCol(row.env, []),
    members: readJsonCol(row.members, []),
    tag: readJsonCol(row.tag, []),
  };
}

export const PROJECT_SELECT =
  "_id, uid, name, basepath, switch_notice, desc, group_id, project_type, icon, color, add_time, up_time, pre_script, after_script, project_mock_script, is_mock_open, strice, is_json5, prd_host, env, members, tag";
