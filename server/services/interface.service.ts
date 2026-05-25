// @ts-nocheck
/**
 * 接口模块业务逻辑（查询、增删改、自定义字段、开放列表、Schema 转换等）
 */
import _ from "underscore";
import url from "url";
import fs from "fs-extra";
import path from "path";
import jsondiffpatch from "jsondiffpatch";
import showDiffMsg from "../common/diff-view.js";
import yapi from "../runtime.js";

const formattersHtml = jsondiffpatch.formatters.html;

/**
 * 根据请求体类型补全 Content-Type 请求头
 */
export function handleHeaders(values) {
  let isfile = false,
    isHaveContentType = false;
  if (values.req_body_type === "form") {
    values.req_body_form.forEach((item) => {
      if (item.type === "file") {
        isfile = true;
      }
    });

    values.req_headers.map((item) => {
      if (item.name === "Content-Type") {
        item.value = isfile ? "multipart/form-data" : "application/x-www-form-urlencoded";
        isHaveContentType = true;
      }
    });
    if (isHaveContentType === false) {
      values.req_headers.unshift({
        name: "Content-Type",
        value: isfile ? "multipart/form-data" : "application/x-www-form-urlencoded",
      });
    }
  } else if (values.req_body_type === "json") {
    values.req_headers
      ? values.req_headers.map((item) => {
          if (item.name === "Content-Type") {
            item.value = "application/json";
            isHaveContentType = true;
          }
        })
      : [];
    if (isHaveContentType === false) {
      values.req_headers = values.req_headers || [];
      values.req_headers.unshift({
        name: "Content-Type",
        value: "application/json",
      });
    }
  }
}

/**
 * 从 path 解析 query_path（pathname + query 参数列表）
 */
export function buildQueryPathFromUrl(pathStr) {
  const http_path = url.parse(pathStr, true);
  const query_path = {
    path: http_path.pathname,
    params: [],
  };
  Object.keys(http_path.query).forEach((item) => {
    query_path.params.push({
      name: item,
      value: http_path.query[item],
    });
  });
  return { http_path, query_path };
}

/**
 * 列表查询 option 附加 status / tag 过滤
 */
export function applyStatusTagFilter(option, status, tag) {
  if (status) {
    option.status = Array.isArray(status) ? { $in: status } : status;
  }
  if (tag) {
    option.tag = Array.isArray(tag) ? { $in: tag } : tag;
  }
  return option;
}
import {
  interfaceRepository,
  interfaceCatRepository,
  interfaceCaseRepository,
  groupRepository,
  projectRepository,
  userRepository,
} from "../repositories/index.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";

class InterfaceService extends BaseService {
  constructor() {
    super();
    this.interfaceModel = interfaceRepository;
    this.catModel = interfaceCatRepository;
    this.caseModel = interfaceCaseRepository;
    this.groupModel = groupRepository;
    this.projectModel = projectRepository;
    this.userModel = userRepository;
  }

  /**
   * 项目基础信息（侧栏/列表鉴权）
   */
  async getProjectBaseInfo(projectId) {
    const project = await this.projectModel.getBaseInfo(projectId);
    if (!project) {
      return fail(406, "不存在的项目");
    }
    return ok(project);
  }

  /**
   * 侧栏菜单：分类 + 接口列表（并行加载）
   */
  async listMenuByProject(projectId) {
    const categories = await this.catModel.list(projectId);
    const newResult = await Promise.all(
      categories.map(async (catRow) => {
        const item = catRow.toObject();
        let list = await this.interfaceModel.listByCatid(item._id);
        item.list = list.map((row) => row.toObject());
        return item;
      })
    );
    return ok(newResult);
  }

  /**
   * 分类菜单列表
   */
  async listCategories(projectId) {
    const res = await this.catModel.list(projectId);
    return ok(res);
  }

  /**
   * 更新接口分类
   */
  async updateCategory({ catid, name, desc, uid, username }) {
    const cate = await this.catModel.get(catid);
    if (!cate) {
      return fail(400, "分类不存在");
    }
    const result = await this.catModel.up(catid, {
      name,
      desc,
      up_time: yapi.commons.time(),
    });
    yapi.commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 更新了分类 <a href="/project/${cate.project_id}/interface/api/cat_${catid}">${cate.name}</a>`,
      type: "project",
      uid,
      username,
      typeid: cate.project_id,
    });
    return ok({ result, project_id: cate.project_id });
  }

  /**
   * 接口详情（不含权限；controller 负责鉴权与 username）
   */
  async getById(id) {
    const result = await this.interfaceModel.get(id);
    if (!result) {
      return fail(490, "不存在的");
    }
    const data = result.toObject();
    const userinfo = await this.userModel.findById(result.uid);
    if (userinfo) {
      data.username = userinfo.username;
    }
    return ok(data);
  }

  /**
   * JSON Schema 转 mock JSON
   */
  schemaToJson(schema, required) {
    return yapi.commons.schemaToJson(schema, {
      alwaysFakeOptionals: _.isUndefined(required) ? true : required,
    });
  }

  /**
   * 自定义字段查询
   */
  async queryByCustomField(queryParams) {
    const keys = Object.keys(queryParams || {});
    if (keys.length !== 1) {
      return fail(400, "参数数量错误");
    }
    const customFieldName = keys[0];
    const customFieldValue = queryParams[customFieldName];

    const groups = await this.groupModel.getcustomFieldName(customFieldName);
    if (groups.length === 0) {
      return fail(404, "没有找到对应自定义接口");
    }

    const interfaces = [];
    for (let i = 0; i < groups.length; i++) {
      const projects = await this.projectModel.list(groups[i]._id);
      for (let j = 0; j < projects.length; j++) {
        let inter = await this.interfaceModel.getcustomFieldValue(
          projects[j]._id,
          customFieldValue
        );
        if (inter.length > 0) {
          inter = inter.map((item) => {
            const row = item.toObject();
            row.res_body = yapi.commons.json_parse(row.res_body);
            row.req_body_other = yapi.commons.json_parse(row.req_body_other);
            return row;
          });
          interfaces.push({
            project_name: projects[j].name,
            project_id: projects[j]._id,
            list: inter,
          });
        }
      }
    }
    return ok(interfaces);
  }

  /**
   * 开放状态接口列表（按分类聚合，并行查询）
   */
  async listOpenByProject(projectId) {
    const project = await this.projectModel.getBaseInfo(projectId);
    if (!project) {
      return fail(406, "不存在的项目");
    }

    const basepath = project.basepath;
    const categories = await this.catModel.list(projectId);
    const chunks = await Promise.all(
      categories.map(async (catRow) => {
        const cat = catRow.toObject();
        let list = await this.interfaceModel.listByInterStatus(cat._id, "open");
        return list.map((row) => {
          const item = row.toObject();
          item.basepath = basepath;
          return item;
        });
      })
    );

    return ok({ project, list: chunks.flat() });
  }

  /**
   * 删除接口及关联用例
   */
  async deleteInterface(id, { uid, username }) {
    const data = await this.interfaceModel.get(id);
    if (!data) {
      return fail(400, "接口不存在");
    }
    const result = await this.interfaceModel.del(id);
    yapi.emitHook("interface_del", id).then();
    await this.caseModel.delByInterfaceId(id);
    const cate = await this.catModel.get(data.catid);
    if (cate) {
      yapi.commons.saveLog({
        content: `<a href="/user/profile/${uid}">${username}</a> 删除了分类 <a href="/project/${cate.project_id}/interface/api/cat_${data.catid}">${cate.name}</a> 下的接口 "${data.title}"`,
        type: "project",
        uid,
        username,
        typeid: cate.project_id,
      });
    }
    await this.projectModel.up(data.project_id, {
      up_time: new Date().getTime(),
    });
    return ok({ result, data });
  }

  /**
   * 删除分类及下属接口
   */
  async deleteCategory(catId, { uid, username }) {
    const catData = await this.catModel.get(catId);
    if (!catData) {
      return fail(400, "不存在的分类");
    }
    yapi.commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 删除了分类 "${catData.name}" 及该分类下的接口`,
      type: "project",
      uid,
      username,
      typeid: catData.project_id,
    });
    const interfaceData = await this.interfaceModel.listByCatid(catId);
    for (const item of interfaceData) {
      try {
        yapi.emitHook("interface_del", item._id).then();
        await this.caseModel.delByInterfaceId(item._id);
      } catch (e) {
        yapi.commons.log(e.message, "error");
      }
    }
    await this.catModel.del(catId);
    const r = await this.interfaceModel.delByCatid(catId);
    return ok(r);
  }

  /**
   * 新增接口分类
   */
  async addCategory({ name, project_id, desc, uid, username }) {
    if (!project_id) {
      return fail(400, "项目id不能为空");
    }
    if (!name) {
      return fail(400, "名称不能为空");
    }
    const result = await this.catModel.save({
      name,
      project_id,
      desc,
      uid,
      add_time: yapi.commons.time(),
      up_time: yapi.commons.time(),
    });
    yapi.commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 添加了分类  <a href="/project/${project_id}/interface/api/cat_${result._id}">${name}</a>`,
      type: "project",
      uid,
      username,
      typeid: project_id,
    });
    return ok(result);
  }

  /**
   * 项目接口分页列表
   */
  async listByProject({ project_id, page, limit, status, tag }) {
    if (!project_id) {
      return fail(400, "项目id不能为空");
    }
    const project = await this.projectModel.getBaseInfo(project_id);
    if (!project) {
      return fail(407, "不存在的项目");
    }

    let result;
    let count;
    if (limit === "all") {
      result = await this.interfaceModel.list(project_id);
      count = await this.interfaceModel.listCount({ project_id });
    } else {
      const option = applyStatusTagFilter({ project_id }, status, tag);
      result = await this.interfaceModel.listByOptionWithPage(option, page, limit);
      count = await this.interfaceModel.listCount(option);
    }

    yapi.emitHook("interface_list", result).then();
    return ok({
      count,
      total: Math.ceil(count / limit),
      list: result,
    });
  }

  /**
   * 分类下接口分页列表
   */
  async listByCategory({ catid, page, limit, status, tag }) {
    if (!catid) {
      return fail(400, "catid不能为空");
    }
    const catdata = await this.catModel.get(catid);
    if (!catdata) {
      return fail(400, "分类不存在");
    }
    const project = await this.projectModel.getBaseInfo(catdata.project_id);
    if (!project) {
      return fail(407, "不存在的项目");
    }

    const option = applyStatusTagFilter({ catid }, status, tag);
    const result = await this.interfaceModel.listByOptionWithPage(option, page, limit);
    const count = await this.interfaceModel.listCount(option);
    return ok({
      count,
      total: Math.ceil(count / limit),
      list: result,
      project,
    });
  }

  /**
   * 批量更新接口排序 index
   */
  updateIndexBatch(items) {
    if (!items || !Array.isArray(items)) {
      return fail(400, "请求参数必须是数组");
    }
    items.forEach((item) => {
      if (item.id) {
        this.interfaceModel.upIndex(item.id, item.index).then(
          () => {},
          (err) => {
            yapi.commons.log(err.message, "error");
          }
        );
      }
    });
    return ok("成功！");
  }

  /**
   * 批量更新分类排序 index
   */
  updateCatIndexBatch(items) {
    if (!items || !Array.isArray(items)) {
      return fail(400, "请求参数必须是数组");
    }
    items.forEach((item) => {
      if (item.id) {
        this.catModel.upCatIndex(item.id, item.index).then(
          () => {},
          (err) => {
            yapi.commons.log(err.message, "error");
          }
        );
      }
    });
    return ok("成功！");
  }

  /**
   * 将接口文档中的 tag 同步到项目 tag 列表
   */
  async autoAddTag(params) {
    const tags = params.tag;
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return;
    }
    const projectData = await this.projectModel.get(params.project_id);
    let tagsInProject = projectData.tag;
    let needUpdate = false;
    if (tagsInProject && Array.isArray(tagsInProject) && tagsInProject.length > 0) {
      tags.forEach((tag) => {
        if (!_.find(tagsInProject, (item) => item.name === tag)) {
          needUpdate = true;
          tagsInProject.push({
            name: tag,
            desc: tag,
          });
        }
      });
    } else {
      needUpdate = true;
      tagsInProject = [];
      tags.forEach((tag) => {
        tagsInProject.push({
          name: tag,
          desc: tag,
        });
      });
    }
    if (needUpdate) {
      await this.projectModel.up(params.project_id, {
        tag: tagsInProject,
        up_time: yapi.commons.time(),
      });
    }
  }

  /**
   * 新增接口（不含权限校验；controller 负责鉴权）
   */
  async addInterface(params, { uid, username, role }) {
    params.method = params.method || "GET";
    params.res_body_is_json_schema = _.isUndefined(params.res_body_is_json_schema)
      ? false
      : params.res_body_is_json_schema;
    params.req_body_is_json_schema = _.isUndefined(params.req_body_is_json_schema)
      ? false
      : params.req_body_is_json_schema;
    params.method = params.method.toUpperCase();
    params.req_params = params.req_params || [];
    params.res_body_type = params.res_body_type ? params.res_body_type.toLowerCase() : "json";

    const { http_path, query_path } = buildQueryPathFromUrl(params.path);
    if (!yapi.commons.verifyPath(http_path.pathname)) {
      return fail(400, "path第一位必需为 /, 只允许由 字母数字-/_:.! 组成");
    }

    handleHeaders(params);
    params.query_path = query_path;

    const checkRepeat = await this.interfaceModel.checkRepeat(
      params.project_id,
      params.path,
      params.method
    );
    if (checkRepeat > 0) {
      return fail(40022, "已存在的接口:" + params.path + "[" + params.method + "]");
    }

    const data = Object.assign(params, {
      uid,
      add_time: yapi.commons.time(),
      up_time: yapi.commons.time(),
    });

    yapi.commons.handleVarPath(params.path, params.req_params);

    if (params.req_params.length > 0) {
      data.type = "var";
      data.req_params = params.req_params;
    } else {
      data.type = "static";
    }

    if (role !== "admin" && uid !== 999999) {
      const userdata = await yapi.commons.getUserdata(uid, "dev");
      const check = await this.projectModel.checkMemberRepeat(params.project_id, uid);
      if (check === 0 && userdata) {
        await this.projectModel.addMember(params.project_id, [userdata]);
      }
    }

    const result = await this.interfaceModel.save(data);
    yapi.emitHook("interface_add", result).then();
    this.catModel.get(params.catid).then((cate) => {
      const title = `<a href="/user/profile/${uid}">${username}</a> 为分类 <a href="/project/${params.project_id}/interface/api/cat_${params.catid}">${cate.name}</a> 添加了接口 <a href="/project/${params.project_id}/interface/api/${result._id}">${data.title}</a> `;
      yapi.commons.saveLog({
        content: title,
        type: "project",
        uid,
        username,
        typeid: params.project_id,
      });
      this.projectModel.up(params.project_id, { up_time: new Date().getTime() }).then();
    });

    await this.autoAddTag(params);
    return ok(result);
  }

  /**
   * diff 邮件 HTML 片段
   */
  diffNoticeHtml(html) {
    if (html.length === 0) {
      return '<span style="color: #555">没有改动，该操作未改动Api数据</span>';
    }
    return html
      .map(
        (item) => `<div>
      <h4 class="title">${item.title}</h4>
      <div>${item.content}</div>
    </div>`
      )
      .join("");
  }

  /**
   * 更新接口（不含权限校验；interfaceData 为更新前文档）
   */
  async updateInterface(params, interfaceData, { uid, username }, options = {}) {
    const requestOrigin = options.requestOrigin || "";

    if (!_.isUndefined(params.method)) {
      params.method = params.method || "GET";
      params.method = params.method.toUpperCase();
    }

    const id = params.id;
    params.message = params.message || "";
    params.message = params.message.replace(/\n/g, "<br>");

    handleHeaders(params);

    const data = Object.assign(
      {
        up_time: yapi.commons.time(),
      },
      params
    );

    if (params.path) {
      const { http_path, query_path } = buildQueryPathFromUrl(params.path);
      if (!yapi.commons.verifyPath(http_path.pathname)) {
        return fail(400, "path第一位必需为 /, 只允许由 字母数字-/_:.! 组成");
      }
      data.query_path = query_path;
    }

    if (
      params.path &&
      (params.path !== interfaceData.path || params.method !== interfaceData.method)
    ) {
      const checkRepeat = await this.interfaceModel.checkRepeat(
        interfaceData.project_id,
        params.path,
        params.method
      );
      if (checkRepeat > 0) {
        return fail(401, "已存在的接口:" + params.path + "[" + params.method + "]");
      }
    }

    if (!_.isUndefined(data.req_params)) {
      if (Array.isArray(data.req_params) && data.req_params.length > 0) {
        data.type = "var";
      } else {
        data.type = "static";
        data.req_params = [];
      }
    }

    const result = await this.interfaceModel.up(id, data);
    const CurrentInterfaceData = await this.interfaceModel.get(id);
    const toObj = (doc) =>
      doc && typeof doc.toObject === "function" ? doc.toObject() : doc;
    const logData = {
      interface_id: id,
      cat_id: data.catid,
      current: toObj(CurrentInterfaceData),
      old: toObj(interfaceData),
    };

    this.catModel.get(interfaceData.catid).then((cate) => {
      const diffView2 = showDiffMsg(jsondiffpatch, formattersHtml, logData);
      if (diffView2.length <= 0) {
        return;
      }
      yapi.commons.saveLog({
        content: `<a href="/user/profile/${uid}">${username}</a> 
                    更新了分类 <a href="/project/${cate.project_id}/interface/api/cat_${
          data.catid
        }">${cate.name}</a> 
                    下的接口 <a href="/project/${cate.project_id}/interface/api/${id}">${
          interfaceData.title
        }</a><p>${params.message}</p>`,
        type: "project",
        uid,
        username,
        typeid: cate.project_id,
        data: logData,
      });
    });

    this.projectModel.up(interfaceData.project_id, { up_time: new Date().getTime() }).then();

    if (params.switch_notice === true) {
      const diffView = showDiffMsg(jsondiffpatch, formattersHtml, logData);
      const annotatedCss = fs.readFileSync(
        path.resolve(
          yapi.WEBROOT,
          "node_modules/jsondiffpatch/dist/formatters-styles/annotated.css"
        ),
        "utf8"
      );
      const htmlCss = fs.readFileSync(
        path.resolve(yapi.WEBROOT, "node_modules/jsondiffpatch/dist/formatters-styles/html.css"),
        "utf8"
      );

      const project = await this.projectModel.getBaseInfo(interfaceData.project_id);
      const interfaceUrl = `${requestOrigin}/project/${interfaceData.project_id}/interface/api/${id}`;

      yapi.commons.sendNotice(interfaceData.project_id, {
        title: `${username} 更新了接口`,
        content: `<html>
        <head>
        <style>
        ${annotatedCss}
        ${htmlCss}
        </style>
        </head>
        <body>
        <div><h3>${username}更新了接口(${data.title})</h3>
        <p>项目名：${project.name} </p>
        <p>修改用户: ${username}</p>
        <p>接口名: <a href="${interfaceUrl}">${data.title}</a></p>
        <p>接口路径: [${data.method}]${data.path}</p>
        <p>详细改动日志: ${this.diffNoticeHtml(diffView)}</p></div>
        </body>
        </html>`,
      });
    }

    yapi.emitHook("interface_update", id).then();
    await this.autoAddTag(params);
    return ok(result);
  }
}

export default new InterfaceService();
