/**
 * 项目模块业务逻辑（搜索、删除、详情、Swagger 代理等）
 */
import axios from "axios";
import _ from "underscore";
import sha from "sha.js";
import { onProjectDeleted } from "./advMock.mock.js";
import commons from "../utils/commons.js";
import { getToken } from "../utils/token.js";
import {
  projectRepository,
  groupRepository,
  interfaceRepository,
  interfaceColRepository,
  interfaceCaseRepository,
  followRepository,
  interfaceCatRepository,
  userRepository,
  tokenRepository,
} from "../repositories/index.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";
import {
  normalizeBasepath,
  hasDuplicateField,
  validateProjectBasepath,
  validateProjectSearchKeyword,
  validateSwaggerUrl,
  validateProjectName,
  validateProjectId,
  validateProjectEnvList,
  validateProjectTagList,
  resolveProjectMemberRole,
  PROJECT_MEMBER_ROLE_LABEL,
  DEFAULT_PROJECT_ENV,
} from "./project.util.js";

export { normalizeBasepath, hasDuplicateField } from "./project.util.js";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

class ProjectService extends BaseService {
  projectModel = projectRepository;
  groupModel = groupRepository;
  interfaceModel = interfaceRepository;
  interfaceColModel = interfaceColRepository;
  interfaceCaseModel = interfaceCaseRepository;
  followModel = followRepository;
  catModel = interfaceCatRepository;
  tokenModel = tokenRepository;

  /**
   * 全局模糊搜索：项目 / 分组 / 接口
   */
  async search(keyword: string) {
    const validated = validateProjectSearchKeyword(keyword);
    if (!validated.ok) {
      return validated;
    }
    const q = validated.data;

    let projectList = await this.projectModel.search(q);
    let groupList = await this.groupModel.search(q);
    let interfaceList = await this.interfaceModel.search(q);

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

  /**
   * 项目详情（含分类树；权限由 controller 校验）
   */
  async getDetail(projectId) {
    const result = await this.projectModel.getBaseInfo(projectId);
    if (!result) {
      return fail(400, "不存在的项目");
    }
    const data = result;
    data.cat = await this.catModel.list(projectId);
    if (!data.env || data.env.length === 0) {
      data.env = [{ name: "local", domain: "http://127.0.0.1" }];
    }
    return ok(data);
  }

  /**
   * 级联删除项目下接口、用例、集合、关注后删除项目
   */
  async deleteById(projectId) {
    await this.interfaceModel.delByProjectId(projectId);
    await this.interfaceCaseModel.delByProjectId(projectId);
    await this.interfaceColModel.delByProjectId(projectId);
    await this.followModel.delByProjectId(projectId);
    await onProjectDeleted(projectId);
    const result = await this.projectModel.del(projectId);
    return ok(result);
  }

  /**
   * 服务端拉取 Swagger/OpenAPI JSON（避免浏览器跨域）
   */
  async fetchSwaggerJson(url: string) {
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

  /**
   * 复制项目（含分类、接口、成员、默认测试集）
   * @param {object} params 复制表单（含 cat、preName、name、group_id 等）
   * @param {{ uid: number, username: string, role: string }} actor 操作者
   */
  async copyProject(params, actor) {
    try {
      const copyId = params._id;
      params.basepath = params.basepath || "";
      const data = Object.assign({}, params, {
        project_type: params.project_type || "private",
        uid: actor.uid,
        add_time: commons.time(),
        up_time: commons.time(),
        env: params.env || [{ name: "local", domain: "http://127.0.0.1" }],
      });
      delete data._id;

      const result = await this.projectModel.save(data);
      if (!result._id) {
        return ok(result);
      }

      await this.interfaceColModel.save({
        name: "公共测试集",
        project_id: result._id,
        desc: "公共测试集",
        uid: actor.uid,
        add_time: commons.time(),
        up_time: commons.time(),
      });

      const cat = params.cat || [];
      for (let i = 0; i < cat.length; i++) {
        const item = cat[i];
        const catResult = await this.catModel.save({
          name: item.name,
          project_id: result._id,
          desc: item.desc,
          uid: actor.uid,
          add_time: commons.time(),
          up_time: commons.time(),
        });
        const interfaceData = await this.interfaceModel.listByInterStatus(item._id);
        for (let key = 0; key < interfaceData.length; key++) {
          const interfaceItem = interfaceData[key];
          const ifacePayload = Object.assign({}, interfaceItem, {
            uid: actor.uid,
            catid: catResult._id,
            project_id: result._id,
            add_time: commons.time(),
            up_time: commons.time(),
          });
          delete ifacePayload._id;
          await this.interfaceModel.save(ifacePayload);
        }
      }

      const copyProject = await this.projectModel.get(copyId);
      let copyProjectMembers = copyProject.members || [];
      if (actor.role !== "admin") {
        const userdata = await commons.getUserdata(actor.uid, "owner");
        const check = await this.projectModel.checkMemberRepeat(copyId, actor.uid);
        if (check === 0 && userdata) {
          copyProjectMembers.push(userdata);
        }
      }
      await this.projectModel.addMember(result._id, copyProjectMembers);

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

  /**
   * 分组下项目列表（含关注排序）
   */
  async listByGroup(groupId, { uid, groupData, auth }) {
    const follow = await this.followModel.list(uid);
    const result = await this.projectModel.list(groupId);
    let project_list = [];
    const isPrivateGroup =
      groupData.type === "private" && uid === groupData.uid;

    if (!isPrivateGroup) {
      for (let index = 0; index < result.length; index++) {
        let item = result[index];
        if (item.project_type === "private" && auth === false) {
          const r = await this.projectModel.checkMemberRepeat(item._id, uid);
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

  /** 项目成员列表 */
  async getMemberList(projectId) {
    const project = await this.projectModel.get(projectId);
    if (!project) {
      return fail(400, "不存在的项目");
    }
    return ok(project.members || []);
  }

  /**
   * 批量添加成员
   */
  async addMembers({ id, member_uids, role, operator }) {
    const add_members = [];
    const exist_members = [];
    const no_members = [];
    const normalizedRole = resolveProjectMemberRole(role);

    for (let i = 0; i < member_uids.length; i++) {
      const memberId = member_uids[i];
      const check = await this.projectModel.checkMemberRepeat(id, memberId);
      const userdata = await commons.getUserdata(memberId, normalizedRole);
      if (check > 0) {
        exist_members.push(userdata);
      } else if (!userdata) {
        no_members.push(memberId);
      } else {
        add_members.push(userdata);
      }
    }

    const result = await this.projectModel.addMember(id, add_members);
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

  /** 删除项目成员 */
  async delMember({ id, member_uid, operator }) {
    const check = await this.projectModel.checkMemberRepeat(id, member_uid);
    if (check === 0) {
      return fail(400, "项目成员不存在");
    }
    const result = await this.projectModel.delMember(id, member_uid);
    const member = await userRepository.findById(member_uid);
    commons.saveLog({
      content: `<a href="/user/profile/${operator.uid}">${operator.username}</a> 删除了项目中的成员 <a href="/user/profile/${member_uid}">${member ? member.username : ""}</a>`,
      type: "project",
      uid: operator.uid,
      username: operator.username,
      typeid: id,
    });
    return ok(result);
  }

  /** 成员邮件通知开关 */
  async changeMemberEmailNotice({ id, member_uid, notice }) {
    const check = await this.projectModel.checkMemberRepeat(id, member_uid);
    if (check === 0) {
      return fail(400, "项目成员不存在");
    }
    const result = await this.projectModel.changeMemberEmailNotice(
      id,
      member_uid,
      notice
    );
    return ok(result);
  }

  /** 检查项目名是否可用 */
  async checkNameAvailable(name: string, groupId: number | string) {
    const validated = validateProjectName(name);
    if (!validated.ok) {
      return validated;
    }
    const checkRepeat = await this.projectModel.checkNameRepeat(validated.data, groupId);
    if (checkRepeat > 0) {
      return fail(401, "已存在的项目名");
    }
    return ok({});
  }

  /**
   * 新建项目（含默认测试集、分类、创建者为 owner）
   */
  async createProject(params, { uid, username, role }) {
    const checkRepeat = await this.projectModel.checkNameRepeat(params.name, params.group_id);
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
      add_time: commons.time(),
      up_time: commons.time(),
      is_json5: false,
      env: DEFAULT_PROJECT_ENV,
    };

    const result = await this.projectModel.save(data);
    if (result._id) {
      await this.interfaceColModel.save({
        name: "公共测试集",
        project_id: result._id,
        desc: "公共测试集",
        uid,
        add_time: commons.time(),
        up_time: commons.time(),
      });
      await this.catModel.save({
        name: "公共分类",
        project_id: result._id,
        desc: "公共分类",
        uid,
        add_time: commons.time(),
        up_time: commons.time(),
      });
    }

    if (role !== "admin") {
      const userdata = await commons.getUserdata(uid, "owner");
      await this.projectModel.addMember(result._id, [userdata]);
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

  /** 更新项目基本信息 */
  async updateProject(id, params, { uid, username }) {
    const projectData = await this.projectModel.get(id);
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
      const checkRepeat = await this.projectModel.checkNameRepeat(params.name, params.group_id);
      if (checkRepeat > 0) {
        return fail(401, "已存在的项目名");
      }
    }

    const data = Object.assign({ up_time: commons.time() }, params);
    const result = await this.projectModel.up(id, data);
    commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 更新了项目 <a href="/project/${id}/interface/api">${projectData.name}</a>`,
      type: "project",
      uid,
      username,
      typeid: id,
    });
    return ok(result);
  }

  /** 更新项目图标与颜色 */
  async updateAppearance(id, { color, icon }, { uid, username }) {
    const result = await this.projectModel.up(id, { color, icon });
    this.followModel.updateById(uid, id, { color, icon }).then(() => {
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

  /** 更新项目环境配置 */
  async updateEnv(id, env, { uid, username }) {
    const envValidated = validateProjectEnvList(env);
    if (!envValidated.ok) {
      return envValidated;
    }
    const projectData = await this.projectModel.get(id);
    if (!projectData) {
      return fail(400, "不存在的项目");
    }
    const result = await this.projectModel.up(id, {
      env: envValidated.data,
      up_time: commons.time(),
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

  /** 更新项目 tag 配置 */
  async updateTag(id, tag, { uid, username }) {
    const tagValidated = validateProjectTagList(tag);
    if (!tagValidated.ok) {
      return tagValidated;
    }
    const projectData = await this.projectModel.get(id);
    if (!projectData) {
      return fail(400, "不存在的项目");
    }
    const result = await this.projectModel.up(id, {
      tag: tagValidated.data,
      up_time: commons.time(),
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

  /** 修改项目成员角色 */
  async changeMemberRole({ id, member_uid, role, operator }) {
    const check = await this.projectModel.checkMemberRepeat(id, member_uid);
    if (check === 0) {
      return fail(400, "项目成员不存在");
    }
    const normalizedRole = resolveProjectMemberRole(role);
    const result = await this.projectModel.changeMemberRole(
      id,
      member_uid,
      normalizedRole
    );
    const member = await userRepository.findById(member_uid);
    commons.saveLog({
      content: `<a href="/user/profile/${operator.uid}">${operator.username}</a> 修改了项目中的成员 <a href="/user/profile/${member_uid}">${member ? member.username : ""}</a> 的角色为 "${PROJECT_MEMBER_ROLE_LABEL[normalizedRole]}"`,
      type: "project",
      uid: operator.uid,
      username: operator.username,
      typeid: id,
    });
    return ok(result);
  }

  /** 获取或创建项目 token（开放 API / 自动同步鉴权用） */
  async getOrCreateProjectToken(projectId, uid) {
    try {
      let data = await this.tokenModel.get(projectId);
      let token;
      if (!data) {
        const passsalt = commons.randStr();
        token = sha("sha1").update(passsalt).digest("hex").substr(0, 20);
        await this.tokenModel.save({ project_id: projectId, token });
      } else {
        token = data.token;
      }
      return ok(getToken(token, uid));
    } catch (err) {
      return fail(402, errorMessage(err));
    }
  }

  /** 刷新项目 token（需 uid 以生成与 get 接口一致的加密 token） */
  async refreshProjectToken(projectId, uid: number | string) {
    try {
      const data = await this.tokenModel.get(projectId);
      if (!data || !data.token) {
        return fail(402, "没有查到token信息");
      }
      const passsalt = commons.randStr();
      let token = sha("sha1").update(passsalt).digest("hex").substr(0, 20);
      const result = await this.tokenModel.up(projectId, token);
      token = getToken(token, uid);
      result.token = token;
      return ok(result);
    } catch (err) {
      return fail(402, errorMessage(err));
    }
  }

  /** 获取项目环境变量 */
  async getProjectEnv(projectId: number | string) {
    const validated = validateProjectId(projectId);
    if (!validated.ok) {
      return validated;
    }
    const env = await this.projectModel.getByEnv(validated.data);
    return ok(env);
  }
}

export default new ProjectService();
