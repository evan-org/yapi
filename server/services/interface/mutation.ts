// @ts-nocheck
/**
 * 接口模块：增删改、排序、标签同步、编辑锁相关写入
 */
import _ from "underscore";
import fs from "fs-extra";
import path from "path";
import jsondiffpatch from "jsondiffpatch";
import showDiffMsg from "../../utils/diff-view.js";
import { onInterfaceDeleted } from "../advancedMock.service.js";
import yapi from "../../runtime.js";
import commons from "../../utils/commons.js";
import { nowSeconds } from "../../shared/clock.js";
import userService from "../user.service.js";
import notificationService from "../notification.service.js";
import { ok, fail } from "../service-result.js";
import {
  handleHeaders,
  buildQueryPathFromUrl,
  mergeSaveResBody,
} from "../interface.util.js";
import { validateIndexBatchItems } from "../interface.validation.js";
import { repos } from "./shared.js";

const formattersHtml = jsondiffpatch.formatters.html;

const {
  interfaceModel,
  catModel,
  caseModel,
  projectModel,
} = repos;

export function diffNoticeHtml(html) {
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

export async function autoAddTag(params) {
  const tags = params.tag;
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return;
  }
  const projectData = await projectModel.get(params.project_id);
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
    await projectModel.up(params.project_id, {
      tag: tagsInProject,
      up_time: nowSeconds(),
    });
  }
}

export async function deleteInterface(id, { uid, username }) {
  const data = await interfaceModel.get(id);
  if (!data) {
    return fail(400, "接口不存在");
  }
  const result = await interfaceModel.del(id);
  await onInterfaceDeleted(id);
  await caseModel.delByInterfaceId(id);
  const cate = await catModel.get(data.catid);
  if (cate) {
    commons.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 删除了分类 <a href="/project/${cate.project_id}/interface/api/cat_${data.catid}">${cate.name}</a> 下的接口 "${data.title}"`,
      type: "project",
      uid,
      username,
      typeid: cate.project_id,
    });
  }
  await projectModel.up(data.project_id, {
    up_time: new Date().getTime(),
  });
  return ok({ result, data });
}

export function updateIndexBatch(items) {
  const validated = validateIndexBatchItems(items);
  if (!validated.ok) {
    return validated;
  }
  validated.data.forEach((item) => {
    if (item.id) {
      interfaceModel.upIndex(item.id, item.index).then(
        () => {},
        (err) => {
          commons.log(err.message, "error");
        }
      );
    }
  });
  return ok("成功！");
}

export async function updateInterface(
  params,
  interfaceData,
  { uid, username },
  options = {}
) {
  const requestOrigin = options.requestOrigin || "";

  if (!_.isUndefined(params.method)) {
    params.method = String(params.method || "GET").toUpperCase();
  }

  const id = params.id;
  params.message = String(params.message || "").replace(/\n/g, "<br>");

  handleHeaders(params);

  const data = Object.assign(
    {
      up_time: nowSeconds(),
    },
    params
  );

  if (params.path) {
    const { http_path, query_path } = buildQueryPathFromUrl(String(params.path));
    if (!commons.verifyPath(http_path.pathname)) {
      return fail(400, "path第一位必需为 /, 只允许由 字母数字-/_:.! 组成");
    }
    data.query_path = query_path;
  }

  if (
    params.path &&
    (params.path !== interfaceData.path || params.method !== interfaceData.method)
  ) {
    const checkRepeat = await interfaceModel.checkRepeat(
      interfaceData.project_id,
      params.path,
      params.method,
      id
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

  await interfaceModel.up(id, data);
  const CurrentInterfaceData = await interfaceModel.get(id);
  const toObj = (doc) => doc;
  const logData = {
    interface_id: id,
    cat_id: data.catid,
    current: toObj(CurrentInterfaceData),
    old: toObj(interfaceData),
  };

  catModel.get(interfaceData.catid).then((cate) => {
    const diffView2 = showDiffMsg(jsondiffpatch, formattersHtml, logData);
    if (diffView2.length <= 0) {
      return;
    }
    commons.saveLog({
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

  projectModel.up(interfaceData.project_id, { up_time: new Date().getTime() }).then();

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

    const project = await projectModel.getBaseInfo(interfaceData.project_id);
    const interfaceUrl = `${requestOrigin}/project/${interfaceData.project_id}/interface/api/${id}`;

    notificationService.sendNotice(interfaceData.project_id, {
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
        <p>详细改动日志: ${diffNoticeHtml(diffView)}</p></div>
        </body>
        </html>`,
    });
  }

  await autoAddTag(params);
  return ok(CurrentInterfaceData);
}

export async function addInterface(params, { uid, username, role }) {
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
  if (!commons.verifyPath(http_path.pathname)) {
    return fail(400, "path第一位必需为 /, 只允许由 字母数字-/_:.! 组成");
  }

  handleHeaders(params);
  params.query_path = query_path;

  const checkRepeat = await interfaceModel.checkRepeat(
    params.project_id,
    params.path,
    params.method
  );
  if (checkRepeat > 0) {
    return fail(40022, "已存在的接口:" + params.path + "[" + params.method + "]");
  }

  const data = Object.assign(params, {
    uid,
    add_time: nowSeconds(),
    up_time: nowSeconds(),
  });

  commons.handleVarPath(params.path, params.req_params);

  if (params.req_params.length > 0) {
    data.type = "var";
    data.req_params = params.req_params;
  } else {
    data.type = "static";
  }

  if (role !== "admin" && uid !== 999999) {
    const userdata = await userService.getUserdata(uid, "dev");
    const check = await projectModel.checkMemberRepeat(params.project_id, uid);
    if (check === 0 && userdata) {
      await projectModel.addMember(params.project_id, [userdata]);
    }
  }

  const result = await interfaceModel.save(data);
  catModel.get(params.catid).then((cate) => {
    const title = `<a href="/user/profile/${uid}">${username}</a> 为分类 <a href="/project/${params.project_id}/interface/api/cat_${params.catid}">${cate.name}</a> 添加了接口 <a href="/project/${params.project_id}/interface/api/${result._id}">${data.title}</a> `;
    commons.saveLog({
      content: title,
      type: "project",
      uid,
      username,
      typeid: params.project_id,
    });
    projectModel.up(params.project_id, { up_time: new Date().getTime() }).then();
  });

  await autoAddTag(params);
  return ok(result);
}

export async function saveInterface(
  params,
  { uid, username, role },
  options = {}
) {
  const { schemas, requestOrigin } = options;
  if (!schemas) {
    return fail(400, "缺少参数校验 schema");
  }
  const payload = Object.assign({}, params);
  payload.method = (payload.method || "GET").toUpperCase();

  const { http_path } = buildQueryPathFromUrl(payload.path);
  if (!commons.verifyPath(http_path.pathname)) {
    return fail(400, "path第一位必需为 /, 只允许由 字母数字-/_:.! 组成");
  }

  const existing = await interfaceModel.getByPath(
    payload.project_id,
    payload.path,
    payload.method,
    "_id res_body"
  );

  if (existing.length > 0) {
    let lastData = null;
    for (const item of existing) {
      const validParams = Object.assign({}, payload, { id: item._id });
      const validResult = commons.validateParams(schemas.up, validParams);
      if (!validResult.valid) {
        return fail(400, validResult.message);
      }
      if (payload.res_body !== undefined) {
        validParams.res_body = mergeSaveResBody(payload, item);
      }
      const iface = await interfaceModel.get(item._id);
      const upResult = await updateInterface(
        validParams,
        iface,
        { uid, username },
        { requestOrigin }
      );
      if (!upResult.ok) {
        return upResult;
      }
      lastData = upResult.data;
    }
    return ok(lastData);
  }

  const validResult = commons.validateParams(schemas.add, payload);
  if (!validResult.valid) {
    return fail(400, validResult.message);
  }
  return addInterface(payload, { uid, username, role });
}
