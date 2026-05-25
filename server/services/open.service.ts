// @ts-nocheck
/**
 * 开放 API 业务逻辑（导入、导出、远程 JSON 拉取）
 */
import axios from "axios";
import yapi from "../runtime.js";
import {
  projectRepository,
  interfaceRepository,
  interfaceCatRepository,
} from "../repositories/index.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";

class OpenService extends BaseService {
  constructor() {
    super();
    this.projectModel = projectRepository;
    this.interfaceModel = interfaceRepository;
    this.interfaceCatModel = interfaceCatRepository;
  }

  /**
   * 拉取远程 JSON 文本（导入数据、URL 模式）
   */
  async fetchRemoteContent(url) {
    const { data } = await axios.get(url, {
      responseType: "text",
      transformResponse: [(r) => r],
      timeout: 30000,
    });
    return typeof data === "string" ? data : JSON.stringify(data);
  }

  /**
   * 解析导入内容为 JSON 对象
   */
  async resolveImportJson({ json, url }) {
    let content = json;
    let warnMessage = "";

    if (!content && !url) {
      return fail(40022, "json 或者 url 参数，不能都为空");
    }

    try {
      if (url) {
        content = await this.fetchRemoteContent(url);
      } else if (
        typeof content === "string" &&
        (content.indexOf("http://") === 0 || content.indexOf("https://") === 0)
      ) {
        content = await this.fetchRemoteContent(content);
      }
      return ok({ parsed: JSON.parse(content), warnMessage });
    } catch (e) {
      return fail(40022, "json 格式有误:" + e);
    }
  }

  /**
   * 按项目导出接口树 JSON（开放 API）
   */
  async exportProjectInterfaces(projectId) {
    const project = await this.projectModel.get(projectId);
    if (!project) {
      return fail(404, "项目不存在");
    }

    const cats = await this.interfaceCatModel.list(projectId);
    const exportList = [];

    for (let i = 0; i < cats.length; i++) {
      const cat = cats[i].toObject();
      let list = await this.interfaceModel.listByCatid(cat._id);
      list = list.sort((a, b) => (a.index || 0) - (b.index || 0));
      cat.list = list.map((item) => {
        const api = item.toObject();
        delete api.__v;
        return api;
      });
      if (cat.list.length > 0) {
        exportList.push(cat);
      }
    }

    return ok({
      project_id: project._id,
      project_name: project.name,
      basepath: project.basepath || "",
      list: exportList,
    });
  }

  /**
   * 确保项目至少有一个默认分类，返回 menuList 与 selectCatid
   */
  async ensureDefaultCat(projectId, uid) {
    let menuList = await this.interfaceCatModel.list(projectId);
    if (menuList.length === 0) {
      const menu = await this.interfaceCatModel.save({
        name: "默认分类",
        project_id: projectId,
        desc: "默认分类",
        uid,
        add_time: yapi.commons.time(),
        up_time: yapi.commons.time(),
      });
      menuList.push(menu);
    }
    return { menuList, selectCatid: menuList[0]._id };
  }
}

export default new OpenService();
