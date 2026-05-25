// @ts-nocheck
/**
 * Service 层统一返回结构
 */
export function ok(data) {
  return { ok: true, data };
}

export function fail(code, message, data) {
  const result = { ok: false, code, message };
  if (data !== undefined) {
    result.data = data;
  }
  return result;
}
