// @ts-nocheck
/**
 * 项目模块业务逻辑（搜索、删除、详情、Swagger 代理等）
 */
import axios from "axios";
import _ from "underscore";
import yapi from "../runtime.js";
import commons, { validateSearchKeyword } from "../utils/commons.js";
import {
  projectRepository,
  groupRepository,
  interfaceRepository,
  interfaceColRepository,
  interfaceCaseRepository,
  followRepository,
  interfaceCatRepository,
  userRepository,
} from "../repositories/index.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";

class ProjectService extends BaseService {
  constructor() {
    super();
    this.projectModel = projectRepository;
    this.groupModel = groupRepository;
    this.interfaceModel = interfaceRepository;
    this.interfaceColModel = interfaceColRepository;
    this.interfaceCaseModel = interfaceCaseRepository;
    this.followModel = followRepository;
    this.catModel = interfaceCatRepository;
  }

  /**
   * 全局模糊搜索：项目 / 分组 / 接口
   */
  async search(keyword) {
    const q = (keyword || "").trim();
    if (!q) {
      return fail(400, "No keyword.");
    }
    if (!validateSearchKeyword(q)) {
      return fail(400, "Bad query.");
    }

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
    const data = result.toObject();
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
    yapi.emitHook("project_del", projectId).then();
    const result = await this.projectModel.del(projectId);
    return ok(result);
  }

  /**
   * 服务端拉取 Swagger/OpenAPI JSON（避免浏览器跨域）
   */
  async fetchSwaggerJson(url) {
    if (!url) {
      return fail(400, "url 不能为空");
    }
    try {
      const { data } = await axios.get(url);
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
        add_time: yapi.commons.time(),
        up_time: yapi.commons.time(),
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
        add_time: yapi.commons.time(),
        up_time: yapi.commons.time(),
      });

      const cat = params.cat || [];
      for (let i = 0; i < cat.length; i++) {
        const item = cat[i];
        const catResult = await this.catModel.save({
          name: item.name,
          project_id: result._id,
          desc: item.desc,
          uid: actor.uid,
          add_time: yapi.commons.time(),
          up_time: yapi.commons.time(),
        });
        const interfaceData = await this.interfaceModel.listByInterStatus(item._id);
        for (let key = 0; key < interfaceData.length; key++) {
          const interfaceItem = interfaceData[key].toObject();
          const ifacePayload = Object.assign({}, interfaceItem, {
            uid: actor.uid,
            catid: catResult._id,
            project_id: result._id,
            add_time: yapi.commons.time(),
            up_time: yapi.commons.time(),
          });
          delete ifacePayload._id;
          await this.interfaceModel.save(ifacePayload);
        }
      }

      const copyProject = await this.projectModel.get(copyId);
      let copyProjectMembers = copyProject.members || [];
      if (actor.role !== "admin") {
        const userdata = await yapi.commons.getUserdata(actor.uid, "owner");
        const check = await this.projectModel.checkMemberRepeat(copyId, actor.uid);
        if (check === 0 && userdata) {
          copyProjectMembers.push(userdata);
        }
      }
      await this.projectModel.addMember(result._id, copyProjectMembers);

      yapi.commons.saveLog({
        content: `<a href="/user/profile/${actor.uid}">${actor.username}</a> 复制了项目 ${params.preName} 为 <a href="/project/${result._id}">${params.name}</a>`,
        type: "project",
        uid: actor.uid,
        username: actor.username,
        typeid: result._id,
      });

      return ok(result);
    } catch (err) {
      return fail(402, err.message);
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
        let item = result[index].toObject();
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
        const row = item.toObject();
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
    const normalizedRole =
      ["owner", "dev", "guest"].find((v) => v === role) || "dev";

    for (let i = 0; i < member_uids.length; i++) {
      const memberId = member_uids[i];
      const check = await this.projectModel.checkMemberRepeat(id, memberId);
      const userdata = await yapi.commons.getUserdata(memberId, normalizedRole);
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
      yapi.commons.saveLog({
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
    yapi.commons.saveLog({
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
}

export default new ProjectService();
