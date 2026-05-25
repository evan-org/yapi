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

/** interface 表行 → 业务对象 */
export function interfaceFromRow(row: DocRecord): DocRecord {
  const doc: DocRecord = {
    _id: row._id,
    uid: row.uid,
    title: row.title,
    path: row.path,
    method: row.method,
    project_id: row.project_id,
    catid: row.catid,
    edit_uid: row.edit_uid,
    status: row.status,
    add_time: row.add_time,
    up_time: row.up_time,
    type: row.type,
    index: row.index,
    api_opened: row.api_opened,
    desc: row.desc,
    req_body_type: row.req_body_type,
    res_body_type: row.res_body_type,
    req_body_is_json_schema: row.req_body_is_json_schema,
    res_body_is_json_schema: row.res_body_is_json_schema,
    custom_field_value: row.custom_field_value,
    markdown: row.markdown,
    res_body: row.res_body,
    req_body_other: row.req_body_other,
    query_path: readJsonCol(row.query_path, {}),
    req_query: readJsonCol(row.req_query, []),
    req_headers: readJsonCol(row.req_headers, []),
    req_params: readJsonCol(row.req_params, []),
    req_body_form: readJsonCol(row.req_body_form, []),
    tag: readJsonCol(row.tag, []),
  };
  return doc;
}

export const INTERFACE_SELECT =
  '_id, uid, title, path, method, project_id, catid, edit_uid, status, add_time, up_time, type, "index", api_opened, desc, req_body_type, res_body_type, req_body_is_json_schema, res_body_is_json_schema, custom_field_value, markdown, res_body, req_body_other, query_path, req_query, req_headers, req_params, req_body_form, tag';

/** interface_cat 表行 → 业务对象 */
export function interfaceCatFromRow(row: DocRecord): DocRecord {
  return {
    _id: row._id,
    name: row.name,
    project_id: row.project_id,
    uid: row.uid,
    desc: row.desc,
    index: row.index,
    add_time: row.add_time,
    up_time: row.up_time,
  };
}

export const INTERFACE_CAT_SELECT =
  '_id, name, project_id, uid, desc, "index", add_time, up_time';

/** interface_col 表行 → 业务对象 */
export function interfaceColFromRow(row: DocRecord): DocRecord {
  return {
    _id: row._id,
    name: row.name,
    project_id: row.project_id,
    uid: row.uid,
    desc: row.desc,
    index: row.index,
    add_time: row.add_time,
    up_time: row.up_time,
    checkHttpCodeIs200: row.checkHttpCodeIs200,
    checkResponseSchema: row.checkResponseSchema,
    checkResponseField: readJsonCol(row.checkResponseField, {}),
    checkScript: readJsonCol(row.checkScript, {}),
  };
}

export const INTERFACE_COL_SELECT =
  '_id, name, project_id, uid, desc, "index", add_time, up_time, checkHttpCodeIs200, checkResponseSchema, checkResponseField, checkScript';

/** interface_case 表行 → 业务对象 */
export function interfaceCaseFromRow(row: DocRecord): DocRecord {
  return {
    _id: row._id,
    uid: row.uid,
    casename: row.casename,
    col_id: row.col_id,
    interface_id: row.interface_id,
    project_id: row.project_id,
    index: row.index,
    add_time: row.add_time,
    up_time: row.up_time,
    case_env: row.case_env,
    req_body_type: row.req_body_type,
    req_body_other: row.req_body_other,
    test_script: row.test_script,
    req_headers: readJsonCol(row.req_headers, []),
    req_query: readJsonCol(row.req_query, []),
    req_params: readJsonCol(row.req_params, []),
    req_body_form: readJsonCol(row.req_body_form, []),
  };
}

export const INTERFACE_CASE_SELECT =
  '_id, uid, casename, col_id, interface_id, project_id, "index", add_time, up_time, case_env, req_body_type, req_body_other, test_script, req_headers, req_query, req_params, req_body_form';

/** log 表行 → 业务对象 */
export function logFromRow(row: DocRecord): DocRecord {
  return {
    _id: row._id,
    content: row.content,
    type: row.type,
    uid: row.uid,
    username: row.username,
    typeid: row.typeid,
    add_time: row.add_time,
    data: readJsonCol(row.data, {}),
  };
}

export const LOG_SELECT =
  "_id, content, type, uid, username, typeid, add_time, data";

/** token 表行 → 业务对象 */
export function tokenFromRow(row: DocRecord): DocRecord {
  return {
    _id: row._id,
    project_id: row.project_id,
    token: row.token,
  };
}

export const TOKEN_SELECT = "_id, project_id, token";

/** follow 表行 → 业务对象（字段名与历史 JSONB 文档一致） */
export function followFromRow(row: DocRecord): DocRecord {
  return {
    _id: row._id,
    uid: row.uid,
    projectid: row.projectid,
    projectname: row.projectname,
    icon: row.icon,
    color: row.color,
  };
}

export const FOLLOW_SELECT = "_id, uid, projectid, projectname, icon, color";

/** avatar 表行 → 业务对象 */
export function avatarFromRow(row: DocRecord): DocRecord {
  return {
    _id: row._id,
    uid: row.uid,
    type: row.type,
    basecode: row.basecode,
  };
}

export const AVATAR_SELECT = "_id, uid, type, basecode";

/** storage 表行 → 业务对象（data 仍为 JSON 字符串） */
export function storageFromRow(row: DocRecord): DocRecord {
  return {
    _id: row._id,
    key: row.key,
    data: row.data,
  };
}

export const STORAGE_SELECT = "_id, key, data";

/** wiki 表行 → 业务对象 */
export function wikiFromRow(row: DocRecord): DocRecord {
  return {
    _id: row._id,
    project_id: row.project_id,
    desc: row.desc,
    markdown: row.markdown,
    username: row.username,
    uid: row.uid,
    add_time: row.add_time,
    up_time: row.up_time,
    edit_uid: row.edit_uid,
  };
}

export const WIKI_SELECT =
  "_id, project_id, desc, markdown, username, uid, add_time, up_time, edit_uid";

/** adv_mock 表行 → 业务对象 */
export function advMockFromRow(row: DocRecord): DocRecord {
  return {
    _id: row._id,
    interface_id: row.interface_id,
    project_id: row.project_id,
    uid: row.uid,
    up_time: row.up_time,
    mock_script: row.mock_script,
    enable: row.enable,
  };
}

export const ADV_MOCK_SELECT =
  "_id, interface_id, project_id, uid, up_time, mock_script, enable";

/** adv_mock_case 表行 → 业务对象 */
export function advMockCaseFromRow(row: DocRecord): DocRecord {
  return {
    _id: row._id,
    interface_id: row.interface_id,
    project_id: row.project_id,
    ip_enable: row.ip_enable,
    name: row.name,
    params: readJsonCol(row.params, {}),
    uid: row.uid,
    code: row.code,
    delay: row.delay,
    headers: readJsonCol(row.headers, []),
    up_time: row.up_time,
    res_body: row.res_body,
    ip: row.ip,
    case_enable: row.case_enable,
  };
}

export const ADV_MOCK_CASE_SELECT =
  "_id, interface_id, project_id, ip_enable, name, params, uid, code, delay, headers, up_time, res_body, ip, case_enable";
