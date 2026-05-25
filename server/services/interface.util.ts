/**
 * 接口模块纯函数（路径解析、列表过滤、保存时 Schema 合并等，便于单测）
 */
import url from "url";
import mergeJsonSchema from "../utils/mergeJsonSchema.js";
import commons from "../utils/commons.js";

/**
 * 根据请求体类型补全 Content-Type 请求头
 */
export function handleHeaders(values: Record<string, unknown>) {
  let isfile = false;
  let isHaveContentType = false;
  if (values.req_body_type === "form") {
    const form = values.req_body_form as Array<{ type?: string }>;
    form.forEach((item) => {
      if (item.type === "file") {
        isfile = true;
      }
    });

    const headers = values.req_headers as Array<{ name: string; value: string }>;
    headers.map((item) => {
      if (item.name === "Content-Type") {
        item.value = isfile
          ? "multipart/form-data"
          : "application/x-www-form-urlencoded";
        isHaveContentType = true;
      }
    });
    if (isHaveContentType === false) {
      headers.unshift({
        name: "Content-Type",
        value: isfile
          ? "multipart/form-data"
          : "application/x-www-form-urlencoded",
      });
    }
  } else if (values.req_body_type === "json") {
    const headers = (values.req_headers as Array<{ name: string; value: string }>) || [];
    headers.map((item) => {
      if (item.name === "Content-Type") {
        item.value = "application/json";
        isHaveContentType = true;
      }
    });
    if (isHaveContentType === false) {
      values.req_headers = values.req_headers || [];
      (values.req_headers as Array<{ name: string; value: string }>).unshift({
        name: "Content-Type",
        value: "application/json",
      });
    }
  }
}

/**
 * 从 path 解析 query_path（pathname + query 参数列表）
 */
export function buildQueryPathFromUrl(pathStr: string) {
  const http_path = url.parse(pathStr, true);
  const query_path: { path: string; params: Array<{ name: string; value: unknown }> } = {
    path: http_path.pathname,
    params: [],
  };
  Object.keys(http_path.query).forEach((item) => {
    query_path.params.push({
      name: item,
      value: http_path.query[item],
    });
  });
  return { http_path, query_path };
}

/**
 * 列表查询 option 附加 status / tag 过滤
 */
export function applyStatusTagFilter(
  option: Record<string, unknown>,
  status?: string | string[],
  tag?: string | string[]
) {
  if (status) {
    option.status = Array.isArray(status) ? { $in: status } : status;
  }
  if (tag) {
    option.tag = Array.isArray(tag) ? { $in: tag } : tag;
  }
  return option;
}

/**
 * dataSync=good 时合并新旧 JSON Schema 响应体
 */
export function mergeSaveResBody(
  params: { res_body_is_json_schema?: boolean; dataSync?: string; res_body?: string },
  existingItem: { res_body?: string }
) {
  if (!params.res_body_is_json_schema || params.dataSync !== "good") {
    return params.res_body;
  }
  try {
    const newResBody = commons.json_parse(params.res_body);
    const oldResBody = commons.json_parse(existingItem.res_body);
    return JSON.stringify(mergeJsonSchema(oldResBody, newResBody), null, 2);
  } catch (_err) {
    return params.res_body;
  }
}
