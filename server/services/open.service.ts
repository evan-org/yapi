/**
 * 开放 API 业务逻辑（导入、导出、自动化测试等）
 */
import axios from "axios";
import _ from "underscore";
import yapi from "../runtime.js";
import commons from "../utils/commons.js";
import {
  projectRepository,
  interfaceRepository,
  interfaceCatRepository,
  interfaceColRepository,
} from "../repositories/index.js";
import {
  handleParams as postmanHandleParams,
  crossRequest,
} from "../common/postmanLib.js";
import { handleParamsValue, ArrayToObject } from "../common/utils.js";
import createContex from "../common/createContext.js";
import HanldeImportData from "../common/HandleImportData.js";
import {
  importDataModule,
  ensureImportDataRegistry,
} from "./open-import.registry.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";
import {
  parseEnvParams,
  summarizeTestResults,
  mergeEnvReqHeaders,
} from "./open.util.js";

export {
  parseEnvParams,
  summarizeTestResults,
  mergeEnvReqHeaders,
} from "./open.util.js";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

class OpenService extends BaseService {
  projectModel = projectRepository;
  interfaceModel = interfaceRepository;
  interfaceCatModel = interfaceCatRepository;
  interfaceColModel = interfaceColRepository;

  /**
   * 拉取远程 JSON 文本（导入数据、URL 模式）
   */
  async fetchRemoteContent(url: string) {
    const { data } = await axios.get(url, {
      responseType: "text",
      transformResponse: [(r) => r],
      timeout: 30000,
    });
    return typeof data === "string" ? data : JSON.stringify(data);
  }

  /**
   * 解析导入内容为 JSON 对象
   */
  async resolveImportJson({ json, url }: { json?: string; url?: string }) {
    let content = json;
    let warnMessage = "";

    if (!content && !url) {
      return fail(40022, "json 或者 url 参数，不能都为空");
    }

    try {
      if (url) {
        content = await this.fetchRemoteContent(url);
      } else if (
        typeof content === "string" &&
        (content.indexOf("http://") === 0 || content.indexOf("https://") === 0)
      ) {
        content = await this.fetchRemoteContent(content);
      }
      return ok({ parsed: JSON.parse(content), warnMessage });
    } catch (e) {
      return fail(40022, "json 格式有误:" + errorMessage(e));
    }
  }

  /**
   * 按项目导出接口树 JSON（开放 API）
   */
  async exportProjectInterfaces(projectId: number | string) {
    const project = await this.projectModel.get(projectId);
    if (!project) {
      return fail(404, "项目不存在");
    }

    const cats = await this.interfaceCatModel.list(projectId);
    const exportList = [];

    for (let i = 0; i < cats.length; i++) {
      const cat = cats[i].toObject();
      let list = await this.interfaceModel.listByCatid(cat._id);
      list = list.sort((a, b) => (a.index || 0) - (b.index || 0));
      cat.list = list.map((item) => {
        const api = item.toObject();
        delete api.__v;
        return api;
      });
      if (cat.list.length > 0) {
        exportList.push(cat);
      }
    }

    return ok({
      project_id: project._id,
      project_name: project.name,
      basepath: project.basepath || "",
      list: exportList,
    });
  }

  /**
   * 确保项目至少有一个默认分类，返回 menuList 与 selectCatid
   */
  async ensureDefaultCat(projectId: number | string, uid: number | string) {
    let menuList = await this.interfaceCatModel.list(projectId);
    if (menuList.length === 0) {
      const menu = await this.interfaceCatModel.save({
        name: "默认分类",
        project_id: projectId,
        desc: "默认分类",
        uid,
        add_time: commons.time(),
        up_time: commons.time(),
      });
      menuList.push(menu);
    }
    return { menuList, selectCatid: menuList[0]._id };
  }

  /**
   * 开放 API：导入接口数据（postman/swagger 等）
   */
  async importData({
    type,
    json,
    url,
    project_id,
    merge,
    dataSync,
    uid,
    token,
  }: Record<string, any>) {
    ensureImportDataRegistry();
    let warnMessage = "";
    let dataSyncValue = merge;
    try {
      if (!dataSyncValue && dataSync) {
        warnMessage =
          "importData Api 已废弃 dataSync 传参，请联系管理员将 dataSync 改为 merge.";
        dataSyncValue = dataSync;
      }
    } catch (_e) {}

    const importer = importDataModule[type as string] as
      | ((content: unknown) => Promise<unknown>)
      | undefined;
    if (!type || !importer) {
      return fail(40022, "不存在的导入方式");
    }

    if (!json && !url) {
      return fail(40022, "json 或者 url 参数，不能都为空");
    }

    const resolved = await this.resolveImportJson({ json, url });
    if (!resolved.ok) {
      return resolved;
    }
    let content = resolved.data.parsed;
    if (resolved.data.warnMessage) {
      warnMessage = resolved.data.warnMessage;
    }

    const { menuList, selectCatid } = await this.ensureDefaultCat(project_id, uid);
    const projectData = await this.projectModel.get(project_id);
    const parsed = await importer(content);

    let successMessage;
    const errorMessageList: string[] = [];
    await HanldeImportData(
      parsed,
      project_id,
      selectCatid,
      menuList,
      projectData.basePath,
      dataSyncValue,
      (err: string) => {
        errorMessageList.push(err);
      },
      (msg: string) => {
        successMessage = msg;
      },
      () => {},
      token,
      yapi.WEBCONFIG.port
    );

    if (errorMessageList.length > 0) {
      return fail(404, errorMessageList.join("\n"));
    }
    const message = successMessage + warnMessage;
    return ok({ message, errcode: 0, errmsg: message });
  }

  /**
   * 变量替换（自动化测试上下文）
   */
  resolveParamValue(
    val: unknown,
    global: unknown,
    records: Record<string, unknown>
  ) {
    const globalValue = ArrayToObject(global);
    const context = Object.assign({}, { global: globalValue }, records);
    return handleParamsValue(val, context);
  }

  /**
   * 执行单条测试用例
   */
  async executeTestCase(
    interfaceData: Record<string, any>,
    uid: number | string,
    records: Record<string, unknown>
  ) {
    const handleValue = (val: unknown, global: unknown) =>
      this.resolveParamValue(val, global, records);
    const requestParams: Record<string, unknown> = {};
    let options: Record<string, any>;
    options = postmanHandleParams(interfaceData, handleValue, requestParams);
    let result: Record<string, any> = {
      id: interfaceData.id,
      name: interfaceData.casename,
      path: interfaceData.path,
      code: 400,
      validRes: [],
    };
    try {
      options.taskId = uid;
      const data = await crossRequest(
        options,
        interfaceData.pre_script,
        interfaceData.after_script,
        createContex(uid, interfaceData.project_id, interfaceData.interface_id)
      );
      const res = data.res;

      result = Object.assign(result, {
        status: res.status,
        statusText: res.statusText,
        url: data.req.url,
        method: data.req.method,
        data: data.req.data,
        headers: data.req.headers,
        res_header: res.header,
        res_body: res.body,
      });
      if (options.data && typeof options.data === "object") {
        Object.assign(requestParams, options.data);
      }

      const validRes: Array<{ message: string }> = [];
      const responseData = Object.assign(
        {},
        {
          status: res.status,
          body: res.body,
          header: res.header,
          statusText: res.statusText,
        }
      );

      await this.runScriptValidation(
        interfaceData,
        responseData,
        validRes,
        requestParams,
        uid,
        records
      );
      result.params = requestParams;
      if (validRes.length === 0) {
        result.code = 0;
        result.validRes = [{ message: "验证通过" }];
      } else {
        result.code = 1;
        result.validRes = validRes;
      }
    } catch (data: any) {
      result = Object.assign(options, result, {
        res_header: data.header,
        res_body: data.body || data.message,
        status: null,
        statusText: data.message,
        code: 400,
      });
    }

    return result;
  }

  /**
   * 用例自定义脚本校验
   */
  async runScriptValidation(
    interfaceData: Record<string, any>,
    response: Record<string, unknown>,
    validRes: Array<{ message: string }>,
    requestParams: Record<string, unknown>,
    uid: number | string,
    records: Record<string, unknown>
  ) {
    try {
      const test = await commons.runCaseScript(
        {
          response,
          records,
          script: interfaceData.test_script,
          params: requestParams,
        },
        interfaceData.col_id,
        interfaceData.interface_id
      );
      if (test.errcode !== 0) {
        test.data.logs.forEach((item: string) => {
          validRes.push({ message: item });
        });
      }
    } catch (err) {
      validRes.push({ message: "Error: " + errorMessage(err) });
    }
  }

  /**
   * 开放 API：执行测试集合自动化测试
   */
  async runAutoTest({
    colId,
    projectId,
    params,
    uid,
  }: {
    colId: number | string;
    projectId: number | string;
    params: Record<string, string | undefined>;
    uid: number | string;
  }) {
    const startTime = new Date().getTime();
    const records: Record<string, unknown> = {};
    const testList: Array<Record<string, any>> = [];
    const curEnvList = parseEnvParams(params);

    const colData = await this.interfaceColModel.get(colId);
    if (!colData) {
      return fail(40022, "id值不存在");
    }

    const projectData = await this.projectModel.get(projectId);
    const caseListResult = await commons.getCaseList(colId);
    if (caseListResult.errcode !== 0) {
      return fail(
        caseListResult.errcode,
        caseListResult.errmsg || "获取用例失败",
        caseListResult
      );
    }

    let caseList = caseListResult.data;
    for (let i = 0, l = caseList.length; i < l; i++) {
      let item = caseList[i];
      const projectEvn = await this.projectModel.getByEnv(item.project_id);

      item.id = item._id;
      const curEnvItem = _.find(
        curEnvList,
        (key) => key.project_id == item.project_id
      );
      item.case_env = curEnvItem ? curEnvItem.curEnv || item.case_env : item.case_env;
      item.req_headers = mergeEnvReqHeaders(
        item.req_headers,
        projectEvn.env,
        item.case_env
      );
      item.pre_script = projectData.pre_script;
      item.after_script = projectData.after_script;
      item.env = projectEvn.env;

      let result;
      try {
        result = await this.executeTestCase(item, uid, records);
      } catch (err) {
        result = err;
      }

      records[item.id] = {
        params: result.params,
        body: result.res_body,
      };
      testList.push(result);
    }

    const endTime = new Date().getTime();
    const executionTime = (endTime - startTime) / 1000;
    const message = summarizeTestResults(testList);

    return ok({
      reportsResult: {
        message,
        runTime: executionTime + "s",
        numbs: testList.length,
        list: testList,
      },
      projectId,
      colId,
      params,
    });
  }
}

export default new OpenService();
