// @ts-nocheck
/**
 * 接口子模块共享：仓储引用与类型
 */
import {
  interfaceRepository,
  interfaceCatRepository,
  interfaceCaseRepository,
  groupRepository,
  projectRepository,
  userRepository,
} from "../../repositories/index.js";

export const repos = {
  interfaceModel: interfaceRepository,
  catModel: interfaceCatRepository,
  caseModel: interfaceCaseRepository,
  groupModel: groupRepository,
  projectModel: projectRepository,
  userModel: userRepository,
};

export type InterfaceOperator = {
  uid: number | string;
  username: string;
  role?: string;
};

export type InterfaceSchemaMap = {
  add: Record<string, unknown>;
  up: Record<string, unknown>;
};

export type InterfaceSaveOptions = {
  schemas?: InterfaceSchemaMap;
  requestOrigin?: string;
};
