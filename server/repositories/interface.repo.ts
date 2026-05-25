/**
 * 接口（interface）数据仓储
 */
import { createModelRepository, type ModelInstance } from "./base.repo.js";

import InterfaceModel from "../models/interface.js";

export type InterfaceRepository = ModelInstance;

/** 接口集合仓储单例 */
export const interfaceRepository =
  createModelRepository<InterfaceRepository>(InterfaceModel);
