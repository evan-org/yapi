// @ts-nocheck
/**
 * 项目模块业务逻辑（搜索、删除、详情、Swagger 代理等）
 */
import axios from "axios";
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
}

export default new ProjectService();
