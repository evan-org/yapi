// @ts-nocheck
/**
 * project 模块 HTTP 路由
 * 基础路径: /api/project/
 */
import projectController from "../../controllers/project.js";
import { registerModuleRoutes } from "../register-routes.js";

/** @type {import("../types.js").RouteAction[]} */
const routes = [
  { action: "upSet", path: "upset", method: "post" },
  { action: "getEnv", path: "get_env", method: "get" },
  { action: "add", path: "add", method: "post" },
  { action: "list", path: "list", method: "get" },
  { action: "get", path: "get", method: "get" },
  { action: "up", path: "up", method: "post" },
  { action: "del", path: "del", method: "post" },
  { action: "addMember", path: "add_member", method: "post" },
  { action: "delMember", path: "del_member", method: "post" },
  { action: "changeMemberRole", path: "change_member_role", method: "post" },
  { action: "changeMemberEmailNotice", path: "change_member_email_notice", method: "post" },
  { action: "getMemberList", path: "get_member_list", method: "get" },
  { action: "search", path: "search", method: "get" },
  { action: "upEnv", path: "up_env", method: "post" },
  { action: "upTag", path: "up_tag", method: "post" },
  { action: "token", path: "token", method: "get" },
  { action: "updateToken", path: "update_token", method: "get" },
  { action: "checkProjectName", path: "check_project_name", method: "get" },
  { action: "copy", path: "copy", method: "post" },
  { action: "swaggerUrl", path: "swagger_url", method: "get" },
];

/**
 * 注册 project 模块路由
 * @param {import("../../lib/bind-routes.js").default} binder
 */
export function registerProjectRoutes(binder) {
  registerModuleRoutes(binder, {
    controller: projectController,
    prefix: "/project/",
    routes,
  });
}
