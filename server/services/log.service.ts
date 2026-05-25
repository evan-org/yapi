// @ts-nocheck
/**
 * 动态日志业务逻辑
 */
import {
  logRepository,
  groupRepository,
  projectRepository,
  interfaceRepository,
} from "../repositories/index.js";
import BaseService from "./base.service.js";

class LogService extends BaseService {
  constructor() {
    super();
    this.logModel = logRepository;
    this.groupModel = groupRepository;
    this.projectModel = projectRepository;
    this.interfaceModel = interfaceRepository;
  }

  /**
   * 分页动态列表
   * @param {{ typeid: string|number, type: string, page?: number, limit?: number, selectValue?: string }} query
   */
  async listPaged(query) {
    const { typeid, type, selectValue } = query;
    const page = query.page || 1;
    const limit = query.limit || 10;

    if (!typeid) {
      return { ok: false, code: 400, message: "typeid不能为空" };
    }
    if (!type) {
      return { ok: false, code: 400, message: "type不能为空" };
    }

    if (type === "group") {
      const projectList = await this.projectModel.list(typeid);
      const projectIds = [];
      const projectDatas = {};
      for (const i in projectList) {
        projectDatas[projectList[i]._id] = projectList[i];
        projectIds[i] = projectList[i]._id;
      }
      let projectLogList = await this.logModel.listWithPagingByGroup(
        typeid,
        projectIds,
        page,
        limit
      );
      projectLogList = projectLogList.map((item) => {
        const row = item.toObject();
        if (row.type === "project") {
          row.content =
            `在 <a href="/project/${row.typeid}">${projectDatas[row.typeid].name}</a> 项目: ` +
            row.content;
        }
        return row;
      });
      const total = await this.logModel.listCountByGroup(typeid, projectIds);
      return {
        ok: true,
        data: {
          list: projectLogList,
          total: Math.ceil(total / limit),
        },
      };
    }

    if (type === "project") {
      const list = await this.logModel.listWithPaging(
        typeid,
        type,
        page,
        limit,
        selectValue
      );
      const count = await this.logModel.listCount(typeid, type, selectValue);
      return {
        ok: true,
        data: {
          total: Math.ceil(count / limit),
          list,
        },
      };
    }

    return { ok: false, code: 400, message: "type不支持" };
  }

  /**
   * 按接口更新记录查询动态
   * @param {{ typeid: number, type: string, apis: Array<{ method: string, path: string }> }} params
   */
  async listByInterfaceUpdates(params) {
    const { typeid, type, apis } = params;
    let list = [];
    const projectDatas = await this.projectModel.getBaseInfo(typeid, "basepath");
    const basePath = projectDatas.toObject().basepath;

    for (let i = 0; i < apis.length; i++) {
      let api = apis[i];
      if (basePath) {
        api = {
          ...api,
          path:
            api.path.indexOf(basePath) === 0
              ? api.path.substr(basePath.length)
              : api.path,
        };
      }
      const interfaceIdList = await this.interfaceModel.getByPath(
        typeid,
        api.path,
        api.method,
        "_id"
      );
      for (let j = 0; j < interfaceIdList.length; j++) {
        const id = interfaceIdList[j].id;
        const result = await this.logModel.listWithCatid(typeid, type, id);
        list = list.concat(result);
      }
    }
    return { ok: true, data: list };
  }
}

export default new LogService();
