// @ts-nocheck
/**
 * 项目 Wiki 业务逻辑
 */
import fs from "fs-extra";
import path from "node:path";
import jsondiffpatch from "jsondiffpatch";
import yapi from "../runtime.js";
import notificationService from "./notification.service.js";
import {
  wikiRepository,
  projectRepository,
  userRepository,
} from "../repositories/index.js";
import showDiffMsg from "../utils/diff-view.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";

const formattersHtml = jsondiffpatch.formatters.html;

type WikiSaveParams = {
  project_id: number;
  desc?: string;
  markdown?: string;
  email_notice?: boolean;
};

type WikiSaveContext = {
  username: string;
  uid: number;
  wikiUrl: string;
};

class WikiService extends BaseService {
  wikiModel = wikiRepository;
  projectModel = projectRepository;
  userModel = userRepository;

  async getByProjectId(projectId: number | string | undefined | null) {
    if (!projectId) {
      return fail(400, "项目id不能为空");
    }
    const result = await this.wikiModel.get(projectId);
    return ok(result);
  }

  async save(params: WikiSaveParams, ctx: WikiSaveContext) {
    if (!params.project_id) {
      return fail(400, "项目id不能为空");
    }

    const notice = params.email_notice;
    const { username, uid, wikiUrl } = ctx;
    const saveParams = { ...params };
    delete saveParams.email_notice;

    const existing = await this.wikiModel.get(params.project_id);
    let result;

    if (!existing) {
      const data = {
        ...saveParams,
        username,
        uid,
        add_time: yapi.commons.time(),
        up_time: yapi.commons.time(),
      };
      result = await this.wikiModel.save(data);
    } else {
      const data = {
        ...saveParams,
        username,
        uid,
        up_time: yapi.commons.time(),
      };
      result = await this.wikiModel.up(existing._id, data);
    }

    const logData = {
      type: "wiki",
      project_id: params.project_id,
      current: params.desc,
      old: existing ? existing.desc : "",
    };

    if (notice) {
      await this.sendWikiNotice(params.project_id, username, wikiUrl, logData);
    }

    notificationService.saveLog({
      content: `<a href="/user/profile/${uid}">${username}</a> 更新了 <a href="${wikiUrl}">wiki</a> 的信息`,
      type: "project",
      uid,
      username,
      typeid: params.project_id,
      data: logData,
    });

    return ok(result);
  }

  /** Wiki 编辑冲突：连接开始 */
  async onWsStart(wikiId: number, currentUid: number) {
    const result = await this.wikiModel.get(wikiId);
    if (result && result.edit_uid === currentUid) {
      await this.wikiModel.upEditUid(result._id, 0);
    }
    return ok(null);
  }

  /** Wiki 编辑冲突：连接结束 */
  async onWsEnd(wikiId: number) {
    const result = await this.wikiModel.get(wikiId);
    if (result) {
      await this.wikiModel.upEditUid(result._id, 0);
    }
    return ok(null);
  }

  /** Wiki 编辑冲突：正在编辑 */
  async onWsEditor(wikiId: number, currentUid: number) {
    const result = await this.wikiModel.get(wikiId);
    if (result && result.edit_uid !== 0 && result.edit_uid !== currentUid) {
      const userinfo = await this.userModel.findById(result.edit_uid);
      return ok({
        errno: result.edit_uid,
        data: { uid: result.edit_uid, username: userinfo?.username },
      });
    }
    if (result) {
      await this.wikiModel.upEditUid(result._id, currentUid);
    }
    return ok({ errno: 0, data: result });
  }

  private async sendWikiNotice(
    projectId: number,
    username: string,
    wikiUrl: string,
    logData: Record<string, unknown>
  ) {
    const diffView = showDiffMsg(jsondiffpatch, formattersHtml, logData);
    const annotatedCss = fs.readFileSync(
      path.resolve(
        yapi.WEBROOT,
        "node_modules/jsondiffpatch/dist/formatters-styles/annotated.css"
      ),
      "utf8"
    );
    const htmlCss = fs.readFileSync(
      path.resolve(
        yapi.WEBROOT,
        "node_modules/jsondiffpatch/dist/formatters-styles/html.css"
      ),
      "utf8"
    );
    const project = await this.projectModel.getBaseInfo(projectId);

    notificationService.sendNotice(projectId, {
      title: `${username} 更新了wiki说明`,
      content: `<html>
          <head>
          <meta charset="utf-8" />
          <style>
          ${annotatedCss}
          ${htmlCss}
          </style>
          </head>
          <body>
          <div><h3>${username}更新了wiki说明</h3>
          <p>修改用户: ${username}</p>
          <p>修改项目: <a href="${wikiUrl}">${project.name}</a></p>
          <p>详细改动日志: ${this.diffHTML(diffView)}</p></div>
          </body>
          </html>`,
    });
  }

  private diffHTML(html: Array<{ title: string; content: string }>) {
    if (html.length === 0) {
      return '<span style="color: #555">没有改动，该操作未改动wiki数据</span>';
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
}

export default new WikiService();
