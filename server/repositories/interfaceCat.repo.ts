/**
 * 接口分类（interface_cat）数据仓储
 */
import { createModelRepository, type ModelInstance } from "./base.repo.js";

import InterfaceCatModel from "../models/interfaceCat.js";

export type InterfaceCatRepository = ModelInstance;

export const interfaceCatRepository =
  createModelRepository<InterfaceCatRepository>(InterfaceCatModel);
