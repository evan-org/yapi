// @ts-nocheck
/**
 * 测试集合模块：集合增删改与排序
 */
import commons from "../../utils/commons.js";
import { nowSeconds } from "../../shared/clock.js";
import { ok, fail } from "../service-result.js";
import {
  validateAddColParams,
  validateColIndexBatchItems,
} from "../interfaceCol.validation.js";
import { repos } from "./shared.js";

const { colModel, caseModel } = repos;

export async function addCol(params) {
  const validated = validateAddColParams(params);
  if (!validated.ok) {
    return validated;
  }
  const { name, project_id, desc, uid, username } = validated.data;
  const result = await colModel.save({
    name,
    project_id,
    desc,
    uid,
    add_time: nowSeconds(),
    up_time: nowSeconds(),
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

export async function deleteCol(colId, { uid, username }) {
  const colData = await colModel.get(colId);
  if (!colData) {
    return fail(400, "不存在的id");
  }
  const result = await colModel.del(colId);
  await caseModel.delByCol(colId);
  commons.saveLog({
    content: `<a href="/user/profile/${uid}">${username}</a> 删除了接口集 ${colData.name} 及其下面的接口`,
    type: "project",
    uid,
    username,
    typeid: colData.project_id,
  });
  return ok({ result, colData });
}

export async function updateCol(colId, params, { uid, username }) {
  const colData = await colModel.get(colId);
  if (!colData) {
    return fail(400, "不存在");
  }
  const result = await colModel.up(colId, params);
  commons.saveLog({
    content: `<a href="/user/profile/${uid}">${username}</a> 更新了测试集合 <a href="/project/${colData.project_id}/interface/col/${colId}">${colData.name}</a> 的信息`,
    type: "project",
    uid,
    username,
    typeid: colData.project_id,
  });
  return ok(result);
}

export function updateColIndexBatch(items) {
  const validated = validateColIndexBatchItems(items);
  if (!validated.ok) {
    return validated;
  }
  validated.data.forEach((item) => {
    if (item.id) {
      colModel.upColIndex(item.id, item.index).then(
        () => {},
        (err) => {
          commons.log(err.message, "error");
        }
      );
    }
  });
  return ok("成功！");
}
