// @ts-nocheck
/**
 * 分组子模块共享：仓储与类型
 */
import {
  groupRepository,
  projectRepository,
  interfaceRepository,
  interfaceColRepository,
  interfaceCaseRepository,
} from "../../repositories/index.js";

export const repos = {
  groupModel: groupRepository,
  projectModel: projectRepository,
  interfaceModel: interfaceRepository,
  interfaceColModel: interfaceColRepository,
  interfaceCaseModel: interfaceCaseRepository,
};

export type GroupOperator = {
  uid: number | string;
  username: string;
};
