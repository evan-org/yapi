// @ts-nocheck
/**
 * 高级 Mock 期望管理 API 业务逻辑（CRUD）
 * Mock 运行时匹配见 advancedMock.service.ts
 */
import yapi from "../runtime.js";
import {
  advancedMockRepository,
  advancedMockCaseRepository,
  userRepository,
} from "../repositories/index.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";

/** 高级 Mock 期望允许的 HTTP 状态码 */
const HTTP_CODES = [
  100, 101, 102, 200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301,
  302, 303, 304, 305, 307, 308, 400, 401, 402, 403, 404, 405, 406, 407, 408,
  409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 422, 423, 424, 426, 428,
  429, 431, 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511,
];

type MockSaveParams = {
  interface_id: number;
  project_id: number;
  mock_script?: string;
  enable?: boolean;
};

type CaseSaveParams = {
  id?: number;
  interface_id: number;
  project_id: number;
  ip_enable?: boolean;
  name?: string;
  params?: Record<string, unknown>;
  code?: number;
  delay?: number;
  headers?: unknown[];
  res_body: string;
  ip?: string;
};

class AdvancedMockApiService extends BaseService {
  mockModel = advancedMockRepository;
  caseModel = advancedMockCaseRepository;
  userModel = userRepository;

  async getByInterfaceId(interfaceId: number | string | undefined | null) {
    if (!interfaceId) {
      return fail(408, "缺少interface_id");
    }
    const mockData = await this.mockModel.get(interfaceId);
    if (!mockData) {
      return fail(408, "mock脚本不存在");
    }
    return ok(mockData);
  }

  async saveScript(params: MockSaveParams, uid: number) {
    if (!params.interface_id) {
      return fail(408, "缺少interface_id");
    }
    if (!params.project_id) {
      return fail(408, "缺少project_id");
    }

    const data = {
      interface_id: params.interface_id,
      mock_script: params.mock_script || "",
      project_id: params.project_id,
      uid,
      enable: params.enable === true,
    };

    const mockData = await this.mockModel.get(data.interface_id);
    const result = mockData
      ? await this.mockModel.up(data)
      : await this.mockModel.save(data);
    return ok(result);
  }

  async listCases(interfaceId: number | string | undefined | null) {
    if (!interfaceId) {
      return fail(400, "缺少 interface_id");
    }
    const result = await this.caseModel.list(interfaceId);
    for (let i = 0; i < result.length; i++) {
      const userinfo = await this.userModel.findById(result[i].uid);
      result[i].username = userinfo?.username;
    }
    return ok(result);
  }

  async getCase(id: number | string | undefined | null) {
    if (!id) {
      return fail(400, "缺少 id");
    }
    const result = await this.caseModel.get({ _id: id });
    return ok(result);
  }

  async saveCase(params: CaseSaveParams, uid: number) {
    if (!params.interface_id) {
      return fail(408, "缺少interface_id");
    }
    if (!params.project_id) {
      return fail(408, "缺少project_id");
    }
    if (!params.res_body) {
      return fail(408, "请输入 Response Body");
    }

    const data = {
      interface_id: params.interface_id,
      project_id: params.project_id,
      ip_enable: params.ip_enable,
      name: params.name,
      params: params.params || [],
      uid,
      code: params.code || 200,
      delay: params.delay || 0,
      headers: params.headers || [],
      up_time: yapi.commons.time(),
      res_body: params.res_body,
      ip: params.ip,
    };

    data.code = isNaN(data.code) ? 200 : +data.code;
    data.delay = isNaN(data.delay) ? 0 : +data.delay;
    if (HTTP_CODES.indexOf(data.code) === -1) {
      return fail(408, "非法的 httpCode");
    }

    const findRepeatParams: Record<string, unknown> = {
      project_id: data.project_id,
      interface_id: data.interface_id,
      ip_enable: data.ip_enable,
    };

    if (
      data.params &&
      typeof data.params === "object" &&
      Object.keys(data.params).length > 0
    ) {
      for (const key in data.params) {
        findRepeatParams["params." + key] = data.params[key];
      }
    }

    if (data.ip_enable) {
      findRepeatParams.ip = data.ip;
    }

    const findRepeat = await this.caseModel.get(findRepeatParams);
    if (findRepeat && findRepeat._id !== params.id) {
      return fail(400, "已存在的期望");
    }

    let result;
    if (params.id && !isNaN(params.id)) {
      result = await this.caseModel.up({ ...data, id: +params.id });
    } else {
      result = await this.caseModel.save(data);
    }
    return ok(result);
  }

  async deleteCase(id: number | string | undefined | null) {
    if (!id) {
      return fail(408, "缺少 id");
    }
    const result = await this.caseModel.del(id);
    return ok(result);
  }

  async hideCase(id: number | string | undefined | null, enable: boolean) {
    if (!id) {
      return fail(408, "缺少 id");
    }
    const result = await this.caseModel.up({ id, case_enable: enable });
    return ok(result);
  }
}

export default new AdvancedMockApiService();
