// @ts-nocheck
/**
 * group 模块 HTTP 路由
 * 基础路径: /api/group/
 */
import groupController from "../../controllers/group.js";
import { registerModuleRoutes } from "../register-routes.js";

/** @type {import("../types.js").RouteAction[]} */
const routes = [
  { action: "getMyGroup", path: "get_mygroup", method: "get" },
  { action: "list", path: "list", method: "get" },
  { action: "add", path: "add", method: "post" },
  { action: "up", path: "up", method: "post" },
  { action: "del", path: "del", method: "post" },
  { action: "addMember", path: "add_member", method: "post" },
  { action: "changeMemberRole", path: "change_member_role", method: "post" },
  { action: "delMember", path: "del_member", method: "post" },
  { action: "getMemberList", path: "get_member_list", method: "get" },
  { action: "get", path: "get", method: "get" },
];

/**
 * 注册 group 模块路由
 * @param {import("../../lib/bind-routes.js").default} binder
 */
export function registerGroupRoutes(binder) {
  registerModuleRoutes(binder, {
    controller: groupController,
    prefix: "/group/",
    routes,
  });
}
