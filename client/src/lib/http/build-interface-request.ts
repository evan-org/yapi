/**
 * 根据接口定义拼接调试请求的 URL 与 fetch 参数
 */

export interface RequestParamRow {
  name: string;
  value?: string;
  example?: string;
  type?: string;
}

export interface BuildInterfaceRequestInput {
  /** 环境域名，如 https://api.example.com */
  baseUrl: string;
  /** 项目 basepath */
  basepath?: string;
  path: string;
  method?: string;
  req_query?: RequestParamRow[];
  req_params?: RequestParamRow[];
  req_headers?: RequestParamRow[];
  req_body_type?: string;
  req_body_other?: string;
  req_body_form?: RequestParamRow[];
}

/** 拼接完整请求 URL（含路径参数、Query） */
export function buildInterfaceUrl(input: BuildInterfaceRequestInput): string {
  let path = input.path || "/";
  (input.req_params || []).forEach((p) => {
    if (!p.name) return;
    const val = encodeURIComponent(p.value || p.example || "");
    path = path.replace(`:${p.name}`, val).replace(`{${p.name}}`, val);
  });
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  const base = (input.baseUrl || "").replace(/\/$/, "");
  const bp = (input.basepath || "").replace(/\/$/, "");
  let url = `${base}${bp}${path}`.replace(/([^:]\/)\/+/g, "$1");

  const qs = new URLSearchParams();
  (input.req_query || []).forEach((q) => {
    if (q.name) {
      qs.append(q.name, q.value || q.example || "");
    }
  });
  const qsStr = qs.toString();
  if (qsStr) {
    url += url.includes("?") ? `&${qsStr}` : `?${qsStr}`;
  }
  return url;
}

/** 构建 fetch 的 headers 与 body */
export function buildInterfaceFetchInit(input: BuildInterfaceRequestInput): {
  headers: Record<string, string>;
  body?: string | FormData;
} {
  const headers: Record<string, string> = {};
  (input.req_headers || []).forEach((h) => {
    if (h.name) {
      headers[h.name] = h.value || h.example || "";
    }
  });

  const method = (input.method || "GET").toUpperCase();
  let body: string | FormData | undefined;

  if (input.req_body_type === "form" && input.req_body_form?.length) {
    const hasFile = input.req_body_form.some((f) => f.type === "file");
    if (hasFile) {
      const fd = new FormData();
      input.req_body_form.forEach((f) => {
        if (f.name) {
          fd.append(f.name, f.value || f.example || "");
        }
      });
      body = fd;
      if (!headers["Content-Type"]) {
        delete headers["Content-Type"];
      }
    } else {
      const params = new URLSearchParams();
      input.req_body_form.forEach((f) => {
        if (f.name) {
          params.append(f.name, f.value || f.example || "");
        }
      });
      body = params.toString();
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      }
    }
  } else if (input.req_body_type === "json" && input.req_body_other) {
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    body = input.req_body_other;
  } else if (input.req_body_other && !["GET", "HEAD"].includes(method)) {
    body = input.req_body_other;
  }

  if (["GET", "HEAD"].includes(method)) {
    body = undefined;
  }

  return { headers, body };
}
