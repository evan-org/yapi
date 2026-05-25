/**
 * YApi 标准 API 响应类型（与 common/apiResponse 对齐）
 */

/** 业务状态码 */
export const ApiCode = {
  SUCCESS: 0,
  NOT_LOGIN: 40011,
} as const;

/** 标准 JSON 信封 */
export interface ApiEnvelope<T = unknown> {
  errcode: number;
  errmsg: string;
  data: T;
}

/** 登录态检查返回 */
export interface LoginStatusData {
  _id: number;
  username: string;
  email: string;
  role: string;
  type: string;
  study?: boolean;
}

export interface GroupItem {
  _id: number;
  group_name: string;
  group_desc?: string;
  type: "public" | "private";
  role?: string;
}

export interface ProjectTagItem {
  name: string;
  desc?: string;
}

export interface ProjectItem {
  _id: number;
  name: string;
  desc?: string;
  basepath?: string;
  group_id: number;
  tag?: ProjectTagItem[];
  project_type?: "public" | "private";
  icon?: string;
  color?: string;
  env?: unknown[];
  [key: string]: unknown;
}

/** 接口分类 */
export interface InterfaceCatItem {
  _id: number;
  name: string;
  project_id: number;
  desc?: string;
  index?: number;
  list: InterfaceListItem[];
}

/** 接口列表项 */
export interface InterfaceListItem {
  _id: number;
  title: string;
  path: string;
  method: string;
  catid: number;
  project_id: number;
  status?: string;
  tag?: string[];
}

/** 接口详情 */
export interface InterfaceDetail extends InterfaceListItem {
  desc?: string;
  markdown?: string;
  api_opened?: boolean;
  req_body_is_json_schema?: boolean;
  res_body_is_json_schema?: boolean;
  req_params?: { name: string; example?: string; desc?: string }[];
  req_query?: { name: string; value?: string; example?: string; desc?: string; required?: string }[];
  req_headers?: { name: string; value?: string; example?: string; desc?: string; required?: string }[];
  req_body_type?: string;
  req_body_form?: unknown[];
  req_body_other?: string;
  res_body_type?: string;
  res_body?: string;
  username?: string;
  up_time?: number;
  add_time?: number;
}

export interface FollowItem {
  _id: number;
  uid: number;
  projectid: number;
  projectname?: string;
  icon?: string;
  color?: string;
}

export interface LogItem {
  _id: number;
  type: string;
  typeid: number;
  content: string;
  username?: string;
  add_time: number;
  [key: string]: unknown;
}

export interface PaginatedList<T> {
  count: number;
  total: number;
  list: T[];
}

/** 测试集合 */
export interface InterfaceColItem {
  _id: number;
  name: string;
  project_id: number;
  desc?: string;
  caseList?: InterfaceCaseItem[];
}

/** 测试用例 */
export interface InterfaceCaseItem {
  _id: number;
  casename: string;
  interface_id: number;
  col_id: number;
  path?: string;
  method?: string;
  test_script?: string;
  test_status?: string;
}

/** 测试集合通用规则 */
export interface ColCheckScriptRule {
  enable?: boolean;
  content?: string;
}

export interface ColCheckResponseFieldRule {
  enable?: boolean;
  name?: string;
  value?: string;
}

/** 测试集合（含通用规则字段） */
export interface InterfaceColDetail extends InterfaceColItem {
  checkHttpCodeIs200?: boolean;
  checkResponseSchema?: boolean;
  checkResponseField?: ColCheckResponseFieldRule;
  checkScript?: ColCheckScriptRule;
}

/** 成员 */
export interface MemberItem {
  uid: number;
  username: string;
  email?: string;
  role: string;
}

/** 环境 Header / 全局变量键值 */
export interface ProjectEnvKeyValue {
  name: string;
  value?: string;
}

/** 项目环境 */
export interface ProjectEnvItem {
  name: string;
  domain: string;
  header?: ProjectEnvKeyValue[];
  global?: ProjectEnvKeyValue[];
}

/** 项目脚本与环境扩展字段 */
export interface ProjectScriptsPayload {
  pre_script?: string;
  after_script?: string;
  project_mock_script?: string;
}
