// @ts-nocheck
/**
 * 测试集合模块：查询与列表
 */
import commons, { handleParamsValue } from "../../utils/commons.js";
import { ok, fail } from "../service-result.js";
import { validateColId } from "../interfaceCol.validation.js";
import { repos } from "./shared.js";
import { requestParamsToObj, uniqueFieldValues } from "./util.js";
import { getProjectBaseInfo } from "./project.js";

const { colModel, caseModel, interfaceModel, projectModel } = repos;

export { getProjectBaseInfo } from "./project.js";

export async function requireCol(colId, notFoundMsg = "不存在的接口集") {
  const colData = await colModel.get(colId);
  if (!colData) {
    return fail(400, notFoundMsg);
  }
  return ok(colData);
}

export async function requireCase(caseId, notFoundMsg = "不存在的caseid") {
  const caseData = await caseModel.get(caseId);
  if (!caseData) {
    return fail(400, notFoundMsg);
  }
  return ok(caseData);
}

export async function getProjectByColId(colId) {
  const col = await requireCol(colId);
  if (!col.ok) {
    return col;
  }
  return getProjectBaseInfo(col.data.project_id);
}

export async function getProjectForVariableParamsCol(colId) {
  const firstCaseList = await caseModel.list(colId, "all");
  if (firstCaseList.length === 0) {
    return ok(null);
  }
  return getProjectBaseInfo(firstCaseList[0].project_id);
}

export async function listWithCases(projectId) {
  let result = await colModel.list(projectId);
  result = result.sort((a, b) => a.index - b.index);

  result = await Promise.all(
    result.map(async (colRow) => {
      const col = colRow;
      let caseList = await caseModel.list(col._id);
      const interfaceIds = [
        ...new Set(caseList.map((c) => c.interface_id).filter(Boolean)),
      ];
      const pathByInterfaceId: Record<string | number, string> = {};
      await Promise.all(
        interfaceIds.map(async (interfaceId: string | number) => {
          const iface = await interfaceModel.getBaseinfo(interfaceId);
          if (iface) {
            pathByInterfaceId[interfaceId] = iface.path;
          }
        })
      );
      caseList = caseList
        .map((c) => {
          const item = c;
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

export async function getCaseDetail(caseId) {
  let result = await caseModel.get(caseId);
  if (!result) {
    return fail(400, "不存在的case");
  }
  result = result;
  let data = await interfaceModel.get(result.interface_id);
  if (!data) {
    return fail(400, "找不到对应的接口，请联系管理员");
  }
  data = data;

  const projectData = await projectModel.getBaseInfo(data.project_id);
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

export async function getCaseEnvList(colId) {
  const colValidated = validateColId(colId, "col_id不能为空");
  if (!colValidated.ok) {
    return colValidated;
  }
  colId = colValidated.data;
  const colData = await colModel.get(colId);
  if (!colData) {
    return fail(400, "不存在的接口集");
  }

  let projectList = await caseModel.list(colId, "project_id");
  projectList = uniqueFieldValues(projectList, "project_id");

  const projectEnvList = [];
  for (let i = 0; i < projectList.length; i++) {
    const result = await projectModel.getBaseInfo(projectList[i], "name  env");
    projectEnvList.push(result);
  }
  return ok(projectEnvList);
}

export async function getCaseListByVariableParams(colId) {
  const colValidated = validateColId(colId, "col_id不能为空");
  if (!colValidated.ok) {
    return colValidated;
  }
  colId = colValidated.data;
  let resultList = await caseModel.list(colId, "all");
  if (resultList.length === 0) {
    return ok([]);
  }

  for (let index = 0; index < resultList.length; index++) {
    const result = resultList[index];
    const item: Record<string, any> = {};
    let body;
    let query;
    let bodyParams;
    let pathParams;
    const data = await interfaceModel.get(result.interface_id);
    if (!data) {
      await caseModel.del(result._id);
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
    query = requestParamsToObj(data.req_query);
    pathParams = requestParamsToObj(data.req_params);
    if (data.req_body_type === "form") {
      bodyParams = requestParamsToObj(data.req_body_form);
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
