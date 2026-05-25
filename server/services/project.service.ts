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
}

export default new ProjectService();
