/**
 * 接口（interface）数据仓储
 */
import { createModelRepository, type LegacyModelInstance } from "./base.repo";

const InterfaceModel = require("../models/interface.js");

export type InterfaceRepository = LegacyModelInstance;

/** 接口集合仓储单例 */
export const interfaceRepository =
  createModelRepository<InterfaceRepository>(InterfaceModel);
