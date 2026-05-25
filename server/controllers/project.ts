/**
 * 项目 HTTP 控制器（薄层：权限校验 → projectService）
 */
import yapi from "../runtime.js";
import type { YapiRuntime } from "../types/global.js";
import type { AppContext } from "../types/app-context.js";
import baseController from "./base.js";
import commons from "../utils/commons.js";
import {
  projectRepository,
  groupRepository,
  logRepository,
  followRepository,
  interfaceRepository,
} from "../repositories/index.js";
import { projectService } from "../services/index.js";
import { normalizeBasepath } from "../services/project.service.js";
import type { ServiceResult } from "../services/service-result.js";
import { replyServiceResult, replyException } from "./controller.util.js";

/** action-runner 合并 query/body 后的参数 */
type RouteParams = Record<string, unknown>;

function queryScalar(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function routeId(value: unknown): number | string {
  return value as number | string;
}

class projectController extends baseController {
  /** Service 结果 → HTTP 响应 */
  declare schemaMap: Record<string, unknown>;
  Model: typeof projectRepository;
  groupModel: typeof groupRepository;
  logModel: typeof logRepository;
  followModel: typeof followRepository;
  interfaceModel: typeof interfaceRepository;

  _reply(ctx: AppContext, result: ServiceResult<unknown>, successMsg?: string) {
    replyServiceResult(ctx, result, successMsg);
  }

  _operator() {
    return {
      uid: this.getUid(),
      username: this.getUsername(),
      role: this.getRole() || "",
    };
  }

  constructor(ctx: AppContext) {
    super(ctx);
    this.Model = projectRepository;
    this.groupModel = groupRepository;
    this.logModel = logRepository;
    this.followModel = followRepository;
    this.interfaceModel = interfaceRepository;

    const id = "number";
    const member_uid = ["number"];
    const name = {
      type: "string",
      minLength: 1
    };
    const role = {
      type: "string",
      enum: ["owner", "dev", "guest"]
    };
    const basepath = {
      type: "string",
      default: ""
    };
    const group_id = "number";
    const group_name = "string";
    const project_type = {
      type: "string",
      enum: ["private", "public"],
      default: "private"
    };
    const desc = "string";
    const icon = "string";
    const color = "string";
    const env = "array";

    const cat = "array";
    this.schemaMap = {
      add: {
        "*name": name,
        basepath: basepath,
        "*group_id": group_id,
        group_name,
        desc: desc,
        color,
        icon,
        project_type
      },
      copy: {
        "*name": name,
        preName: name,
        basepath: basepath,
        "*group_id": group_id,
        _id: id,
        cat,
        pre_script: desc,
        after_script: desc,
        env,
        group_name,
        desc,
        color,
        icon,
        project_type
      },
      addMember: {
        "*id": id,
        "*member_uids": member_uid,
        role: role
      },
      delMember: {
        "*id": id,
        "*member_uid": id
      },
      getMemberList: {
        "*id": id
      },
      get: {
        "id": id,
        "project_id": id
      },
      list: {
        "*group_id": group_id
      },
      del: {
        "*id": id
      },
      changeMemberRole: {
        "*id": id,
        "*member_uid": id,
        role
      },
      token: {
        "*project_id": id
      },
      updateToken: {
        "*project_id": id
      }
    };
  }

  handleBasepath(basepath: string) {
    return normalizeBasepath(basepath);
  }

  verifyDomain(domain: string) {
    if (!domain) {
      return false;
    }
    if (/^[a-zA-Z0-9\-_\.]+?\.[a-zA-Z0-9\-_\.]*?[a-zA-Z]{2,6}$/.test(domain)) {
      return true;
    }
    return false;
  }

  /**
   * 判断分组名称是否重复
   * @interface /project/check_project_name
   * @method get
   */

  async checkProjectName(ctx: AppContext) {
    try {
      const name = queryScalar(ctx.request.query.name);
      const group_id = queryScalar(ctx.request.query.group_id);
      const result = await projectService.checkNameAvailable(name, group_id);
      this._reply(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  /**
   * 添加项目分组
   * @interface /project/add
   * @method POST
   * @category project
   * @foldnumber 10
   * @param {String} name 项目名称，不能为空
   * @param {String} basepath 项目基本路径，不能为空
   * @param {Number} group_id 项目分组id，不能为空
   * @param {Number} group_name 项目分组名称，不能为空
   * @param {String} project_type private public
   * @param  {String} [desc] 项目描述
   * @returns {Object}
   * @example ./api/project/add.json
   */
  async add(ctx: AppContext) {
    const params = ctx.params as unknown as RouteParams;

    if ((await this.checkAuth(routeId(params.group_id), "group", "edit")) !== true) {
      return (ctx.body = commons.resReturn(null, 405, "没有权限"));
    }

    const result = await projectService.createProject(params, {
      uid: this.getUid(),
      username: this.getUsername(),
      role: this.getRole(),
    });
    this._reply(ctx, result);
  }

  /**
   * 拷贝项目分组
   * @interface /project/copy
   * @method POST
   * @category project
   * @foldnumber 10
   * @param {String} name 项目名称，不能为空
   * @param {String} basepath 项目基本路径，不能为空
   * @param {Number} group_id 项目分组id，不能为空
   * @param {Number} group_name 项目分组名称，不能为空
   * @param {String} project_type private public
   * @param  {String} [desc] 项目描述
   * @returns {Object}
   * @example ./api/project/add.json
   */
  async copy(ctx: AppContext) {
    const params = ctx.params as unknown as RouteParams;
    if ((await this.checkAuth(routeId(params.group_id), "group", "edit")) !== true) {
      return (ctx.body = commons.resReturn(null, 405, "没有权限"));
    }
    const result = await projectService.copyProject(params, {
      uid: this.getUid(),
      username: this.getUsername(),
      role: this.getRole(),
    });
    this._reply(ctx, result);
  }

  /**
   * 添加项目成员
   * @interface /project/add_member
   * @method POST
   * @category project
   * @foldnumber 10
   * @param {Number} id 项目id，不能为空
   * @param {Array} member_uid 项目成员uid,不能为空
   * @returns {Object}
   * @example ./api/project/add_member.json
   */
  async addMember(ctx: AppContext) {
    const params = ctx.params as unknown as RouteParams;
    if ((await this.checkAuth(routeId(params.id), "project", "edit")) !== true) {
      return (ctx.body = commons.resReturn(null, 405, "没有权限"));
    }

    const result = await projectService.addMembers({
      id: routeId(params.id),
      member_uids: params.member_uids as Array<number | string>,
      role: params.role as string | undefined,
      operator: { uid: this.getUid(), username: this.getUsername() },
    });
    this._reply(ctx, result as ServiceResult<unknown>);
  }
  /**
   * 删除项目成员
   * @interface /project/del_member
   * @method POST
   * @category project
   * @foldnumber 10
   * @param {Number} id 项目id，不能为空
   * @param {member_uid} uid 项目成员uid,不能为空
   * @returns {Object}
   * @example ./api/project/del_member.json
   */

  async delMember(ctx: AppContext) {
    try {
      const params = ctx.params as unknown as RouteParams;

      if ((await this.checkAuth(routeId(params.id), "project", "danger")) !== true) {
        return (ctx.body = commons.resReturn(null, 405, "没有权限"));
      }

      const result = await projectService.delMember({
        id: routeId(params.id),
        member_uid: routeId(params.member_uid),
        operator: { uid: this.getUid(), username: this.getUsername() },
      });
      this._reply(ctx, result as ServiceResult<unknown>);
    } catch (e) {
      replyException(ctx, e);
    }
  }

  /**
   * 获取项目成员列表
   * @interface /project/get_member_list
   * @method GET
   * @category project
   * @foldnumber 10
   * @param {Number} id 项目id，不能为空
   * @return {Object}
   * @example ./api/project/get_member_list.json
   */

  async getMemberList(ctx: AppContext) {
    const params = ctx.params as unknown as RouteParams;
    if (!params.id) {
      return (ctx.body = commons.resReturn(null, 400, "项目id不能为空"));
    }

    const result = await projectService.getMemberList(routeId(params.id));
    this._reply(ctx, result as ServiceResult<unknown>);
  }

  /**
   * 获取项目信息
   * @interface /project/get
   * @method GET
   * @category project
   * @foldnumber 10
   * @param {Number} id 项目id，不能为空
   * @returns {Object}
   * @example ./api/project/get.json
   */

  async get(ctx: AppContext) {
    const params = ctx.params as unknown as RouteParams;
    const projectId = routeId(params.id || params.project_id);
    const loaded = await projectService.getDetail(projectId);
    if (loaded.ok === false) {
      return (ctx.body = commons.resReturn(null, loaded.code, loaded.message));
    }
    const result = loaded.data;
    if (result.project_type === "private") {
      if ((await this.checkAuth(result._id, "project", "view")) !== true) {
        return (ctx.body = commons.resReturn(null, 406, "没有权限"));
      }
    }
    result.role = await this.getProjectRole(projectId, "project");
    (yapi as YapiRuntime).emitHook("project_get", result).then();
    ctx.body = commons.resReturn(result, 0, undefined);
  }

  /**
   * 获取项目列表
   * @interface /project/list
   * @method GET
   * @category project
   * @foldnumber 10
   * @param {Number} group_id 项目group_id，不能为空
   * @returns {Object}
   * @example ./api/project/list.json
   */

  async list(ctx: AppContext) {
    const group_id = (ctx.params as unknown as RouteParams).group_id as number | string;
    let groupData = await this.groupModel.get(group_id);
    const auth = await this.checkAuth(routeId(group_id), "group", "view");
    const result = await projectService.listByGroup(routeId(group_id), {
      uid: this.getUid(),
      groupData,
      auth,
    });
    this._reply(ctx, result as ServiceResult<unknown>);
  }

  /**
   * 删除项目
   * @interface /project/del
   * @method POST
   * @category project
   * @foldnumber 10
   * @param {Number} id 项目id，不能为空
   * @returns {Object}
   * @example ./api/project/del.json
   */

  async del(ctx: AppContext) {
    const id = (ctx.params as unknown as RouteParams).id as number | string;

    if ((await this.checkAuth(id, "project", "danger")) !== true) {
      return (ctx.body = commons.resReturn(null, 405, "没有权限"));
    }

    this._reply(ctx, await projectService.deleteById(id));
  }

  /**
   * 修改项目成员角色
   * @interface /project/change_member_role
   * @method POST
   * @category project
   * @foldnumber 10
   * @param {String} id 项目id
   * @param {String} member_uid 项目成员uid
   * @param {String} role 权限 ['owner'|'dev']
   * @returns {Object}
   * @example
   */
  async changeMemberRole(ctx: AppContext) {
    const params = ctx.request.body as RouteParams;
    if ((await this.checkAuth(routeId(params.id), "project", "danger")) !== true) {
      return (ctx.body = commons.resReturn(null, 405, "没有权限"));
    }
    const result = await projectService.changeMemberRole({
      id: routeId(params.id),
      member_uid: routeId(params.member_uid),
      role: params.role as string,
      operator: { uid: this.getUid(), username: this.getUsername() },
    });
    this._reply(ctx, result);
  }

  /**
   * 修改项目成员是否收到邮件通知
   * @interface /project/change_member_email_notice
   * @method POST
   * @category project
   * @foldnumber 10
   * @param {String} id 项目id
   * @param {String} member_uid 项目成员uid
   * @param {String} role 权限 ['owner'|'dev']
   * @returns {Object}
   * @example
   */
  async changeMemberEmailNotice(ctx: AppContext) {
    try {
      const params = ctx.request.body as RouteParams;
      if ((await this.checkAuth(routeId(params.id), "project", "edit")) !== true) {
        return (ctx.body = commons.resReturn(null, 405, "没有权限"));
      }
      const result = await projectService.changeMemberEmailNotice({
        id: routeId(params.id),
        member_uid: routeId(params.member_uid),
        notice: params.notice,
      });
      this._reply(ctx, result as ServiceResult<unknown>);
    } catch (e) {
      replyException(ctx, e);
    }
  }

  /**
   * 项目头像设置
   * @interface /project/upset
   * @method POST
   * @category project
   * @foldnumber 10
   * @param {Number} id 项目id，不能为空
   * @param {String} icon 项目icon
   * @param {Array} color 项目color
   * @returns {Object}
   * @example ./api/project/upset
   */
  async upSet(ctx: AppContext) {
    const id = routeId(ctx.request.body.id);
    if (!id) {
      return (ctx.body = commons.resReturn(null, 405, "项目id不能为空"));
    }
    if ((await this.checkAuth(id, "project", "danger")) !== true) {
      return (ctx.body = commons.resReturn(null, 405, "没有权限"));
    }
    try {
      const result = await projectService.updateAppearance(
        id,
        { color: ctx.request.body.color, icon: ctx.request.body.icon },
        { uid: this.getUid(), username: this.getUsername() }
      );
      this._reply(ctx, result);
    } catch (e) {
      replyException(ctx, e);
    }
  }

  /**
   * 编辑项目
   * @interface /project/up
   * @method POST
   * @category project
   * @foldnumber 10
   * @param {Number} id 项目id，不能为空
   * @param {String} name 项目名称，不能为空
   * @param {String} basepath 项目基本路径，不能为空
   * @param {String} [desc] 项目描述
   * @returns {Object}
   * @example ./api/project/up.json
   */
  async up(ctx: AppContext) {
    try {
      const id = routeId(ctx.request.body.id);
      const params = commons.handleParams(ctx.request.body as RouteParams, {
        name: "string",
        basepath: "string",
        group_id: "number",
        desc: "string",
        pre_script: "string",
        after_script: "string",
        project_mock_script: "string",
      }) as RouteParams;

      if (!id) {
        return (ctx.body = commons.resReturn(null, 405, "项目id不能为空"));
      }

      if ((await this.checkAuth(id, "project", "danger")) !== true) {
        return (ctx.body = commons.resReturn(null, 405, "没有权限"));
      }

      const result = await projectService.updateProject(id, params, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      this._reply(ctx, result);
    } catch (e) {
      replyException(ctx, e);
    }
  }

  /**
   * 编辑项目
   * @interface /project/up_env
   * @method POST
   * @category project
   * @foldnumber 10
   * @param {Number} id 项目id，不能为空
   * @param {Array} [env] 项目环境配置
   * @param {String} [env[].name] 环境名称
   * @param {String} [env[].domain] 环境域名
   * @param {Array}  [env[].header] header
   * @returns {Object}
   * @example
   */
  async upEnv(ctx: AppContext) {
    try {
      const id = routeId(ctx.request.body.id);
      const params = ctx.request.body as RouteParams;
      if (!id) {
        return (ctx.body = commons.resReturn(null, 405, "项目id不能为空"));
      }

      if ((await this.checkAuth(id, "project", "edit")) !== true) {
        return (ctx.body = commons.resReturn(null, 405, "没有权限"));
      }

      const result = await projectService.updateEnv(id, params.env, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      this._reply(ctx, result);
    } catch (e) {
      replyException(ctx, e);
    }
  }

  /**
   * 编辑项目
   * @interface /project/up_tag
   * @method POST
   * @category project
   * @foldnumber 10
   * @param {Number} id 项目id，不能为空
   * @param {Array} [tag] 项目tag配置
   * @param {String} [tag[].name] tag名称
   * @param {String} [tag[].desc] tag描述
   * @returns {Object}
   * @example
   */
  async upTag(ctx: AppContext) {
    try {
      const id = routeId(ctx.request.body.id);
      const params = ctx.request.body as RouteParams;
      if (!id) {
        return (ctx.body = commons.resReturn(null, 405, "项目id不能为空"));
      }

      if ((await this.checkAuth(id, "project", "edit")) !== true) {
        return (ctx.body = commons.resReturn(null, 405, "没有权限"));
      }

      const result = await projectService.updateTag(id, params.tag, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      this._reply(ctx, result);
    } catch (e) {
      replyException(ctx, e);
    }
  }

  /**
   * 获取项目的环境变量值
   * @interface /project/get_env
   * @method GET
   * @category project
   * @foldnumber 10
   * @param {Number} id 项目id，不能为空

   * @returns {Object}
   * @example
   */
  async getEnv(ctx: AppContext) {
    try {
      const project_id = queryScalar(ctx.request.query.project_id);
      const result = await projectService.getProjectEnv(project_id);
      this._reply(ctx, result);
    } catch (e) {
      replyException(ctx, e);
    }
  }

  arrRepeat(arr: Array<Record<string, unknown>>, key: string) {
    const s = new Set();
    arr.forEach((item) => s.add(item[key]));
    return s.size !== arr.length;
  }

  /**
   * 获取token数据
   * @interface /project/token
   * @method GET
   * @category project
   * @foldnumber 10
   * @param {Number} id 项目id，不能为空
   * @param {String} q
   * @return {Object}
   */
  async token(ctx: AppContext) {
    try {
      const project_id = (ctx.params as unknown as RouteParams).project_id as number | string;
      const result = await projectService.getOrCreateProjectToken(
        project_id,
        this.getUid()
      );
      this._reply(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  /**
   * 更新token数据
   * @interface /project/update_token
   * @method GET
   * @category project
   * @foldnumber 10
   * @param {Number} id 项目id，不能为空
   * @param {String} q
   * @return {Object}
   */
  async updateToken(ctx: AppContext) {
    try {
      const project_id = (ctx.params as unknown as RouteParams).project_id as number | string;
      const result = await projectService.refreshProjectToken(
        project_id,
        this.getUid()
      );
      this._reply(ctx, result);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  /**
   * 模糊搜索项目名称或者分组名称或接口名称
   * @interface /project/search
   * @method GET
   * @category project
   * @foldnumber 10
   * @param {String} q
   * @return {Object}
   * @example ./api/project/search.json
   */
  async search(ctx: AppContext) {
    const q = queryScalar(ctx.request.query.q);
    const result = await projectService.search(q);
    if (result.ok === false) {
      return (ctx.body = commons.resReturn(null, result.code, result.message));
    }
    return (ctx.body = commons.resReturn(result.data, 0, "ok"));
  }

  // 输入 swagger url 的时候 node 端请求数据
  async swaggerUrl(ctx: AppContext) {
    const url = queryScalar(ctx.request.query.url);
    const result = await projectService.fetchSwaggerJson(url);
    if (result.ok === false) {
      return (ctx.body = commons.resReturn(null, result.code, result.message));
    }
    ctx.body = commons.resReturn(result.data, 0, undefined);
  }
}

export default projectController;
