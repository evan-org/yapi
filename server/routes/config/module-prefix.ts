// @ts-nocheck
/**
 * 业务模块与控制器、URL 前缀的映射
 * key 须与 routes/config/api-actions.ts 中的模块名一致
 */
import controllerMap from "../../controllers/index.js";

/** @type {Record<string, { prefix: string, controller: typeof import('../../controllers/base.js').default }>} */
export const MODULE_PREFIX = {
  interface: {
    prefix: "/interface/",
    controller: controllerMap.interface,
  },
  user: {
    prefix: "/user/",
    controller: controllerMap.user,
  },
  group: {
    prefix: "/group/",
    controller: controllerMap.group,
  },
  project: {
    prefix: "/project/",
    controller: controllerMap.project,
  },
  log: {
    prefix: "/log/",
    controller: controllerMap.log,
  },
  follow: {
    prefix: "/follow/",
    controller: controllerMap.follow,
  },
  col: {
    prefix: "/col/",
    controller: controllerMap.col,
  },
  open: {
    prefix: "/open/",
    controller: controllerMap.open,
  },
};
