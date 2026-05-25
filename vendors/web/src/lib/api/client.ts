/**
 * 浏览器端 API 客户端：对接 Hono /api，携带 Cookie 登录态
 */
import { ApiCode, type ApiEnvelope } from "./types";

const API_BASE = "/api";

export class ApiError extends Error {
  errcode: number;
  apiData?: unknown;

  constructor(message: string, errcode: number, apiData?: unknown) {
    super(message);
    this.name = "ApiError";
    this.errcode = errcode;
    this.apiData = apiData;
  }
}

function isEnvelope(body: unknown): body is ApiEnvelope {
  return (
    typeof body === "object" &&
    body !== null &&
    "errcode" in body &&
    "errmsg" in body
  );
}

/**
 * 发起 JSON API 请求
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiEnvelope<T>> {
  const url = path.startsWith("/api") ? path : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new ApiError(`非 JSON 响应: ${url}`, -1);
  }

  const body = (await res.json()) as ApiEnvelope<T>;
  if (!isEnvelope(body)) {
    throw new ApiError("响应格式无效", -1);
  }

  if (body.errcode === ApiCode.NOT_LOGIN) {
    return body;
  }

  if (body.errcode !== ApiCode.SUCCESS) {
    throw new ApiError(body.errmsg || "请求失败", body.errcode, body.data);
  }

  return body;
}

export const userApi = {
  status: () => apiRequest("/user/status"),
  login: (email: string, password: string) =>
    apiRequest("/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  loginLdap: (email: string, password: string) =>
    apiRequest("/user/login_by_ldap", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => apiRequest("/user/logout"),
  register: (payload: Record<string, string>) =>
    apiRequest("/user/reg", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const groupApi = {
  /** 我的私人分组 */
  myPrivate: () => apiRequest<import("./types").GroupItem>("/group/get_mygroup"),
  /** 可见分组列表 */
  list: () => apiRequest<import("./types").GroupItem[]>("/group/list"),
  get: (id: number) => apiRequest<import("./types").GroupItem>(`/group/get?id=${id}`),
};

export const projectApi = {
  listByGroup: (group_id: number) =>
    apiRequest<{ list: import("./types").ProjectItem[] }>(
      `/project/list?group_id=${group_id}`
    ),
  get: (id: number) => apiRequest(`/project/get?id=${id}`),
};
