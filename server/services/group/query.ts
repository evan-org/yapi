// @ts-nocheck
/**
 * 分组模块：查询与列表
 */
import _ from "underscore";
import { nowSeconds } from "../../shared/clock.js";
import { ok, fail } from "../service-result.js";
import { enrichGroupForDisplay } from "../group.util.js";
import { repos } from "./shared.js";

const { groupModel, projectModel } = repos;

export async function getById(id: number | string) {
  const result = await groupModel.getGroupById(id);
  if (!result) {
    return fail(404, "分组不存在");
  }
  return ok(enrichGroupForDisplay(result));
}

export async function getOrCreatePrivateGroup(uid: number | string) {
  let privateGroup = await groupModel.getByPrivateUid(uid);
  if (!privateGroup) {
    privateGroup = await groupModel.save({
      uid,
      group_name: "User-" + uid,
      add_time: nowSeconds(),
      up_time: nowSeconds(),
      type: "private",
    });
  }
  return privateGroup;
}

export async function getMemberList(groupId: number | string) {
  const group = await groupModel.get(groupId);
  return ok(group.members);
}

export async function listForUser(uid: number | string, role: string) {
  let privateGroup = await getOrCreatePrivateGroup(uid);
  const newResult = [];

  if (role === "admin") {
    let result = await groupModel.list();
    if (result && result.length > 0) {
      for (let i = 0; i < result.length; i++) {
        result[i] = result[i];
        newResult.unshift(result[i]);
      }
    }
  } else {
    let result = await groupModel.getAuthList(uid);
    if (result && result.length > 0) {
      for (let i = 0; i < result.length; i++) {
        result[i] = result[i];
        newResult.unshift(result[i]);
      }
    }
    const groupIds = newResult.map((item) => item._id);
    const newGroupIds = [];
    const groupByProject = await projectModel.getAuthList(uid);
    if (groupByProject && groupByProject.length > 0) {
      groupByProject.forEach((_data) => {
        const _temp = [...groupIds, ...newGroupIds];
        if (!_.find(_temp, (id) => id === _data.group_id)) {
          newGroupIds.push(_data.group_id);
        }
      });
    }
    const newData = await groupModel.findByGroups(newGroupIds);
    newData.forEach((_data) => {
      _data = _data;
      newResult.push(_data);
    });
  }

  if (privateGroup) {
    privateGroup = privateGroup;
    privateGroup.group_name = "个人空间";
    privateGroup.role = "owner";
    newResult.unshift(privateGroup);
  }
  return ok(newResult);
}
