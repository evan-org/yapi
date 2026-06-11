// @ts-nocheck
/**
 * 测试集合模块：用例增删改、批量导入与克隆
 */
import commons from "../../utils/commons.js";
import { nowSeconds } from "../../shared/clock.js";
import { ok, fail } from "../service-result.js";
import {
  validateAddCaseParams,
  validateCaseId,
  validateAddCaseListInput,
  validateCloneCaseListInput,
  validateColIndexBatchItems,
} from "../interfaceCol.validation.js";
import { repos } from "./shared.js";

const { colModel, caseModel, interfaceModel, projectModel } = repos;

export async function deleteCase(caseId, { uid, username }) {
  const caseData = await caseModel.get(caseId);
  if (!caseData) {
    return fail(400, "不存在的caseid");
  }
  const result = await caseModel.del(caseId);
  const col = await colModel.get(caseData.col_id);
  if (col) {
    commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 删除了接口集 <a href="/project/${caseData.project_id}/interface/col/${caseData.col_id}">${col.name}</a> 下的接口 ${caseData.casename}`,
      type: "project",
      uid,
      username,
      typeid: caseData.project_id,
    });
  }
  await projectModel.up(caseData.project_id, {
    up_time: new Date().getTime(),
  });
  return ok({ result, caseData });
}

export async function addCase(params, { uid, username }) {
  const validated = validateAddCaseParams(params);
  if (!validated.ok) {
    return validated;
  }
  const saveData = Object.assign({}, validated.data, {
    uid,
    index: 0,
    add_time: nowSeconds(),
    up_time: nowSeconds(),
  });
  const result = await caseModel.save(saveData);
  const { project_id, col_id, casename } = validated.data;

  colModel.get(col_id).then((col) => {
    commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 在接口集 <a href="/project/${project_id}/interface/col/${col_id}">${col.name}</a> 下添加了测试用例 <a href="/project/${project_id}/interface/case/${result._id}">${casename}</a>`,
      type: "project",
      uid,
      username,
      typeid: project_id,
    });
  });
  projectModel.up(project_id, { up_time: new Date().getTime() }).then();
  return ok(result);
}

export async function updateCase(params, { uid, username }) {
  const idValidated = validateCaseId(params.id);
  if (!idValidated.ok) {
    return idValidated;
  }
  const caseData = await caseModel.get(idValidated.data);
  if (!caseData) {
    return fail(400, "不存在的caseid");
  }

  const updateParams = Object.assign({}, params, { uid });
  delete updateParams.interface_id;
  delete updateParams.project_id;

  const result = await caseModel.up(idValidated.data, updateParams);
  colModel.get(caseData.col_id).then((col) => {
    commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 在接口集 <a href="/project/${caseData.project_id}/interface/col/${caseData.col_id}">${col.name}</a> 更新了测试用例 <a href="/project/${caseData.project_id}/interface/case/${idValidated.data}">${params.casename || caseData.casename}</a>`,
      type: "project",
      uid,
      username,
      typeid: caseData.project_id,
    });
  });
  projectModel.up(caseData.project_id, { up_time: new Date().getTime() }).then();
  return ok(result);
}

export async function addCaseList(input, { uid, username }) {
  const validated = validateAddCaseListInput(input);
  if (!validated.ok) {
    return validated;
  }
  const { project_id, col_id, interface_list } = validated.data;

  const data: Record<string, any> = {
    uid,
    index: 0,
    add_time: nowSeconds(),
    up_time: nowSeconds(),
    project_id,
    col_id,
  };

  for (let i = 0; i < interface_list.length; i++) {
    const interfaceData = await interfaceModel.get(interface_list[i]);
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
    const caseResultData = await caseModel.save(data);
    colModel.get(col_id).then((col) => {
      commons.saveLog({
        content: `<a href="/user/profile/${uid}">${username}</a> 在接口集 <a href="/project/${project_id}/interface/col/${col_id}">${col.name}</a> 下导入了测试用例 <a href="/project/${project_id}/interface/case/${caseResultData._id}">${data.casename}</a>`,
        type: "project",
        uid,
        username,
        typeid: project_id,
      });
    });
  }

  projectModel.up(project_id, { up_time: new Date().getTime() }).then();
  return ok("ok");
}

export async function cloneCaseList(input) {
  const validated = validateCloneCaseListInput(input);
  if (!validated.ok) {
    return validated;
  }
  const { project_id, col_id, new_col_id } = validated.data;

  let oldColCaselistData = await caseModel.list(col_id, "all");
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
    const obj = oldColCaselistData[i];
    oldCaseObj[obj._id] = i;
    const caseData = handleParams(obj);
    const newCase = await caseModel.save(caseData);
    newCaseList.push(newCase._id);
  }

  projectModel.up(project_id, { up_time: new Date().getTime() }).then();
  return ok("ok");
}

export function updateCaseIndexBatch(items) {
  const validated = validateColIndexBatchItems(items);
  if (!validated.ok) {
    return validated;
  }
  validated.data.forEach((item) => {
    if (item.id) {
      caseModel.upCaseIndex(item.id, item.index).then(
        () => {},
        (err) => {
          commons.log(err.message, "error");
        }
      );
    }
  });
  return ok("成功！");
}
