// @ts-nocheck
/**
 * 项目模块：查询、搜索、Swagger 代理
 */
import axios from "axios";
import _ from "underscore";
import commons from "../../utils/commons.js";
import { ok, fail } from "../service-result.js";
import {
  validateProjectSearchKeyword,
  validateSwaggerUrl,
  validateProjectName,
  validateProjectId,
  DEFAULT_PROJECT_ENV,
} from "../project.util.js";
import { repos } from "./shared.js";

const {
  projectModel,
  groupModel,
  interfaceModel,
  followModel,
  catModel,
} = repos;

export async function search(keyword: string) {
  const validated = validateProjectSearchKeyword(keyword);
  if (!validated.ok) {
    return validated;
  }
  const q = validated.data;

  let projectList = await projectModel.search(q);
  let groupList = await groupModel.search(q);
  let interfaceList = await interfaceModel.search(q);

  const projectRules = [
    "_id",
    "name",
    "basepath",
    "uid",
    "env",
    "members",
    { key: "group_id", alias: "groupId" },
    { key: "up_time", alias: "upTime" },
    { key: "add_time", alias: "addTime" },
  ];
  const groupRules = [
    "_id",
    "uid",
    { key: "group_name", alias: "groupName" },
    { key: "group_desc", alias: "groupDesc" },
    { key: "add_time", alias: "addTime" },
    { key: "up_time", alias: "upTime" },
  ];
  const interfaceRules = [
    "_id",
    "uid",
    { key: "title", alias: "title" },
    { key: "project_id", alias: "projectId" },
    { key: "add_time", alias: "addTime" },
    { key: "up_time", alias: "upTime" },
  ];

  return ok({
    project: commons.filterRes(projectList, projectRules),
    group: commons.filterRes(groupList, groupRules),
    interface: commons.filterRes(interfaceList, interfaceRules),
  });
}

export async function getDetail(projectId) {
  const result = await projectModel.getBaseInfo(projectId);
  if (!result) {
    return fail(400, "不存在的项目");
  }
  const data = result;
  data.cat = await catModel.list(projectId);
  if (!data.env || data.env.length === 0) {
    data.env = DEFAULT_PROJECT_ENV;
  }
  return ok(data);
}

export async function fetchSwaggerJson(url: string) {
  const validated = validateSwaggerUrl(url);
  if (!validated.ok) {
    return validated;
  }
  try {
    const { data } = await axios.get(validated.data);
    if (data == null || typeof data !== "object") {
      return fail(402, "返回数据格式不是 JSON");
    }
    return ok(data);
  } catch (err) {
    return fail(402, String(err));
  }
}

export async function listByGroup(groupId, { uid, auth }) {
  const groupData = await groupModel.get(groupId);
  if (!groupData) {
    return fail(400, "不存在的分组");
  }
  const follow = await followModel.list(uid);
  const result = await projectModel.list(groupId);
  let project_list = [];
  const isPrivateGroup =
    groupData.type === "private" && uid === groupData.uid;

  if (!isPrivateGroup) {
    for (let index = 0; index < result.length; index++) {
      let item = result[index];
      if (item.project_type === "private" && auth === false) {
        const r = await projectModel.checkMemberRepeat(item._id, uid);
        if (r === 0) {
          continue;
        }
      }
      const f = _.find(follow, (fol) => fol.projectid === item._id);
      item.follow = Boolean(f);
      if (f) {
        project_list.unshift(item);
      } else {
        project_list.push(item);
      }
    }
  } else {
    const merged = follow.map((item) => {
      const row = item;
      row._id = row.projectid;
      row.follow = true;
      return row;
    });
    project_list = _.uniq(merged.concat(result), (item) => item._id);
  }
  return ok({ list: project_list });
}

export async function getMemberList(projectId) {
  const project = await projectModel.get(projectId);
  if (!project) {
    return fail(400, "不存在的项目");
  }
  return ok(project.members || []);
}

export async function checkNameAvailable(name: string, groupId: number | string) {
  const validated = validateProjectName(name);
  if (!validated.ok) {
    return validated;
  }
  const checkRepeat = await projectModel.checkNameRepeat(validated.data, groupId);
  if (checkRepeat > 0) {
    return fail(401, "已存在的项目名");
  }
  return ok({});
}

export async function getProjectEnv(projectId: number | string) {
  const validated = validateProjectId(projectId);
  if (!validated.ok) {
    return validated;
  }
  const env = await projectModel.getByEnv(validated.data);
  return ok(env);
}
