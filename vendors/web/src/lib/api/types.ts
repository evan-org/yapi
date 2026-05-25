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

export interface ProjectItem {
  _id: number;
  name: string;
  desc?: string;
  basepath?: string;
  group_id: number;
  project_type?: string;
  icon?: string;
  color?: string;
}
