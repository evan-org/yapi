// @ts-nocheck
/**
 * 分组模块：创建、更新与级联删除
 */
import commons from "../../utils/commons.js";
import { nowSeconds } from "../../shared/clock.js";
import userService from "../user.service.js";
import { ok, fail } from "../service-result.js";
import { repos, type GroupOperator } from "./shared.js";

const {
  groupModel,
  projectModel,
  interfaceModel,
  interfaceColModel,
  interfaceCaseModel,
} = repos;

export async function create(
  params: {
    group_name: string;
    group_desc?: string;
    owner_uids?: Array<number | string>;
  },
  operator: GroupOperator
) {
  let ownerUids = params.owner_uids || [];
  if (ownerUids.length === 0) {
    ownerUids.push(operator.uid);
  }
  const owners = [];
  for (let i = 0, len = ownerUids.length; i < len; i++) {
    const id = ownerUids[i];
    const groupUserdata = await userService.getMemberProfile(id, "owner");
    if (groupUserdata) {
      owners.push(groupUserdata);
    }
  }
  const checkRepeat = await groupModel.checkRepeat(params.group_name);
  if (checkRepeat > 0) {
    return fail(401, "项目分组名已存在");
  }
  const data = {
    group_name: params.group_name,
    group_desc: params.group_desc,
    uid: operator.uid,
    add_time: nowSeconds(),
    up_time: nowSeconds(),
    members: owners,
  };
  let result = await groupModel.save(data);
  result = commons.fieldSelect(result, [
    "_id",
    "group_name",
    "group_desc",
    "uid",
    "members",
    "type",
  ]);
  commons.saveLog({
    content: `<a href="/user/profile/${operator.uid}">${operator.username}</a> 新增了分组 <a href="/group/${result._id}">${params.group_name}</a>`,
    type: "group",
    uid: operator.uid,
    username: operator.username,
    typeid: result._id,
  });
  return ok(result);
}

export async function removeGroup(groupId: number | string) {
  const projectList = await projectModel.list(groupId, true);
  for (const p of projectList) {
    await interfaceModel.delByProjectId(p._id);
    await interfaceCaseModel.delByProjectId(p._id);
    await interfaceColModel.delByProjectId(p._id);
  }
  if (projectList.length > 0) {
    await projectModel.delByGroupid(groupId);
  }
  const result = await groupModel.del(groupId);
  return ok(result);
}

export async function updateGroup(
  params: { id: number | string; group_name: string; [key: string]: unknown },
  operator: GroupOperator
) {
  const result = await groupModel.up(params.id, params);
  commons.saveLog({
    content: `<a href="/user/profile/${operator.uid}">${operator.username}</a> 更新了 <a href="/group/${params.id}">${params.group_name}</a> 分组`,
    type: "group",
    uid: operator.uid,
    username: operator.username,
    typeid: params.id,
  });
  return ok(result);
}
