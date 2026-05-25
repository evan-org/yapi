/**
 * 测试集合（interface_col）数据仓储
 */
import { createModelRepository, type ModelInstance } from "./base.repo.js";

import InterfaceColModel from "../models/interfaceCol.js";

export type InterfaceColRepository = ModelInstance;

export const interfaceColRepository =
  createModelRepository<InterfaceColRepository>(InterfaceColModel);
