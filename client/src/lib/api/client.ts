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

/**
 * 原始 JSON 接口（如 schema2json，不经标准信封包装）
 */
export async function apiRequestRaw<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
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

  return (await res.json()) as T;
}

export { interfaceApi } from "./interface";
export { followApi } from "./follow";
export { logApi } from "./log";
export { projectApi } from "./project";
export { groupApi } from "./group";
export { colApi } from "./col";
export { userApi } from "./user";
export { builtinApi } from "./builtin";
export { openApi } from "./open";


