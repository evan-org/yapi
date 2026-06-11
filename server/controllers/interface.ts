/**
 * 接口 HTTP 控制器（薄层：权限 → interfaceService）
 */
import yapi from "../runtime.js";
import type { YapiRuntime } from "../types/global.js";
import type { AppContext } from "../types/app-context.js";
import baseController from "./base.js";
import commons from "../utils/commons.js";
import { interfaceService } from "../services/index.js";
import { interfaceSchemaMap } from "../validators/interface.schemas.js";
import type { ServiceResult } from "../services/service-result.js";
import { replyServiceResult, replyException } from "./controller.util.js";

type RouteParams = Record<string, unknown>;

function queryScalar(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function routeId(value: unknown): number | string {
  return value as number | string;
}

function requestOrigin(ctx: AppContext): string {
  return new URL(ctx.request.url).origin;
}

class interfaceController extends baseController {
  declare schemaMap: typeof interfaceSchemaMap;

  _reply(ctx: AppContext, result: ServiceResult<unknown>) {
    replyServiceResult(ctx, result);
  }

  constructor(ctx: AppContext) {
    super(ctx);
    this.schemaMap = interfaceSchemaMap;
  }

  /**
   * 添加项目分组
   * @interface /interface/add
   * @method POST
   * @category interface
   * @foldnumber 10
   * @param {Number}   project_id 项目id，不能为空
   * @param {String}   title 接口标题，不能为空
   * @param {String}   path 接口请求路径，不能为空
   * @param {String}   method 请求方式
   * @param {Array}  [req_headers] 请求的header信息
   * @param {String}  [req_headers[].name] 请求的header信息名
   * @param {String}  [req_headers[].value] 请求的header信息值
   * @param {Boolean}  [req_headers[].required] 是否是必须，默认为否
   * @param {String}  [req_headers[].desc] header描述
   * @param {String}  [req_body_type] 请求参数方式，有["form", "json", "text", "xml"]四种
   * @param {Array} [req_params] name, desc两个参数
   * @param {Mixed}  [req_body_form] 请求参数,如果请求方式是form，参数是Array数组，其他格式请求参数是字符串
   * @param {String} [req_body_form[].name] 请求参数名
   * @param {String} [req_body_form[].value] 请求参数值，可填写生成规则（mock）。如@email，随机生成一条email
   * @param {String} [req_body_form[].type] 请求参数类型，有["text", "file"]两种
   * @param {String} [req_body_other]  非form类型的请求参数可保存到此字段
   * @param {String}  [res_body_type] 相应信息的数据格式，有["json", "text", "xml"]三种
   * @param {String} [res_body] 响应信息，可填写任意字符串，如果res_body_type是json,则会调用mock功能
   * @param  {String} [desc] 接口描述
   * @returns {Object}
   * @example ./api/interface/add.json
   */
  async add(ctx: AppContext) {
    const params = ctx.params as unknown as RouteParams;

    if (!this.$tokenAuth) {
      let auth = await this.checkAuth(routeId(params.project_id), "project", "edit");

      if (!auth) {
        return (ctx.body = commons.resReturn(null, 40033, "没有权限"));
      }
    }

    const result = await interfaceService.addInterface(params, {
      uid: this.getUid(),
      username: this.getUsername(),
      role: this.getRole(),
    });
    if (result.ok === false) {
      return (ctx.body = commons.resReturn(null, result.code, result.message));
    }
    ctx.body = commons.resReturn(result.data, 0, undefined);
  }

  /**
   * 保存接口数据，如果接口存在则更新数据，如果接口不存在则添加数据
   * @interface /interface/save
   * @method  post
   * @category interface
   * @foldnumber 10
   * @param {Number}   project_id 项目id，不能为空
   * @param {String}   title 接口标题，不能为空
   * @param {String}   path 接口请求路径，不能为空
   * @param {String}   method 请求方式
   * @param {Array}  [req_headers] 请求的header信息
   * @param {String}  [req_headers[].name] 请求的header信息名
   * @param {String}  [req_headers[].value] 请求的header信息值
   * @param {Boolean}  [req_headers[].required] 是否是必须，默认为否
   * @param {String}  [req_headers[].desc] header描述
   * @param {String}  [req_body_type] 请求参数方式，有["form", "json", "text", "xml"]四种
   * @param {Array} [req_params] name, desc两个参数
   * @param {Mixed}  [req_body_form] 请求参数,如果请求方式是form，参数是Array数组，其他格式请求参数是字符串
   * @param {String} [req_body_form[].name] 请求参数名
   * @param {String} [req_body_form[].value] 请求参数值，可填写生成规则（mock）。如@email，随机生成一条email
   * @param {String} [req_body_form[].type] 请求参数类型，有["text", "file"]两种
   * @param {String} [req_body_other]  非form类型的请求参数可保存到此字段
   * @param {String}  [res_body_type] 相应信息的数据格式，有["json", "text", "xml"]三种
   * @param {String} [res_body] 响应信息，可填写任意字符串，如果res_body_type是json,则会调用mock功能
   * @param  {String} [desc] 接口描述
   * @returns {Object}
   */
  async save(ctx: AppContext) {
    const params = ctx.params as unknown as RouteParams;

    if (!this.$tokenAuth) {
      const auth = await this.checkAuth(routeId(params.project_id), "project", "edit");
      if (!auth) {
        return (ctx.body = commons.resReturn(null, 40033, "没有权限"));
      }
    }

    const result = await interfaceService.saveInterface(
      params,
      {
        uid: this.getUid(),
        username: this.getUsername(),
        role: this.getRole(),
      },
      {
        schemas: this.schemaMap,
        requestOrigin: requestOrigin(ctx),
      }
    );
    if (result.ok === false) {
      return (ctx.body = commons.resReturn(null, result.code, result.message));
    }
    ctx.body = commons.resReturn(result.data, 0, undefined);
  }

  /**
   * 获取项目分组
   * @interface /interface/get
   * @method GET
   * @category interface
   * @foldnumber 10
   * @param {Number}   id 接口id，不能为空
   * @returns {Object}
   * @example ./api/interface/get.json
   */
  async get(ctx: AppContext) {
    const params = ctx.params as unknown as RouteParams;
    if (!params.id) {
      return (ctx.body = commons.resReturn(null, 400, "接口id不能为空"));
    }

    try {
      const loaded = await interfaceService.getById(params.id);
      if (loaded.ok === false) {
        return (ctx.body = commons.resReturn(null, loaded.code, loaded.message));
      }
      if (this.$tokenAuth && params.project_id !== loaded.data.project_id) {
        return (ctx.body = commons.resReturn(null, 400, "token有误"));
      }
      const proj = await interfaceService.getProjectBaseInfo(loaded.data.project_id);
      if (proj.ok === false) {
        return (ctx.body = commons.resReturn(null, proj.code, proj.message));
      }
      if (proj.data.project_type === "private") {
        if ((await this.checkAuth(proj.data._id, "project", "view")) !== true) {
          return (ctx.body = commons.resReturn(null, 406, "没有权限"));
        }
      }
      ctx.body = commons.resReturn(loaded.data, 0, undefined);
    } catch (e) {
      replyException(ctx, e);
    }
  }

  /**
   * 接口列表
   * @interface /interface/list
   * @method GET
   * @category interface
   * @foldnumber 10
   * @param {Number}   project_id 项目id，不能为空
   * @param {Number}   page 当前页
   * @param {Number}   limit 每一页限制条数
   * @returns {Object}
   * @example ./api/interface/list.json
   */
  async list(ctx: AppContext) {
    const project_id = routeId((ctx.params as unknown as RouteParams).project_id);
    let page = ctx.request.query.page || 1,
      limit = ctx.request.query.limit || 10;
    let status = ctx.request.query.status,
      tag = ctx.request.query.tag;

    const proj = await interfaceService.getProjectBaseInfo(project_id);
    if (proj.ok === false) {
      return (ctx.body = commons.resReturn(null, proj.code, proj.message));
    }
    if (proj.data.project_type === "private") {
      if ((await this.checkAuth(proj.data._id, "project", "view")) !== true) {
        return (ctx.body = commons.resReturn(null, 406, "没有权限"));
      }
    }

    try {
      const result = await interfaceService.listByProject({
        project_id,
        page,
        limit,
        status,
        tag,
      });
      if (result.ok === false) {
        return (ctx.body = commons.resReturn(null, result.code, result.message));
      }
      ctx.body = commons.resReturn(result.data, 0, undefined);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  async listByCat(ctx: AppContext) {
    let catid = ctx.request.query.catid;
    let page = ctx.request.query.page || 1,
      limit = ctx.request.query.limit || 10;
    let status = ctx.request.query.status,
      tag = ctx.request.query.tag;

    try {
      const result = await interfaceService.listByCategory({
        catid,
        page,
        limit,
        status,
        tag,
      });
      if (result.ok === false) {
        return (ctx.body = commons.resReturn(null, result.code, result.message));
      }
      const listData = result.data as {
        project: { project_type: string; _id: number | string };
        count: unknown;
        total: unknown;
        list: unknown;
      };
      if (listData.project.project_type === "private") {
        if ((await this.checkAuth(listData.project._id, "project", "view")) !== true) {
          return (ctx.body = commons.resReturn(null, 406, "没有权限"));
        }
      }
      ctx.body = commons.resReturn(
        {
          count: listData.count,
          total: listData.total,
          list: listData.list,
        },
        0,
        undefined
      );
    } catch (err) {
      ctx.body = commons.resReturn(null, 402, err.message + "1");
    }
  }

  async listByMenu(ctx: AppContext) {
    const project_id = routeId((ctx.params as unknown as RouteParams).project_id);
    if (!project_id) {
      return (ctx.body = commons.resReturn(null, 400, "项目id不能为空"));
    }

    const proj = await interfaceService.getProjectBaseInfo(project_id);
    if (proj.ok === false) {
      return (ctx.body = commons.resReturn(null, proj.code, proj.message));
    }
    if (proj.data.project_type === "private") {
      if ((await this.checkAuth(proj.data._id, "project", "view")) !== true) {
        return (ctx.body = commons.resReturn(null, 406, "没有权限"));
      }
    }

    try {
      const result = await interfaceService.listMenuByProject(project_id);
      this._reply(ctx, result as ServiceResult<unknown>);
    } catch (err) {
      replyException(ctx, err);
    }
  }

  /**
   * 编辑接口
   * @interface /interface/up
   * @method POST
   * @category interface
   * @foldnumber 10
   * @param {Number}   id 接口id，不能为空
   * @param {String}   [path] 接口请求路径
   * @param {String}   [method] 请求方式
   * @param {Array}  [req_headers] 请求的header信息
   * @param {String}  [req_headers[].name] 请求的header信息名
   * @param {String}  [req_headers[].value] 请求的header信息值
   * @param {Boolean}  [req_headers[].required] 是否是必须，默认为否
   * @param {String}  [req_headers[].desc] header描述
   * @param {String}  [req_body_type] 请求参数方式，有["form", "json", "text", "xml"]四种
   * @param {Mixed}  [req_body_form] 请求参数,如果请求方式是form，参数是Array数组，其他格式请求参数是字符串
   * @param {String} [req_body_form[].name] 请求参数名
   * @param {String} [req_body_form[].value] 请求参数值，可填写生成规则（mock）。如@email，随机生成一条email
   * @param {String} [req_body_form[].type] 请求参数类型，有["text", "file"]两种
   * @param {String} [req_body_other]  非form类型的请求参数可保存到此字段
   * @param {String}  [res_body_type] 相应信息的数据格式，有["json", "text", "xml"]三种
   * @param {String} [res_body] 响应信息，可填写任意字符串，如果res_body_type是json,则会调用mock功能
   * @param  {String} [desc] 接口描述
   * @returns {Object}
   * @example ./api/interface/up.json
   */
  async up(ctx: AppContext) {
    const params = ctx.params as unknown as RouteParams;

    let id = params.id;
    const loaded = await interfaceService.requireInterface(id);
    if (loaded.ok === false) {
      return (ctx.body = commons.resReturn(null, loaded.code, loaded.message));
    }
    const interfaceData = loaded.data;
    if (!this.$tokenAuth) {
      let auth = await this.checkAuth(interfaceData.project_id, "project", "edit");
      if (!auth) {
        return (ctx.body = commons.resReturn(null, 400, "没有权限"));
      }
    }

    const result = await interfaceService.updateInterface(
      params,
      interfaceData,
      { uid: this.getUid(), username: this.getUsername() },
      { requestOrigin: requestOrigin(ctx) }
    );
    if (result.ok === false) {
      return (ctx.body = commons.resReturn(null, result.code, result.message));
    }
    ctx.body = commons.resReturn(result.data, 0, undefined);
    return 1;
  }

  /**
   * 删除接口
   * @interface /interface/del
   * @method GET
   * @category interface
   * @foldnumber 10
   * @param {Number}   id 接口id，不能为空
   * @returns {Object}
   * @example ./api/interface/del.json
   */

  async del(ctx: AppContext) {
    try {
      let id = ctx.request.body.id;

      if (!id) {
        return (ctx.body = commons.resReturn(null, 400, "接口id不能为空"));
      }

      const loaded = await interfaceService.requireInterface(id, "接口不存在");
      if (loaded.ok === false) {
        return (ctx.body = commons.resReturn(null, loaded.code, loaded.message));
      }
      const data = loaded.data;

      if (data.uid != this.getUid()) {
        let auth = await this.checkAuth(data.project_id, "project", "danger");
        if (!auth) {
          return (ctx.body = commons.resReturn(null, 400, "没有权限"));
        }
      }

      const result = await interfaceService.deleteInterface(id, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      if (result.ok === false) {
        return (ctx.body = commons.resReturn(null, result.code, result.message));
      }
      ctx.body = commons.resReturn(result.data.result, 0, undefined);
    } catch (err) {
      replyException(ctx, err);
    }
  }
  // 处理编辑冲突
  async solveConflict(ctx: AppContext) {
    try {
      const id = parseInt(queryScalar(ctx.query.id), 10);
      if (!id) {
        ctx.websocket?.send("id 参数有误");
        return;
      }
      const result = await interfaceService.checkEditConflict(id, this.getUid());
      if (result.ok === false) {
        ctx.websocket?.send(result.message || "id 参数有误");
        return;
      }
      ctx.websocket?.send(JSON.stringify(result.data));
      ctx.websocket?.on("close", () => {
        interfaceService.releaseEditLock(id);
      });
    } catch (err) {
      commons.log(err, "error");
    }
  }

  async addCat(ctx: AppContext) {
    try {
      let params = ctx.request.body as RouteParams;
      params = commons.handleParams(params as RouteParams, {
        name: "string",
        project_id: "number",
        desc: "string"
      });

      if (!params.project_id) {
        return (ctx.body = commons.resReturn(null, 400, "项目id不能为空"));
      }
      if (!this.$tokenAuth) {
        let auth = await this.checkAuth(routeId(params.project_id), "project", "edit");
        if (!auth) {
          return (ctx.body = commons.resReturn(null, 400, "没有权限"));
        }
      }

      if (!params.name) {
        return (ctx.body = commons.resReturn(null, 400, "名称不能为空"));
      }

      const result = await interfaceService.addCategory({
        name: params.name,
        project_id: params.project_id,
        desc: params.desc,
        uid: this.getUid(),
        username: this.getUsername(),
      });
      if (result.ok === false) {
        return (ctx.body = commons.resReturn(null, result.code, result.message));
      }
      ctx.body = commons.resReturn(result.data, 0, undefined);
    } catch (e) {
      replyException(ctx, e);
    }
  }

  async upCat(ctx: AppContext) {
    try {
      let params = ctx.request.body as RouteParams;
      const catLoaded = await interfaceService.requireCategory(params.catid);
      if (catLoaded.ok === false) {
        return (ctx.body = commons.resReturn(null, catLoaded.code, catLoaded.message));
      }
      const cate = catLoaded.data;

      let auth = await this.checkAuth(cate.project_id, "project", "edit");
      if (!auth) {
        return (ctx.body = commons.resReturn(null, 400, "没有权限"));
      }

      const result = await interfaceService.updateCategory({
        catid: params.catid,
        name: params.name,
        desc: params.desc,
        uid: this.getUid(),
        username: this.getUsername(),
      });
      if (result.ok === false) {
        return (ctx.body = commons.resReturn(null, result.code, result.message));
      }
      ctx.body = commons.resReturn(result.data.result, 0, undefined);
    } catch (e) {
      ctx.body = commons.resReturn(null, 400, e.message);
    }
  }

  async delCat(ctx: AppContext) {
    try {
      let id = ctx.request.body.catid;
      const catLoaded = await interfaceService.requireCategory(id, "不存在的分类");
      if (catLoaded.ok === false) {
        return (ctx.body = commons.resReturn(null, catLoaded.code, catLoaded.message));
      }
      const catData = catLoaded.data;

      if (catData.uid !== this.getUid()) {
        let auth = await this.checkAuth(catData.project_id, "project", "danger");
        if (!auth) {
          return (ctx.body = commons.resReturn(null, 400, "没有权限"));
        }
      }

      const result = await interfaceService.deleteCategory(id, {
        uid: this.getUid(),
        username: this.getUsername(),
      });
      if (result.ok === false) {
        return (ctx.body = commons.resReturn(null, result.code, result.message));
      }
      return replyServiceResult(ctx, result as ServiceResult<unknown>);
    } catch (e) {
      return (ctx.body = commons.resReturn(null, 400, e.message));
    }
  }

  /**
   * 获取分类列表
   * @interface /interface/getCatMenu
   * @method GET
   * @category interface
   * @foldnumber 10
   * @param {Number}   project_id 项目id，不能为空
   * @returns {Object}
   * @example ./api/interface/getCatMenu
   */
  async getCatMenu(ctx: AppContext) {
    const project_id = routeId((ctx.params as unknown as RouteParams).project_id);

    if (!project_id || Number.isNaN(Number(project_id))) {
      return (ctx.body = commons.resReturn(null, 400, "项目id不能为空"));
    }

    try {
      const proj = await interfaceService.getProjectBaseInfo(routeId(project_id));
      if (proj.ok === false) {
        return (ctx.body = commons.resReturn(null, proj.code, proj.message));
      }
      if (proj.data.project_type === "private") {
        if ((await this.checkAuth(proj.data._id, "project", "edit")) !== true) {
          return (ctx.body = commons.resReturn(null, 406, "没有权限"));
        }
      }
      const res = await interfaceService.listCategories(routeId(project_id));
      this._reply(ctx, res as ServiceResult<unknown>);
    } catch (e) {
      return (ctx.body = commons.resReturn(null, 400, e.message));
    }
  }

  /**
   * 获取自定义接口字段数据
   * @interface /interface/get_custom_field
   * @method GET
   * @category interface
   * @foldnumber 10
   * @param {String}   app_code = '111'
   * @returns {Object}
   *
   */
  async getCustomField(ctx: AppContext) {
    try {
      const result = await interfaceService.queryByCustomField(ctx.request.query);
      if (result.ok === false) {
        return (ctx.body = commons.resReturn(null, result.code, result.message));
      }
      return replyServiceResult(ctx, result as ServiceResult<unknown>);
    } catch (e) {
      return (ctx.body = commons.resReturn(null, 400, e.message));
    }
  }

  requiredSort(params) {
    return params.sort((item1, item2) => item2.required - item1.required);
  }

  /**
   * 更新多个接口case index
   * @interface /interface/up_index
   * @method POST
   * @category col
   * @foldnumber 10
   * @param {Array}  [id, index]
   * @returns {Object}
   * @example
   */
  async upIndex(ctx: AppContext) {
    try {
      const result = interfaceService.updateIndexBatch(ctx.request.body);
      if (result.ok === false) {
        return (ctx.body = commons.resReturn(null, result.code, result.message));
      }
      return replyServiceResult(ctx, result as ServiceResult<unknown>);
    } catch (e) {
      ctx.body = commons.resReturn(null, 400, e.message);
    }
  }

  /**
   * 更新多个接口cat index
   * @interface /interface/up_cat_index
   * @method POST
   * @category col
   * @foldnumber 10
   * @param {Array}  [id, index]
   * @returns {Object}
   * @example
   */
  async upCatIndex(ctx: AppContext) {
    try {
      const result = interfaceService.updateCatIndexBatch(ctx.request.body);
      if (result.ok === false) {
        return (ctx.body = commons.resReturn(null, result.code, result.message));
      }
      return replyServiceResult(ctx, result as ServiceResult<unknown>);
    } catch (e) {
      ctx.body = commons.resReturn(null, 400, e.message);
    }
  }

  async schema2json(ctx: AppContext) {
    const schema = ctx.request.body.schema;
    const required = ctx.request.body.required;
    return (ctx.body = interfaceService.schemaToJson(schema, required));
  }

  /**
   * Chrome 插件 / 批量上传接口 JSON
   * POST /api/interface/interUpload  body: { project_id, catid?, data }
   */
  async interUpload(ctx: AppContext) {
    try {
      const params = (ctx.request.body || {}) as RouteParams;
      const project_id = params.project_id;

      if (!project_id) {
        return (ctx.body = commons.resReturn(null, 400, "project_id 不能为空"));
      }

      const auth = await this.checkAuth(routeId(project_id), "project", "edit");
      if (!auth) {
        return (ctx.body = commons.resReturn(null, 40033, "没有权限"));
      }

      const result = await interfaceService.batchUploadInterfaces(
        {
          project_id,
          catid: params.catid,
          raw: params.data || params.json,
        },
        {
          uid: this.getUid(),
          username: this.getUsername(),
          role: this.getRole(),
        }
      );
      if (result.ok === false) {
        return (ctx.body = commons.resReturn(null, result.code, result.message));
      }
      ctx.body = commons.resReturn(result.data, 0, undefined);
    } catch (e) {
      replyException(ctx, e);
    }
  }

  // 获取开放接口数据
  async listByOpen(ctx: AppContext) {
    const project_id = queryScalar(ctx.request.query.project_id);

    if (!project_id) {
      return (ctx.body = commons.resReturn(null, 400, "项目id不能为空"));
    }

    try {
      const loaded = await interfaceService.listOpenByProject(project_id);
      if (loaded.ok === false) {
        return (ctx.body = commons.resReturn(null, loaded.code, loaded.message));
      }
      const project = loaded.data.project;
      if (project.project_type === "private") {
        if ((await this.checkAuth(project._id, "project", "view")) !== true) {
          return (ctx.body = commons.resReturn(null, 406, "没有权限"));
        }
      }
      ctx.body = commons.resReturn(loaded.data.list, 0, undefined);
    } catch (err) {
      replyException(ctx, err);
    }
  }
}

export default interfaceController;
