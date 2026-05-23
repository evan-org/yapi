/**
 * 将 Fastify request/reply 适配为 Koa 风格的 ctx，便于复用现有 controller。
 */
function createKoaCookies(request, reply) {
  return {
    get(name) {
      return request.cookies ? request.cookies[name] : undefined;
    },
    set(name, value, opts = {}) {
      if (value === null || value === undefined) {
        reply.clearCookie(name);
        return;
      }
      const cookieOpts = {};
      if (opts.expires) {
        cookieOpts.expires = opts.expires;
      }
      if (opts.httpOnly !== undefined) {
        cookieOpts.httpOnly = opts.httpOnly;
      }
      if (opts.maxAge !== undefined) {
        cookieOpts.maxAge = opts.maxAge;
      }
      reply.setCookie(name, String(value), cookieOpts);
    }
  };
}

/**
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 * @param {{ ws?: object }} [options]
 */
function createKoaContext(request, reply, options = {}) {
  let _body;
  let _path = request._yapiPath || request.url.split("?")[0];

  const ctx = {
    request: {
      get header() {
        return request.headers;
      },
      get body() {
        return request._yapiBody !== undefined ? request._yapiBody : request.body || {};
      },
      set body(val) {
        request._yapiBody = val;
      },
      get query() {
        return request.query || {};
      }
    },
    get query() {
      return request.query || {};
    },
    params: request.params || {},
    get path() {
      return _path;
    },
    set path(val) {
      _path = val;
      request._yapiPath = val;
    },
    get method() {
      return request.method;
    },
    get ip() {
      return request.ip;
    },
    get hostname() {
      return request.hostname;
    },
    cookies: createKoaCookies(request, reply),
    get ws() {
      return options.ws;
    },
    set ws(val) {
      options.ws = val;
    },
    get websocket() {
      return options.ws;
    },
    set(key, val) {
      reply.header(key, val);
    },
    get status() {
      return reply.statusCode;
    },
    set status(code) {
      reply.code(code);
    },
    redirect(url) {
      reply.redirect(url);
    },
    get body() {
      return _body;
    },
    set body(val) {
      _body = val;
      reply.send(val);
    }
  };

  return ctx;
}

module.exports = {
  createKoaContext
};
