/**
 * 测试用例（interface_case）数据仓储
 */
import { createModelRepository, type ModelInstance } from "./base.repo.js";

import InterfaceCaseModel from "../models/interfaceCase.js";

export type InterfaceCaseRepository = ModelInstance;

export const interfaceCaseRepository =
  createModelRepository<InterfaceCaseRepository>(InterfaceCaseModel);
