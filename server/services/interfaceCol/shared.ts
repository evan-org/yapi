// @ts-nocheck
/**
 * 测试集合子模块共享：仓储引用
 */
import {
  interfaceColRepository,
  interfaceCaseRepository,
  interfaceRepository,
  projectRepository,
} from "../../repositories/index.js";

export const repos = {
  colModel: interfaceColRepository,
  caseModel: interfaceCaseRepository,
  interfaceModel: interfaceRepository,
  projectModel: projectRepository,
};
