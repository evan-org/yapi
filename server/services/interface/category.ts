// @ts-nocheck
/**
 * 接口模块：分类增删改与排序
 */
import commons from "../../utils/commons.js";
import { nowSeconds } from "../../shared/clock.js";
import { onInterfaceDeleted } from "../advancedMock.service.js";
import { ok, fail } from "../service-result.js";
import {
  validateAddCategoryParams,
  validateIndexBatchItems,
} from "../interface.validation.js";
import { repos } from "./shared.js";

const { interfaceModel, catModel, caseModel } = repos;

export async function updateCategory({ catid, name, desc, uid, username }) {
  const cate = await catModel.get(catid);
  if (!cate) {
    return fail(400, "分类不存在");
  }
  const result = await catModel.up(catid, {
    name,
    desc,
    up_time: nowSeconds(),
  });
  commons.saveLog({
    content: `<a href="/user/profile/${uid}">${username}</a> 更新了分类 <a href="/project/${cate.project_id}/interface/api/cat_${catid}">${cate.name}</a>`,
    type: "project",
    uid,
    username,
    typeid: cate.project_id,
  });
  return ok({ result, project_id: cate.project_id });
}

export async function deleteCategory(catId, { uid, username }) {
  const catData = await catModel.get(catId);
  if (!catData) {
    return fail(400, "不存在的分类");
  }
  commons.saveLog({
    content: `<a href="/user/profile/${uid}">${username}</a> 删除了分类 "${catData.name}" 及该分类下的接口`,
    type: "project",
    uid,
    username,
    typeid: catData.project_id,
  });
  const interfaceData = await interfaceModel.listByCatid(catId);
  for (const item of interfaceData) {
    try {
      await onInterfaceDeleted(item._id);
      await caseModel.delByInterfaceId(item._id);
    } catch (e) {
      commons.log(e.message, "error");
    }
  }
  await catModel.del(catId);
  const r = await interfaceModel.delByCatid(catId);
  return ok(r);
}

export async function addCategory(params) {
  const validated = validateAddCategoryParams(params);
  if (!validated.ok) {
    return validated;
  }
  const { name, project_id, desc, uid, username } = validated.data;
  const result = await catModel.save({
    name,
    project_id,
    desc,
    uid,
    add_time: nowSeconds(),
    up_time: nowSeconds(),
  });
  commons.saveLog({
    content: `<a href="/user/profile/${uid}">${username}</a> 添加了分类  <a href="/project/${project_id}/interface/api/cat_${result._id}">${name}</a>`,
    type: "project",
    uid,
    username,
    typeid: project_id,
  });
  return ok(result);
}

export function updateCatIndexBatch(items) {
  const validated = validateIndexBatchItems(items);
  if (!validated.ok) {
    return validated;
  }
  validated.data.forEach((item) => {
    if (item.id) {
      catModel.upCatIndex(item.id, item.index).then(
        () => {},
        (err) => {
          commons.log(err.message, "error");
        }
      );
    }
  });
  return ok("成功！");
}
