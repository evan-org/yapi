/**
 * 测试集合（interfaceCol / interfaceCase）业务逻辑
 */
import commons from "../utils/commons.js";
import {
  interfaceColRepository,
  interfaceCaseRepository,
  interfaceRepository,
  projectRepository,
} from "../repositories/index.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";
import {
  validateAddColParams,
  validateAddCaseParams,
  validateCaseId,
  validateAddCaseListInput,
  validateCloneCaseListInput,
  validateColIndexBatchItems,
  validateColId,
} from "./interfaceCol.validation.js";

class InterfaceColService extends BaseService {
  colModel = interfaceColRepository;
  caseModel = interfaceCaseRepository;
  interfaceModel = interfaceRepository;
  projectModel = projectRepository;

  /**
   * 获取项目基础信息（列表页鉴权用）
   */
  async getProjectBaseInfo(projectId) {
    const project = await this.projectModel.getBaseInfo(projectId);
    if (!project) {
      return fail(407, "不存在的项目");
    }
    return ok(project);
  }

  /**
   * 测试集合列表（含用例与接口 path）
   */
  async listWithCases(projectId) {
    let result = await this.colModel.list(projectId);
    result = result.sort((a, b) => a.index - b.index);

    result = await Promise.all(
      result.map(async (colRow) => {
        const col = colRow.toObject();
        let caseList = await this.caseModel.list(col._id);
        const interfaceIds = [
          ...new Set(caseList.map((c) => c.interface_id).filter(Boolean)),
        ];
        const pathByInterfaceId: Record<string | number, string> = {};
        await Promise.all(
          interfaceIds.map(async (interfaceId: string | number) => {
            const iface = await this.interfaceModel.getBaseinfo(interfaceId);
            if (iface) {
              pathByInterfaceId[interfaceId] = iface.path;
            }
          })
        );
        caseList = caseList
          .map((c) => {
            const item = c.toObject();
            item.path = pathByInterfaceId[item.interface_id];
            return item;
          })
          .sort((a, b) => a.index - b.index);
        col.caseList = caseList;
        return col;
      })
    );
    return ok(result);
  }

  /**
   * 新增测试集合
   */
  async addCol(params) {
    const validated = validateAddColParams(params);
    if (!validated.ok) {
      return validated;
    }
    const { name, project_id, desc, uid, username } = validated.data;
    const result = await this.colModel.save({
      name,
      project_id,
      desc,
      uid,
      add_time: commons.time(),
      up_time: commons.time(),
    });
    commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 添加了接口集 <a href="/project/${project_id}/interface/col/${result._id}">${name}</a>`,
      type: "project",
      uid,
      username,
      typeid: project_id,
    });
    return ok(result);
  }

  /**
   * 删除测试集合及下属用例
   */
  async deleteCol(colId, { uid, username }) {
    const colData = await this.colModel.get(colId);
    if (!colData) {
      return fail(400, "不存在的id");
    }
    const result = await this.colModel.del(colId);
    await this.caseModel.delByCol(colId);
    commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 删除了接口集 ${colData.name} 及其下面的接口`,
      type: "project",
      uid,
      username,
      typeid: colData.project_id,
    });
    return ok({ result, colData });
  }

  /**
   * 删除单个测试用例
   */
  async deleteCase(caseId, { uid, username }) {
    const caseData = await this.caseModel.get(caseId);
    if (!caseData) {
      return fail(400, "不存在的caseid");
    }
    const result = await this.caseModel.del(caseId);
    const col = await this.colModel.get(caseData.col_id);
    if (col) {
      commons.saveLog({
        content: `<a href="/user/profile/${uid}">${username}</a> 删除了接口集 <a href="/project/${caseData.project_id}/interface/col/${caseData.col_id}">${col.name}</a> 下的接口 ${caseData.casename}`,
        type: "project",
        uid,
        username,
        typeid: caseData.project_id,
      });
    }
    await this.projectModel.up(caseData.project_id, {
      up_time: new Date().getTime(),
    });
    return ok({ result, caseData });
  }

  /**
   * 新增测试用例
   */
  async addCase(params, { uid, username }) {
    const validated = validateAddCaseParams(params);
    if (!validated.ok) {
      return validated;
    }
    const saveData = Object.assign({}, validated.data, {
      uid,
      index: 0,
      add_time: commons.time(),
      up_time: commons.time(),
    });
    const result = await this.caseModel.save(saveData);
    const { project_id, col_id, casename } = validated.data;

    this.colModel.get(col_id).then((col) => {
      commons.saveLog({
        content: `<a href="/user/profile/${uid}">${username}</a> 在接口集 <a href="/project/${project_id}/interface/col/${col_id}">${col.name}</a> 下添加了测试用例 <a href="/project/${project_id}/interface/case/${result._id}">${casename}</a>`,
        type: "project",
        uid,
        username,
        typeid: project_id,
      });
    });
    this.projectModel.up(project_id, { up_time: new Date().getTime() }).then();
    return ok(result);
  }

  /**
   * 更新测试用例（不允许改 interface_id / project_id）
   */
  async updateCase(params, { uid, username }) {
    const idValidated = validateCaseId(params.id);
    if (!idValidated.ok) {
      return idValidated;
    }
    const caseData = await this.caseModel.get(idValidated.data);
    if (!caseData) {
      return fail(400, "不存在的caseid");
    }

    const updateParams = Object.assign({}, params, { uid });
    delete updateParams.interface_id;
    delete updateParams.project_id;

    const result = await this.caseModel.up(idValidated.data, updateParams);
    this.colModel.get(caseData.col_id).then((col) => {
      commons.saveLog({
        content: `<a href="/user/profile/${uid}">${username}</a> 在接口集 <a href="/project/${caseData.project_id}/interface/col/${caseData.col_id}">${col.name}</a> 更新了测试用例 <a href="/project/${caseData.project_id}/interface/case/${idValidated.data}">${params.casename || caseData.casename}</a>`,
        type: "project",
        uid,
        username,
        typeid: caseData.project_id,
      });
    });
    this.projectModel.up(caseData.project_id, { up_time: new Date().getTime() }).then();
    return ok(result);
  }

  /**
   * 请求参数数组转空值对象（变量提取用）
   */
  requestParamsToObj(arr) {
    if (!arr || !Array.isArray(arr) || arr.length === 0) {
      return {};
    }
    const obj = {};
    arr.forEach((item) => {
      obj[item.name] = "";
    });
    return obj;
  }

  /**
   * 数组按字段去重并返回字段值列表
   */
  uniqueFieldValues(array, field) {
    const hash = {};
    const arr = array.reduce(function (item, next) {
      hash[next[field]] ? "" : (hash[next[field]] = true && item.push(next));
      return item;
    }, []);
    return arr.map((item) => item[field]);
  }

  /**
   * 测试用例详情（合并接口定义与用例覆盖值）
   */
  async getCaseDetail(caseId) {
    let result = await this.caseModel.get(caseId);
    if (!result) {
      return fail(400, "不存在的case");
    }
    result = result.toObject();
    let data = await this.interfaceModel.get(result.interface_id);
    if (!data) {
      return fail(400, "找不到对应的接口，请联系管理员");
    }
    data = data.toObject();

    const projectData = await this.projectModel.getBaseInfo(data.project_id);
    result.path = projectData.basepath + data.path;
    result.method = data.method;
    result.req_body_type = data.req_body_type;
    result.req_headers = commons.handleParamsValue(data.req_headers, result.req_headers);
    result.res_body = data.res_body;
    result.res_body_type = data.res_body_type;
    result.req_body_form = commons.handleParamsValue(
      data.req_body_form,
      result.req_body_form
    );
    result.req_query = commons.handleParamsValue(data.req_query, result.req_query);
    result.req_params = commons.handleParamsValue(data.req_params, result.req_params);
    result.interface_up_time = data.up_time;
    result.req_body_is_json_schema = data.req_body_is_json_schema;
    result.res_body_is_json_schema = data.res_body_is_json_schema;
    return ok(result);
  }

  /**
   * 更新测试集合名称或描述
   */
  async updateCol(colId, params, { uid, username }) {
    const colData = await this.colModel.get(colId);
    if (!colData) {
      return fail(400, "不存在");
    }
    const result = await this.colModel.up(colId, params);
    commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 更新了测试集合 <a href="/project/${colData.project_id}/interface/col/${colId}">${colData.name}</a> 的信息`,
      type: "project",
      uid,
      username,
      typeid: colData.project_id,
    });
    return ok(result);
  }

  /**
   * 批量从接口列表导入测试用例
   */
  async addCaseList(input, { uid, username }) {
    const validated = validateAddCaseListInput(input);
    if (!validated.ok) {
      return validated;
    }
    const { project_id, col_id, interface_list } = validated.data;

    const data: Record<string, any> = {
      uid,
      index: 0,
      add_time: commons.time(),
      up_time: commons.time(),
      project_id,
      col_id,
    };

    for (let i = 0; i < interface_list.length; i++) {
      const interfaceData = await this.interfaceModel.get(interface_list[i]);
      data.interface_id = interface_list[i];
      data.casename = interfaceData.title;

      if (
        interfaceData.req_body_type === "json" &&
        interfaceData.req_body_other &&
        interfaceData.req_body_is_json_schema
      ) {
        let req_body_other = commons.json_parse(interfaceData.req_body_other);
        req_body_other = commons.schemaToJson(req_body_other, {
          alwaysFakeOptionals: true,
        });
        data.req_body_other = JSON.stringify(req_body_other);
      } else {
        data.req_body_other = interfaceData.req_body_other;
      }

      data.req_body_type = interfaceData.req_body_type;
      const caseResultData = await this.caseModel.save(data);
      this.colModel.get(col_id).then((col) => {
        commons.saveLog({
          content: `<a href="/user/profile/${uid}">${username}</a> 在接口集 <a href="/project/${project_id}/interface/col/${col_id}">${col.name}</a> 下导入了测试用例 <a href="/project/${project_id}/interface/case/${caseResultData._id}">${data.casename}</a>`,
          type: "project",
          uid,
          username,
          typeid: project_id,
        });
      });
    }

    this.projectModel.up(project_id, { up_time: new Date().getTime() }).then();
    return ok("ok");
  }

  /**
   * 克隆测试集合下的用例到另一集合（含 $ 引用 id 替换）
   */
  async cloneCaseList(input) {
    const validated = validateCloneCaseListInput(input);
    if (!validated.ok) {
      return validated;
    }
    const { project_id, col_id, new_col_id } = validated.data;

    let oldColCaselistData = await this.caseModel.list(col_id, "all");
    oldColCaselistData = oldColCaselistData.sort((a, b) => a.index - b.index);

    const newCaseList = [];
    const oldCaseObj = {};

    const handleReplaceStr = (str) => {
      if (str.indexOf("$") !== -1) {
        str = str.replace(/\$\.([0-9]+)\./g, function (match, p1) {
          p1 = p1.toString();
          return `$.${newCaseList[oldCaseObj[p1]]}.` || "";
        });
      }
      return str;
    };

    const handleTypeParams = (data, name) => {
      let res = data[name];
      const type = Object.prototype.toString.call(res);
      if (type === "[object Array]" && res.length) {
        res = JSON.stringify(res);
        try {
          res = JSON.parse(handleReplaceStr(res));
        } catch (e) {
          console.log("e ->", e);
        }
      } else if (type === "[object String]" && data[name]) {
        res = handleReplaceStr(res);
      }
      return res;
    };

    const handleParams = (row) => {
      row.col_id = new_col_id;
      delete row._id;
      delete row.add_time;
      delete row.up_time;
      delete row.__v;
      row.req_body_other = handleTypeParams(row, "req_body_other");
      row.req_query = handleTypeParams(row, "req_query");
      row.req_params = handleTypeParams(row, "req_params");
      row.req_body_form = handleTypeParams(row, "req_body_form");
      return row;
    };

    for (let i = 0; i < oldColCaselistData.length; i++) {
      const obj = oldColCaselistData[i].toObject();
      oldCaseObj[obj._id] = i;
      const caseData = handleParams(obj);
      const newCase = await this.caseModel.save(caseData);
      newCaseList.push(newCase._id);
    }

    this.projectModel.up(project_id, { up_time: new Date().getTime() }).then();
    return ok("ok");
  }

  /**
   * 接口集下用例涉及的项目环境列表
   */
  async getCaseEnvList(colId) {
    const colValidated = validateColId(colId, "col_id不能为空");
    if (!colValidated.ok) {
      return colValidated;
    }
    colId = colValidated.data;
    const colData = await this.colModel.get(colId);
    if (!colData) {
      return fail(400, "不存在的接口集");
    }

    let projectList = await this.caseModel.list(colId, "project_id");
    projectList = this.uniqueFieldValues(projectList, "project_id");

    const projectEnvList = [];
    for (let i = 0; i < projectList.length; i++) {
      const result = await this.projectModel.getBaseInfo(projectList[i], "name  env");
      projectEnvList.push(result);
    }
    return ok(projectEnvList);
  }

  /**
   * 按变量参数聚合的用例列表（自动清理孤儿用例）
   */
  async getCaseListByVariableParams(colId) {
    const colValidated = validateColId(colId, "col_id不能为空");
    if (!colValidated.ok) {
      return colValidated;
    }
    colId = colValidated.data;
    let resultList = await this.caseModel.list(colId, "all");
    if (resultList.length === 0) {
      return ok([]);
    }

    for (let index = 0; index < resultList.length; index++) {
      const result = resultList[index].toObject();
      const item: Record<string, any> = {};
      let body;
      let query;
      let bodyParams;
      let pathParams;
      const data = await this.interfaceModel.get(result.interface_id);
      if (!data) {
        await this.caseModel.del(result._id);
        continue;
      }
      item._id = result._id;
      item.casename = result.casename;
      body = commons.json_parse(data.res_body);
      body = typeof body === "object" ? body : {};
      if (data.res_body_is_json_schema) {
        body = commons.schemaToJson(body, {
          alwaysFakeOptionals: true,
        });
      }
      item.body = Object.assign({}, body);
      query = this.requestParamsToObj(data.req_query);
      pathParams = this.requestParamsToObj(data.req_params);
      if (data.req_body_type === "form") {
        bodyParams = this.requestParamsToObj(data.req_body_form);
      } else {
        bodyParams = commons.json_parse(data.req_body_other);
        if (data.req_body_is_json_schema) {
          bodyParams = commons.schemaToJson(bodyParams, {
            alwaysFakeOptionals: true,
          });
        }
        bodyParams = typeof bodyParams === "object" ? bodyParams : {};
      }
      item.params = Object.assign(pathParams, query, bodyParams);
      item.index = result.index;
      resultList[index] = item;
    }

    return ok(resultList);
  }

  /**
   * 批量更新用例排序 index
   */
  updateCaseIndexBatch(items) {
    const validated = validateColIndexBatchItems(items);
    if (!validated.ok) {
      return validated;
    }
    validated.data.forEach((item) => {
      if (item.id) {
        this.caseModel.upCaseIndex(item.id, item.index).then(
          () => {},
          (err) => {
            commons.log(err.message, "error");
          }
        );
      }
    });
    return ok("成功！");
  }

  /**
   * 批量更新接口集排序 index
   */
  updateColIndexBatch(items) {
    const validated = validateColIndexBatchItems(items);
    if (!validated.ok) {
      return validated;
    }
    validated.data.forEach((item) => {
      if (item.id) {
        this.colModel.upColIndex(item.id, item.index).then(
          () => {},
          (err) => {
            commons.log(err.message, "error");
          }
        );
      }
    });
    return ok("成功！");
  }

  /**
   * 获取测试集合用例列表（commons.getCaseList 封装）
   */
  async fetchCaseList(colId) {
    const colValidated = validateColId(colId, "col_id不能为空");
    if (!colValidated.ok) {
      return colValidated;
    }
    const body = await commons.getCaseList(colValidated.data);
    if (body.errcode !== 0) {
      return fail(body.errcode, body.errmsg);
    }
    return ok(body);
  }

  /**
   * 执行用例测试脚本
   */
  async runCaseScript(params, colId, interfaceId, uid) {
    const body = await commons.runCaseScript(params, colId, interfaceId);
    return ok(body);
  }
}

export default new InterfaceColService();
