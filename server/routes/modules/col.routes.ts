// @ts-nocheck
/**
 * col 模块 HTTP 路由
 * 基础路径: /api/col/
 */
import interfaceColController from "../../controllers/interfaceCol.js";
import { registerModuleRoutes } from "../register-routes.js";

/** @type {import("../types.js").RouteAction[]} */
const routes = [
  { action: "addCol", path: "add_col", method: "post" },
  { action: "addCaseList", path: "add_case_list", method: "post" },
  { action: "cloneCaseList", path: "clone_case_list", method: "post" },
  { action: "list", path: "list", method: "get" },
  { action: "getCaseList", path: "case_list", method: "get" },
  { action: "getCaseListByVariableParams", path: "case_list_by_var_params", method: "get" },
  { action: "addCase", path: "add_case", method: "post" },
  { action: "upCase", path: "up_case", method: "post" },
  { action: "getCase", path: "case", method: "get" },
  { action: "upCol", path: "up_col", method: "post" },
  { action: "upCaseIndex", path: "up_case_index", method: "post" },
  { action: "upColIndex", path: "up_col_index", method: "post" },
  { action: "delCol", path: "del_col", method: "get" },
  { action: "delCase", path: "del_case", method: "get" },
  { action: "runCaseScript", path: "run_script", method: "post" },
  { action: "getCaseEnvList", path: "case_env_list", method: "get" },
];

/**
 * 注册 col 模块路由
 * @param {import("../../lib/bind-routes.js").default} binder
 */
export function registerColRoutes(binder) {
  registerModuleRoutes(binder, {
    controller: interfaceColController,
    prefix: "/col/",
    routes,
  });
}
