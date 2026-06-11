// @ts-nocheck
/**
 * Wiki 模块：变更通知与 diff 展示
 */
import fs from "fs-extra";
import path from "node:path";
import jsondiffpatch from "jsondiffpatch";
import yapi from "../../runtime.js";
import showDiffMsg from "../../utils/diff-view.js";
import notificationService from "../notification.service.js";
import { repos } from "./shared.js";

const formattersHtml = jsondiffpatch.formatters.html;
const { projectModel } = repos;

export function diffHTML(html: Array<{ title: string; content: string }>) {
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

export async function sendWikiNotice(
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
  const project = await projectModel.getBaseInfo(projectId);

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
          <p>详细改动日志: ${diffHTML(diffView)}</p></div>
          </body>
          </html>`,
  });
}
