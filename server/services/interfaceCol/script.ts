// @ts-nocheck
/**
 * 测试集合模块：用例列表组装与脚本执行
 */
import assert from "node:assert";
import commons, { handleParamsValue, resReturn } from "../../utils/commons.js";
import sandboxFn from "../../utils/sandbox.js";
import { schemaValidator } from "../../utils/schema-utils.js";
import { ok, fail } from "../service-result.js";
import { validateColId } from "../interfaceCol.validation.js";
import { repos } from "./shared.js";

const { colModel, caseModel, interfaceModel, projectModel } = repos;

function convertScriptLog(variable) {
  if (variable instanceof Error) {
    return variable.name + ": " + variable.message;
  }
  try {
    if (variable && typeof variable === "string") {
      return variable;
    }
    return JSON.stringify(variable, null, "   ");
  } catch (err) {
    return variable || "";
  }
}

export async function buildCaseListResponse(colId) {
  let resultList = await caseModel.list(colId, "all");
  const colData = await colModel.get(colId);
  for (let index = 0; index < resultList.length; index++) {
    const result = resultList[index];
    const data = await interfaceModel.get(result.interface_id);
    if (!data) {
      await caseModel.del(result._id);
      continue;
    }
    const projectData = await projectModel.getBaseInfo(data.project_id);
    result.path = projectData.basepath + data.path;
    result.method = data.method;
    result.title = data.title;
    result.req_body_type = data.req_body_type;
    result.req_headers = handleParamsValue(data.req_headers, result.req_headers);
    result.res_body_type = data.res_body_type;
    result.req_body_form = handleParamsValue(
      data.req_body_form,
      result.req_body_form
    );
    result.req_query = handleParamsValue(data.req_query, result.req_query);
    result.req_params = handleParamsValue(data.req_params, result.req_params);
    resultList[index] = result;
  }
  resultList = resultList.sort((a, b) => a.index - b.index);
  const ctxBody = resReturn(resultList);
  ctxBody.colData = colData;
  return ctxBody;
}

export async function fetchCaseList(colId) {
  const colValidated = validateColId(colId, "col_id不能为空");
  if (!colValidated.ok) {
    return colValidated;
  }
  const body = await buildCaseListResponse(colValidated.data);
  if (body.errcode !== 0) {
    return fail(body.errcode, body.errmsg);
  }
  return ok(body);
}

export async function executeCaseScript(params, colId, interfaceId) {
  const colData = await colModel.get(colId);
  const logs = [];
  const context = {
    assert,
    status: params.response.status,
    body: params.response.body,
    header: params.response.header,
    records: params.records,
    params: params.params,
    log: (msg) => {
      logs.push("log: " + convertScriptLog(msg));
    },
  };

  let result = {};
  try {
    if (colData.checkHttpCodeIs200) {
      const status = +params.response.status;
      if (status !== 200) {
        throw "Http status code 不是 200，请检查(该规则来源于于 [测试集->通用规则配置] )";
      }
    }

    if (colData.checkResponseField.enable) {
      if (
        params.response.body[colData.checkResponseField.name] !=
        colData.checkResponseField.value
      ) {
        throw `返回json ${colData.checkResponseField.name} 值不是${colData.checkResponseField.value}，请检查(该规则来源于于 [测试集->通用规则配置] )`;
      }
    }

    if (colData.checkResponseSchema) {
      const interfaceData = await interfaceModel.get(interfaceId);
      if (interfaceData.res_body_is_json_schema && interfaceData.res_body) {
        const schema = JSON.parse(interfaceData.res_body);
        const schemaResult = schemaValidator(schema, context.body);
        if (!schemaResult.valid) {
          throw `返回Json 不符合 response 定义的数据结构,原因: ${schemaResult.message}
数据结构如下：
${JSON.stringify(schema, null, 2)}`;
        }
      }
    }

    if (colData.checkScript.enable) {
      const globalScript = colData.checkScript.content;
      if (globalScript) {
        logs.push("执行脚本：" + globalScript);
        result = await sandboxFn(context, globalScript);
      }
    }

    const script = params.script;
    if (script) {
      logs.push("执行脚本:" + script);
      result = await sandboxFn(context, script);
    }
    result.logs = logs;
    return resReturn(result);
  } catch (err) {
    logs.push(convertScriptLog(err));
    result.logs = logs;
    return resReturn(result, 400, err.name + ": " + err.message);
  }
}

export async function runCaseScript(params, colId, interfaceId) {
  const body = await executeCaseScript(params, colId, interfaceId);
  return ok(body);
}
