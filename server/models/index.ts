// @ts-nocheck
/**
 * 数据模型层（Mongoose）
 * 所有业务 Model 继承 baseModel，通过 yapi.getInst(ModelClass) 获取单例实例
 */
import baseModel from "./base.js";
import userModel from "./user.js";
import projectModel from "./project.js";
import groupModel from "./group.js";
import interfaceModel from "./interface.js";
import interfaceCatModel from "./interfaceCat.js";
import interfaceCaseModel from "./interfaceCase.js";
import interfaceColModel from "./interfaceCol.js";
import followModel from "./follow.js";
import logModel from "./log.js";
import tokenModel from "./token.js";
import avatarModel from "./avatar.js";
import storageModel from "./storage.js";

/** 按业务域聚合的 Model 类（供控制器、插件统一引用） */
export const modelMap = {
  base: baseModel,
  user: userModel,
  project: projectModel,
  group: groupModel,
  interface: interfaceModel,
  interfaceCat: interfaceCatModel,
  interfaceCase: interfaceCaseModel,
  interfaceCol: interfaceColModel,
  follow: followModel,
  log: logModel,
  token: tokenModel,
  avatar: avatarModel,
  storage: storageModel,
};

export {
  baseModel,
  userModel,
  projectModel,
  groupModel,
  interfaceModel,
  interfaceCatModel,
  interfaceCaseModel,
  interfaceColModel,
  followModel,
  logModel,
  tokenModel,
  avatarModel,
  storageModel,
};

export default modelMap;
