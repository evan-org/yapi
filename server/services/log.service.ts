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
import { ok, fail } from "./service-result.js";

type LogPagedQuery = {
  typeid?: string | number;
  type?: string;
  page?: number;
  limit?: number;
  selectValue?: string;
};

type InterfaceUpdateQuery = {
  typeid: number;
  type: string;
  apis: Array<{ method: string; path: string }>;
};

class LogService extends BaseService {
  logModel = logRepository;
  groupModel = groupRepository;
  projectModel = projectRepository;
  interfaceModel = interfaceRepository;

  /**
   * 分页动态列表
   */
  async listPaged(query: LogPagedQuery) {
    const { typeid, type, selectValue } = query;
    const page = query.page || 1;
    const limit = query.limit || 10;

    if (!typeid) {
      return fail(400, "typeid不能为空");
    }
    if (!type) {
      return fail(400, "type不能为空");
    }

    if (type === "group") {
      const projectList = await this.projectModel.list(typeid);
      const projectIds: unknown[] = [];
      const projectDatas: Record<string | number, { name: string }> = {};
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
      projectLogList = projectLogList.map((item: Record<string, unknown>) => {
        const row = item;
        if (row.type === "project") {
          row.content =
            `在 <a href="/project/${row.typeid}">${projectDatas[row.typeid as number].name}</a> 项目: ` +
            row.content;
        }
        return row;
      });
      const total = await this.logModel.listCountByGroup(typeid, projectIds);
      return ok({
        list: projectLogList,
        total: Math.ceil(total / limit),
      });
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
      return ok({
        total: Math.ceil(count / limit),
        list,
      });
    }

    return fail(400, "type不支持");
  }

  /**
   * 按接口更新记录查询动态
   */
  async listByInterfaceUpdates(params: InterfaceUpdateQuery) {
    const { typeid, type, apis } = params;
    let list: unknown[] = [];
    const projectDatas = await this.projectModel.getBaseInfo(typeid, "basepath");
    const basePath = projectDatas.basepath;

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
    return ok(list);
  }
}

export default new LogService();
