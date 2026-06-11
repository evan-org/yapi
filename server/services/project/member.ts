// @ts-nocheck
/**
 * 项目模块：成员管理
 */
import commons from "../../utils/commons.js";
import userService from "../user.service.js";
import { ok, fail } from "../service-result.js";
import {
  resolveProjectMemberRole,
  PROJECT_MEMBER_ROLE_LABEL,
} from "../project.util.js";
import { repos } from "./shared.js";

const { projectModel, userModel } = repos;

export async function addMembers({ id, member_uids, role, operator }) {
  const add_members = [];
  const exist_members = [];
  const no_members = [];
  const normalizedRole = resolveProjectMemberRole(role);

  for (let i = 0; i < member_uids.length; i++) {
    const memberId = member_uids[i];
    const check = await projectModel.checkMemberRepeat(id, memberId);
    const userdata = await userService.getUserdata(memberId, normalizedRole);
    if (check > 0) {
      exist_members.push(userdata);
    } else if (!userdata) {
      no_members.push(memberId);
    } else {
      add_members.push(userdata);
    }
  }

  const result = await projectModel.addMember(id, add_members);
  if (add_members.length) {
    const members = add_members
      .map(
        (item) =>
          `<a href = "/user/profile/${item.uid}">${item.username}</a>`
      )
      .join("、");
    commons.saveLog({
      content: `<a href="/user/profile/${operator.uid}">${operator.username}</a> 添加了项目成员 ${members}`,
      type: "project",
      uid: operator.uid,
      username: operator.username,
      typeid: id,
    });
  }
  return ok({ result, add_members, exist_members, no_members });
}

export async function delMember({ id, member_uid, operator }) {
  const check = await projectModel.checkMemberRepeat(id, member_uid);
  if (check === 0) {
    return fail(400, "项目成员不存在");
  }
  const result = await projectModel.delMember(id, member_uid);
  const member = await userModel.findById(member_uid);
  commons.saveLog({
    content: `<a href="/user/profile/${operator.uid}">${operator.username}</a> 删除了项目中的成员 <a href="/user/profile/${member_uid}">${member ? member.username : ""}</a>`,
    type: "project",
    uid: operator.uid,
    username: operator.username,
    typeid: id,
  });
  return ok(result);
}

export async function changeMemberEmailNotice({ id, member_uid, notice }) {
  const check = await projectModel.checkMemberRepeat(id, member_uid);
  if (check === 0) {
    return fail(400, "项目成员不存在");
  }
  const result = await projectModel.changeMemberEmailNotice(
    id,
    member_uid,
    notice
  );
  return ok(result);
}

export async function changeMemberRole({ id, member_uid, role, operator }) {
  const check = await projectModel.checkMemberRepeat(id, member_uid);
  if (check === 0) {
    return fail(400, "项目成员不存在");
  }
  const normalizedRole = resolveProjectMemberRole(role);
  const result = await projectModel.changeMemberRole(
    id,
    member_uid,
    normalizedRole
  );
  const member = await userModel.findById(member_uid);
  commons.saveLog({
    content: `<a href="/user/profile/${operator.uid}">${operator.username}</a> 修改了项目中的成员 <a href="/user/profile/${member_uid}">${member ? member.username : ""}</a> 的角色为 "${PROJECT_MEMBER_ROLE_LABEL[normalizedRole]}"`,
    type: "project",
    uid: operator.uid,
    username: operator.username,
    typeid: id,
  });
  return ok(result);
}
