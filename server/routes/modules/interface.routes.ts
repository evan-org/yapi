// @ts-nocheck
/**
 * interface 模块 HTTP 路由
 * 基础路径: /api/interface/
 */
import interfaceController from "../../controllers/interface.js";
import { registerModuleRoutes } from "../register-routes.js";

/** @type {import("../types.js").RouteAction[]} */
const routes = [
  { action: "add", path: "add", method: "post" },
  { action: "getCatMenu", path: "getCatMenu", method: "get" },
  { action: "list", path: "list", method: "get" },
  { action: "get", path: "get", method: "get" },
  { action: "up", path: "up", method: "post" },
  { action: "del", path: "del", method: "post" },
  { action: "interUpload", path: "interUpload", method: "post" },
  { action: "listByCat", path: "list_cat", method: "get" },
  { action: "listByMenu", path: "list_menu", method: "get" },
  { action: "listByOpen", path: "list_open", method: "get" },
  { action: "addCat", path: "add_cat", method: "post" },
  { action: "upCat", path: "up_cat", method: "post" },
  { action: "delCat", path: "del_cat", method: "post" },
  { action: "getCustomField", path: "get_custom_field", method: "get" },
  { action: "save", path: "save", method: "post" },
  { action: "upIndex", path: "up_index", method: "post" },
  { action: "upCatIndex", path: "up_cat_index", method: "post" },
  { action: "schema2json", path: "schema2json", method: "post" },
];

/**
 * 注册 interface 模块路由
 * @param {import("../../lib/bind-routes.js").default} binder
 */
export function registerInterfaceRoutes(binder) {
  registerModuleRoutes(binder, {
    controller: interfaceController,
    prefix: "/interface/",
    routes,
  });
}
