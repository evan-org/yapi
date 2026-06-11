// @ts-nocheck
/**
 * 分组模块：成员管理
 */
import commons from "../../utils/commons.js";
import userService from "../user.service.js";
import { ok, fail } from "../service-result.js";
import { GROUP_ROLE_LABEL, resolveMemberRole } from "../group.util.js";
import { repos, type GroupOperator } from "./shared.js";

const { groupModel } = repos;

export async function addMembers(
  params: {
    id: number | string;
    role?: string;
    member_uids: Array<number | string>;
  },
  operator: GroupOperator
) {
  const role = resolveMemberRole(params.role);
  const addMembers = [];
  const existMembers = [];
  const noMembers = [];
  for (let i = 0, len = params.member_uids.length; i < len; i++) {
    const id = params.member_uids[i];
    const check = await groupModel.checkMemberRepeat(params.id, id);
    const userdata = await userService.getMemberProfile(id, role);
    if (check > 0) {
      existMembers.push(userdata);
    } else if (!userdata) {
      noMembers.push(id);
    } else {
      userdata.role !== "admin" && addMembers.push(userdata);
      delete userdata._role;
    }
  }
  const result = await groupModel.addMember(params.id, addMembers);
  if (addMembers.length) {
    const memberLinks = addMembers
      .map((item) => `<a href = "/user/profile/${item.uid}">${item.username}</a>`)
      .join("、");
    commons.saveLog({
      content: `<a href="/user/profile/${operator.uid}">${operator.username}</a> 新增了分组成员 ${memberLinks} 为 ${GROUP_ROLE_LABEL[role]}`,
      type: "group",
      uid: operator.uid,
      username: operator.username,
      typeid: params.id,
    });
  }
  return ok({
    result,
    add_members: addMembers,
    exist_members: existMembers,
    no_members: noMembers,
  });
}

export async function changeMemberRole(
  params: {
    id: number | string;
    member_uid: number | string;
    role?: string;
  },
  operator: GroupOperator
) {
  const check = await groupModel.checkMemberRepeat(
    params.id,
    params.member_uid
  );
  if (check === 0) {
    return fail(400, "分组成员不存在");
  }
  const role = resolveMemberRole(params.role);
  const result = await groupModel.changeMemberRole(
    params.id,
    params.member_uid,
    role
  );
  const groupUserdata = await userService.getMemberProfile(
    params.member_uid,
    role
  );
  commons.saveLog({
    content: `<a href="/user/profile/${operator.uid}">${operator.username}</a> 更改了分组成员 <a href="/user/profile/${params.member_uid}">${groupUserdata ? groupUserdata.username : ""}</a> 的权限为 "${GROUP_ROLE_LABEL[role]}"`,
    type: "group",
    uid: operator.uid,
    username: operator.username,
    typeid: params.id,
  });
  return ok(result);
}

export async function removeMember(
  params: {
    id: number | string;
    member_uid: number | string;
    role?: string;
  },
  operator: GroupOperator
) {
  const check = await groupModel.checkMemberRepeat(
    params.id,
    params.member_uid
  );
  if (check === 0) {
    return fail(400, "分组成员不存在");
  }
  const result = await groupModel.delMember(params.id, params.member_uid);
  const groupUserdata = await userService.getMemberProfile(
    params.member_uid,
    params.role
  );
  commons.saveLog({
    content: `<a href="/user/profile/${operator.uid}">${operator.username}</a> 删除了分组成员 <a href="/user/profile/${params.member_uid}">${groupUserdata ? groupUserdata.username : ""}</a>`,
    type: "group",
    uid: operator.uid,
    username: operator.username,
    typeid: params.id,
  });
  return ok(result);
}
