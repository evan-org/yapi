/**
 * Service 层统一返回结构
 */
export type ServiceOk<T> = { ok: true; data: T };

export type ServiceFail = {
  ok: false;
  code: number;
  message: string;
  data?: unknown;
};

export type ServiceResult<T> = ServiceOk<T> | ServiceFail;

export function ok<T>(data: T): ServiceOk<T> {
  return { ok: true, data };
}

export function fail(code: number, message: string, data?: unknown): ServiceFail {
  const result: ServiceFail = { ok: false, code, message };
  if (data !== undefined) {
    result.data = data;
  }
  return result;
}
