// @ts-nocheck
/**
 * Hono Context ↔ 控制器 AppContext 适配层
 *
 * 控制器通过 ctx.request / ctx.body / ctx.set 读写请求与响应，
 * 本模块负责解析 body、query、cookie，并在请求结束时写回 Hono Response。
 */
import { getCookie, setCookie } from "hono/cookie";

const SKIP_BODY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * 从 URL 解析 query 对象（同名参数转为数组）
 * @param {URL} url
 */
function parseQuery(url) {
  const query = {};
  url.searchParams.forEach((value, key) => {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      const prev = query[key];
      query[key] = Array.isArray(prev) ? [...prev, value] : [prev, value];
    } else {
      query[key] = value;
    }
  });
  return query;
}

/**
 * 将 Headers 转为小写 key 的普通对象
 * @param {Headers} rawHeaders
 */
function headersToObject(rawHeaders) {
  const header = {};
  rawHeaders.forEach((value, key) => {
    header[key.toLowerCase()] = value;
  });
  return header;
}

/**
 * 解析请求体（JSON / form / multipart / 纯文本）
 * @param {import('hono').Context} c
 */
async function parseRequestBody(c) {
  const method = c.req.method.toUpperCase();
  if (SKIP_BODY_METHODS.has(method)) {
    return {};
  }
  const contentType = c.req.header("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const json = await c.req.json();
      return json && typeof json === "object" ? json : {};
    }
    if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const form = await c.req.parseBody({ strict: false });
      const body = {};
      const files = {};
      Object.keys(form || {}).forEach((key) => {
        const val = form[key];
        if (val && typeof val === "object" && "arrayBuffer" in val) {
          files[key] = val;
          body[key] = val;
        } else {
          body[key] = val;
        }
      });
      if (Object.keys(files).length) {
        body.files = files;
      }
      return body;
    }
    const text = await c.req.text();
    if (!text) {
      return {};
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      return { _raw: text };
    }
  } catch (e) {
    return {};
  }
}

/**
 * 由 Hono Context 构建控制器可用的 AppContext
 * @param {import('hono').Context} c
 * @param {{ websocket?: import('../types/app-context.js').AppWebSocket }} [options]
 * @returns {Promise<import('../types/app-context.js').AppContext>}
 */
async function createAppContext(c, options = {}) {
  const url = new URL(c.req.url);
  const query = parseQuery(url);
  const requestBody = await parseRequestBody(c);
  const header = headersToObject(c.req.raw.headers);

  const ctx = {
    req: c.req,
    request: {
      body: requestBody,
      query,
      header,
      headers: header,
      method: c.req.method,
      path: url.pathname,
      url: c.req.url,
      files: requestBody.files || {},
    },
    query,
    params: c.req.param() || {},
    path: url.pathname,
    method: c.req.method,
    hostname: url.hostname,
    header,
    headers: header,
    body: undefined,
    status: 200,
    type: "",
    _responseHeaders: {},
    cookies: {
      get(name) {
        return getCookie(c, name);
      },
      set(name, value, opts = {}) {
        if (value === null || value === undefined) {
          setCookie(c, name, "", { ...opts, maxAge: 0 });
          return;
        }
        setCookie(c, name, value, opts);
      },
    },
    set(key, value) {
      ctx._responseHeaders[key.toLowerCase()] = value;
    },
    redirect(targetUrl) {
      ctx.status = 302;
      ctx._redirect = targetUrl;
    },
  };

  if (options.websocket) {
    ctx.websocket = options.websocket;
    ctx.ws = options.websocket;
  }

  return ctx;
}

/**
 * 将 AppContext 上的响应写回 Hono Response
 * @param {import('hono').Context} c
 * @param {import('../types/app-context.js').AppContext} ctx
 */
async function finalizeResponse(c, ctx) {
  Object.entries(ctx._responseHeaders || {}).forEach(([key, value]) => {
    c.header(key, value);
  });

  if (ctx._redirect) {
    return c.redirect(ctx._redirect, ctx.status || 302);
  }

  const status = ctx.status || 200;
  if (ctx.body === undefined) {
    return c.body(null, status);
  }

  if (typeof ctx.body === "string" || ctx.body instanceof Buffer) {
    if (ctx.type) {
      c.header("Content-Type", ctx.type);
    }
    return c.body(ctx.body, status);
  }

  return c.json(ctx.body, status);
}

export default {
  createAppContext,
  finalizeResponse,
  parseRequestBody,
};
