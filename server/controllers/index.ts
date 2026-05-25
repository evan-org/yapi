// @ts-nocheck
/**
 * HTTP 控制器层（/api 路由处理）
 * 各控制器继承 baseController，在 router.ts 中注册 action 与 path
 */
import baseController from "./base.js";
import interfaceController from "./interface.js";
import userController from "./user.js";
import groupController from "./group.js";
import projectController from "./project.js";
import logController from "./log.js";
import followController from "./follow.js";
import interfaceColController from "./interfaceCol.js";
import testController from "./test.js";
import openController from "./open.js";

/** 与 router.ts 中 INTERFACE_CONFIG 的 key 一致 */
export const controllerMap = {
  interface: interfaceController,
  user: userController,
  group: groupController,
  project: projectController,
  log: logController,
  follow: followController,
  col: interfaceColController,
  test: testController,
  open: openController,
};

export {
  baseController,
  interfaceController,
  userController,
  groupController,
  projectController,
  logController,
  followController,
  interfaceColController,
  testController,
  openController,
};

export default controllerMap;
