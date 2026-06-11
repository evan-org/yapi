// @ts-nocheck
/**
 * 用户模块：查询、搜索与导航链
 */
import commons from "../../utils/commons.js";
import { ok, fail } from "../service-result.js";
import {
  repos,
  errorMessage,
  type UserActor,
  type NavigationChainResult,
} from "./shared.js";

const { userModel, groupModel, projectModel, interfaceModel } = repos;

export async function listPaged(page: number, limit: number) {
  try {
    const list = await userModel.listWithPaging(page, limit);
    const count = await userModel.listCount();
    return ok({
      count,
      total: Math.ceil(count / limit),
      list,
    });
  } catch (e) {
    return fail(402, errorMessage(e));
  }
}

export async function findById(id: number | string, actor: UserActor) {
  if (actor.role !== "admin" && id != actor.currentUid) {
    return fail(401, "没有权限");
  }
  if (!id) {
    return fail(400, "uid不能为空");
  }
  try {
    const result = await userModel.findById(id);
    if (!result) {
      return fail(402, "不存在的用户");
    }
    return ok({
      uid: result._id,
      username: result.username,
      email: result.email,
      role: result.role,
      type: result.type,
      add_time: result.add_time,
      up_time: result.up_time,
    });
  } catch (e) {
    return fail(402, errorMessage(e));
  }
}

export async function search(keyword: string) {
  if (!keyword) {
    return fail(400, "No keyword.");
  }
  if (!commons.validateSearchKeyword(keyword)) {
    return fail(400, "Bad query.");
  }
  const queryList = await userModel.search(keyword);
  const rules = [
    { key: "_id", alias: "uid" },
    "username",
    "email",
    "role",
    { key: "add_time", alias: "addTime" },
    { key: "up_time", alias: "upTime" },
  ];
  const filteredRes = commons.filterRes(queryList, rules);
  return ok(filteredRes);
}

export async function loadNavigationChain(id: number | string, type: string) {
  const result: NavigationChainResult = {};
  let currentType = type;
  let currentId: number | string = id;
  try {
    if (currentType === "interface") {
      result.interface = await interfaceModel.get(currentId);
      currentType = "project";
      currentId = result.interface.project_id;
    }
    if (currentType === "project") {
      const projectData = await projectModel.get(currentId);
      result.project = projectData;
      currentType = "group";
      currentId = result.project.group_id;
    }
    if (currentType === "group") {
      const groupData = await groupModel.get(currentId);
      result.group = groupData;
    }
    return ok(result);
  } catch (e) {
    return fail(422, errorMessage(e));
  }
}

export async function getUserdata(uid: number | string, role = "dev") {
  const userData = await userModel.findById(uid);
  if (!userData) {
    return null;
  }
  return {
    role,
    uid: userData._id,
    username: userData.username,
    email: userData.email,
  };
}

export async function getMemberProfile(uid: number | string, role = "dev") {
  const userData = await userModel.findById(uid);
  if (!userData) {
    return null;
  }
  return {
    _role: userData.role,
    role,
    uid: userData._id,
    username: userData.username,
    email: userData.email,
  };
}
