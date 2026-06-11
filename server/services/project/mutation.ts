// @ts-nocheck
/**
 * 项目模块：创建、更新、删除、复制
 */
import commons from "../../utils/commons.js";
import { nowSeconds } from "../../shared/clock.js";
import userService from "../user.service.js";
import { onProjectDeleted } from "../advancedMock.service.js";
import { ok, fail } from "../service-result.js";
import {
  validateProjectBasepath,
  validateProjectEnvList,
  validateProjectTagList,
  DEFAULT_PROJECT_ENV,
} from "../project.util.js";
import { repos, errorMessage } from "./shared.js";

const {
  projectModel,
  interfaceModel,
  interfaceCaseModel,
  interfaceColModel,
  followModel,
  catModel,
} = repos;

export async function deleteById(projectId) {
  await interfaceModel.delByProjectId(projectId);
  await interfaceCaseModel.delByProjectId(projectId);
  await interfaceColModel.delByProjectId(projectId);
  await followModel.delByProjectId(projectId);
  await onProjectDeleted(projectId);
  const result = await projectModel.del(projectId);
  return ok(result);
}

export async function copyProject(params, actor) {
  try {
    const copyId = params._id;
    params.basepath = params.basepath || "";
    const data = Object.assign({}, params, {
      project_type: params.project_type || "private",
      uid: actor.uid,
      add_time: nowSeconds(),
      up_time: nowSeconds(),
      env: params.env || DEFAULT_PROJECT_ENV,
    });
    delete data._id;

    const result = await projectModel.save(data);
    if (!result._id) {
      return ok(result);
    }

    await interfaceColModel.save({
      name: "公共测试集",
      project_id: result._id,
      desc: "公共测试集",
      uid: actor.uid,
      add_time: nowSeconds(),
      up_time: nowSeconds(),
    });

    const cat = params.cat || [];
    for (let i = 0; i < cat.length; i++) {
      const item = cat[i];
      const catResult = await catModel.save({
        name: item.name,
        project_id: result._id,
        desc: item.desc,
        uid: actor.uid,
        add_time: nowSeconds(),
        up_time: nowSeconds(),
      });
      const interfaceData = await interfaceModel.listByInterStatus(item._id);
      for (let key = 0; key < interfaceData.length; key++) {
        const interfaceItem = interfaceData[key];
        const ifacePayload = Object.assign({}, interfaceItem, {
          uid: actor.uid,
          catid: catResult._id,
          project_id: result._id,
          add_time: nowSeconds(),
          up_time: nowSeconds(),
        });
        delete ifacePayload._id;
        await interfaceModel.save(ifacePayload);
      }
    }

    const copyProject = await projectModel.get(copyId);
    let copyProjectMembers = copyProject.members || [];
    if (actor.role !== "admin") {
      const userdata = await userService.getUserdata(actor.uid, "owner");
      const check = await projectModel.checkMemberRepeat(copyId, actor.uid);
      if (check === 0 && userdata) {
        copyProjectMembers.push(userdata);
      }
    }
    await projectModel.addMember(result._id, copyProjectMembers);

    commons.saveLog({
      content: `<a href="/user/profile/${actor.uid}">${actor.username}</a> 复制了项目 ${params.preName} 为 <a href="/project/${result._id}">${params.name}</a>`,
      type: "project",
      uid: actor.uid,
      username: actor.username,
      typeid: result._id,
    });

    return ok(result);
  } catch (err) {
    return fail(402, errorMessage(err));
  }
}

export async function createProject(params, { uid, username, role }) {
  const checkRepeat = await projectModel.checkNameRepeat(params.name, params.group_id);
  if (checkRepeat > 0) {
    return fail(401, "已存在的项目名");
  }

  const basepathResult = validateProjectBasepath(params.basepath);
  if (!basepathResult.ok) {
    return basepathResult;
  }

  const data = {
    name: params.name,
    desc: params.desc,
    basepath: basepathResult.data,
    members: [],
    project_type: params.project_type || "private",
    uid,
    group_id: params.group_id,
    group_name: params.group_name,
    icon: params.icon,
    color: params.color,
    add_time: nowSeconds(),
    up_time: nowSeconds(),
    is_json5: false,
    env: DEFAULT_PROJECT_ENV,
  };

  const result = await projectModel.save(data);
  if (result._id) {
    await interfaceColModel.save({
      name: "公共测试集",
      project_id: result._id,
      desc: "公共测试集",
      uid,
      add_time: nowSeconds(),
      up_time: nowSeconds(),
    });
    await catModel.save({
      name: "公共分类",
      project_id: result._id,
      desc: "公共分类",
      uid,
      add_time: nowSeconds(),
      up_time: nowSeconds(),
    });
  }

  if (role !== "admin") {
    const userdata = await userService.getUserdata(uid, "owner");
    await projectModel.addMember(result._id, [userdata]);
  }

  commons.saveLog({
    content: `<a href="/user/profile/${uid}">${username}</a> 添加了项目 <a href="/project/${result._id}">${params.name}</a>`,
    type: "project",
    uid,
    username,
    typeid: result._id,
  });
  return ok(result);
}

export async function updateProject(id, params, { uid, username }) {
  const projectData = await projectModel.get(id);
  if (!projectData) {
    return fail(400, "不存在的项目");
  }

  if (params.basepath) {
    const basepathResult = validateProjectBasepath(params.basepath);
    if (!basepathResult.ok) {
      return basepathResult;
    }
    params.basepath = basepathResult.data;
  }

  if (projectData.name === params.name) {
    delete params.name;
  }
  if (params.name) {
    const checkRepeat = await projectModel.checkNameRepeat(params.name, params.group_id);
    if (checkRepeat > 0) {
      return fail(401, "已存在的项目名");
    }
  }

  const data = Object.assign({ up_time: nowSeconds() }, params);
  const result = await projectModel.up(id, data);
  commons.saveLog({
    content: `<a href="/user/profile/${uid}">${username}</a> 更新了项目 <a href="/project/${id}/interface/api">${projectData.name}</a>`,
    type: "project",
    uid,
    username,
    typeid: id,
  });
  return ok(result);
}

export async function updateAppearance(id, { color, icon }, { uid, username }) {
  const result = await projectModel.up(id, { color, icon });
  followModel.updateById(uid, id, { color, icon }).then(() => {
    commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 修改了项目图标、颜色`,
      type: "project",
      uid,
      username,
      typeid: id,
    });
  });
  return ok(result);
}

export async function updateEnv(id, env, { uid, username }) {
  const envValidated = validateProjectEnvList(env);
  if (!envValidated.ok) {
    return envValidated;
  }
  const projectData = await projectModel.get(id);
  if (!projectData) {
    return fail(400, "不存在的项目");
  }
  const result = await projectModel.up(id, {
    env: envValidated.data,
    up_time: nowSeconds(),
  });
  commons.saveLog({
    content: `<a href="/user/profile/${uid}">${username}</a> 更新了项目 <a href="/project/${id}/interface/api">${projectData.name}</a> 的环境`,
    type: "project",
    uid,
    username,
    typeid: id,
  });
  return ok(result);
}

export async function updateTag(id, tag, { uid, username }) {
  const tagValidated = validateProjectTagList(tag);
  if (!tagValidated.ok) {
    return tagValidated;
  }
  const projectData = await projectModel.get(id);
  if (!projectData) {
    return fail(400, "不存在的项目");
  }
  const result = await projectModel.up(id, {
    tag: tagValidated.data,
    up_time: nowSeconds(),
  });
  commons.saveLog({
    content: `<a href="/user/profile/${uid}">${username}</a> 更新了项目 <a href="/project/${id}/interface/api">${projectData.name}</a> 的tag`,
    type: "project",
    uid,
    username,
    typeid: id,
  });
  return ok(result);
}
