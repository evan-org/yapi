/**
 * 将 Hono Context 适配为 YApi 控制器沿用的 Koa 风格 ctx，减少业务层改动
 */
const { getCookie, setCookie } = require("hono/cookie");

/**
 * 解析请求体（JSON / form / multipart），对齐 koa-body 行为
 * @param {import('hono').Context} c
 */
async function parseRequestBody(c) {
  const method = c.req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
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
 * 构建 Koa 兼容上下文
 * @param {import('hono').Context} c
 * @param {{ websocket?: object }} options
 */
async function createKoaContext(c, options = {}) {
  const url = new URL(c.req.url);
  const query = {};
  url.searchParams.forEach((value, key) => {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      const prev = query[key];
      query[key] = Array.isArray(prev) ? [...prev, value] : [prev, value];
    } else {
      query[key] = value;
    }
  });

  const requestBody = await parseRequestBody(c);
  const header = {};
  c.req.raw.headers.forEach((value, key) => {
    header[key.toLowerCase()] = value;
  });

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
    redirect(url) {
      ctx.status = 302;
      ctx._redirect = url;
    },
  };

  if (options.websocket) {
    const ws = options.websocket;
    const wsApi = {
      send(data) {
        ws.send(typeof data === "string" ? data : JSON.stringify(data));
      },
      on(event, handler) {
        if (event === "close") {
          ws.addEventListener("close", handler);
        }
        if (event === "message") {
          ws.addEventListener("message", (evt) => handler(evt.data));
        }
      },
    };
    ctx.websocket = wsApi;
    ctx.ws = wsApi;
  }

  return ctx;
}

/**
 * 将 ctx 上的响应写回 Hono
 * @param {import('hono').Context} c
 * @param {object} ctx
 */
async function finalizeKoaContext(c, ctx) {
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

module.exports = {
  createKoaContext,
  finalizeKoaContext,
  parseRequestBody,
};
