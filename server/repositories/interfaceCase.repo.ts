/**
 * 测试用例（interface_case）数据仓储
 */
import { createModelRepository, type LegacyModelInstance } from "./base.repo.js";

import InterfaceCaseModel from "../models/interfaceCase.js";

export type InterfaceCaseRepository = LegacyModelInstance;

export const interfaceCaseRepository =
  createModelRepository<InterfaceCaseRepository>(InterfaceCaseModel);
