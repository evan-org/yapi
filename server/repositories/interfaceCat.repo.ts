/**
 * 接口分类（interface_cat）数据仓储
 */
import { createModelRepository, type LegacyModelInstance } from "./base.repo";

import InterfaceCatModel from "../models/interfaceCat.js";

export type InterfaceCatRepository = LegacyModelInstance;

export const interfaceCatRepository =
  createModelRepository<InterfaceCatRepository>(InterfaceCatModel);
